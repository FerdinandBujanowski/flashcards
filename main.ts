import { App, Plugin, PluginSettingTab, WorkspaceLeaf, Notice } from "obsidian";

import { FlashcardView, FLASHCARD_VIEW } from "views/FlashcardView";
import { QuizOverview, QUIZ_OVERVIEW } from "views/QuizOverview";
import {
	Quiz,
	Series,
	Question,
	Answer,
	Order,
	SetCommand,
	SortFunction,
	getSortFunction,
} from "exports";

interface QuizVector {
	quiz: number;
	series: number;
	question: number;
}

interface FlashcardSettings {}

const DEFAULT_SETTINGS: FlashcardSettings = {};

let app: App;
let current_vector: QuizVector = { quiz: 0, series: 0, question: 0 };
let last_questions: number[][] = [];
let quizzes: Quiz[];

let setCommand: SetCommand;
let writeQuizzes: () => void;

let flashcard_view: FlashcardView;
let quiz_overview: QuizOverview;

export default class FlashcardPlugin extends Plugin {
	settings: FlashcardSettings;

	async onload() {
		app = this.app;
		setCommand = this.setCommand;
		writeQuizzes = this.writeQuizzes;
		await this.scanQuizzes();

		this.registerView(
			FLASHCARD_VIEW,
			(leaf) =>
				new FlashcardView(app, leaf, quizzes, {
					setCommand: this.setCommand,
					answerCommand: this.answerCommand,
					saveCommand: this.saveCommand,
					orderCommand: this.orderCommand,
				})
		);
		this.registerView(
			QUIZ_OVERVIEW,
			(leaf) => new QuizOverview(leaf, quizzes, this.setCommand)
		);

		this.scanViews();

		const ribbonIconEl = this.addRibbonIcon(
			"layers-3",
			"Scan for quiz files",
			async () => {
				await this.scanQuizzes();
				await this.activateFlashcardView();
				await this.activateOverview();
				this.scanViews();
			}
		);

		this.addSettingTab(new FlashcardSettingTab(this.app, this));

		// next question
		this.addCommand({
			id: "next-question-command",
			name: "Show Next Quiz Question",
			callback: () => {
				this.setCommand(0, 0, 1);
			},
		});

		// previous question
		this.addCommand({
			id: "prev-question-command",
			name: "Show Previous Quiz Question",
			callback: () => {
				this.setCommand(0, 0, -1);
			},
		});

		// next series
		this.addCommand({
			id: "next-series-command",
			name: "Show Next Quiz Series",
			callback: () => {
				this.setCommand(0, 1, 0);
			},
		});

		// previous series
		this.addCommand({
			id: "prev-series-command",
			name: "Show Previous Quiz Series",
			callback: () => {
				this.setCommand(0, -1, 0);
			},
		});
	}

	onunload() {
		this.writeQuizzes();
		const { workspace } = this.app;
		workspace.detachLeavesOfType(FLASHCARD_VIEW);
		workspace.detachLeavesOfType(QUIZ_OVERVIEW);
	}

	async scanQuizzes() {
		let found: Quiz[] = [];
		for (let file of this.app.vault.getFiles()) {
			if (file.extension == "json") {
				await this.app.vault.read(file).then((content) => {
					try {
						const data = <Quiz>JSON.parse(content);
						let positions = [];
						data.path = file.path;
						for (let s of data.series) {
							positions.push(0);
							if (!s.order || s.order.length === 0) {
								s.order = Array.from(
									{ length: s.questions.length },
									(_, index) => index
								);
							}
						}
						last_questions.push(positions);
						found.push(data);
					} catch (error) {
						new Notice(error);
					}
				});
			}
		}
		new Notice("Found " + found.length + " quiz files");
		quizzes = found;
	}

	async writeQuizzes() {
		for (let quiz of quizzes) {
			const path = quiz.path;
			if (path) {
				const files = app.vault
					.getFiles()
					.filter((file) => file.path === path);
				if (files.length > 0) {
					const file = files[0];
					// Convert JSON object to a string
					const jsonString = JSON.stringify(quiz, null, 2); // The null and 2 arguments are for formatting

					// Write JSON string to a file
					await app.vault.modify(file, jsonString);
				}
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateFlashcardView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(FLASHCARD_VIEW);

		if (leaves.length > 0) {
			leaf = leaves[0];
			workspace.revealLeaf(leaf);
		} else {
			const activeLeaf = workspace.activeLeaf;
			if (activeLeaf) {
				leaf = workspace.getLeaf(true);
				await leaf.setViewState({ type: FLASHCARD_VIEW, active: true });

				if (leaf != null) workspace.revealLeaf(leaf);
			}
		}
	}

	async activateOverview() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(QUIZ_OVERVIEW);

		if (leaves.length > 0) {
			leaf = leaves[0];
			workspace.revealLeaf(leaf);
		} else {
			const activeLeaf = workspace.activeLeaf;
			if (activeLeaf) {
				leaf = workspace.getRightLeaf(false);
				await leaf?.setViewState({ type: QUIZ_OVERVIEW, active: true });
				if (leaf) {
					workspace.revealLeaf(leaf);
				}
			}
		}
		if (!leaf) return;
	}

	scanViews() {
		const { workspace } = this.app;

		let leaves = workspace.getLeavesOfType(FLASHCARD_VIEW);
		if (leaves.length > 0) {
			const leaf = leaves[0];
			if (leaf.view instanceof FlashcardView) {
				flashcard_view = <FlashcardView>leaf.view;
				flashcard_view.updateQuizzes(quizzes);
			}
		}

		leaves = workspace.getLeavesOfType(QUIZ_OVERVIEW);
		if (leaves.length > 0) {
			const leaf = leaves[0];
			if (leaf.view instanceof QuizOverview) {
				quiz_overview = <QuizOverview>leaf.view;
				quiz_overview.updateQuizzes(quizzes);
			}
		}
	}

	setCommand(v_quiz: number, v_series: number, v_question: number) {
		let v = current_vector;

		if (v_quiz !== 0 || v_series !== 0) {
			// save old question index
			last_questions[v.quiz][v.series] = v.question;
		}

		if (v_quiz !== 0) {
			v.quiz = (v.quiz + v_quiz + quizzes.length) % quizzes.length;
			v.series = 0;

			// restore old question index
			v.question = last_questions[v.quiz][v.series];
		} else {
			const current_quiz = quizzes[v.quiz];
			if (v_series !== 0) {
				v.series =
					(v.series + v_series + current_quiz.series.length) %
					current_quiz.series.length;

				v.question = last_questions[v.quiz][v.series];
			} else {
				if (v_question !== 0) {
					const current_series = current_quiz.series[v.series];
					v.question =
						(v.question +
							v_question +
							current_series.questions.length) %
						current_series.questions.length;
				}
			}
		}

		if (flashcard_view)
			flashcard_view.passCommand(v.quiz, v.series, v.question);
		if (quiz_overview) quiz_overview.passCommand(v.quiz, v.series);
	}

	async answerCommand(
		quiz: number,
		series: number,
		question: number,
		correct: boolean
	) {
		const current_question =
			quizzes[quiz].series[series].questions[question];
		const current_success = current_question.success;
		if (!current_success) {
			current_question.success = [correct];
		} else if (current_success.length < 5) {
			current_question.success = current_success.concat([correct]);
		} else {
			current_question.success = current_success
				.splice(1, 5)
				.concat([correct]);
		}

		setCommand(0, 0, 0);
	}

	saveCommand(keepOrder: boolean) {
		quizzes.forEach((quiz, q_index) => {
			quiz.series.forEach((s, s_index) => {
				if (s.order && keepOrder) {
					const last_question = last_questions[q_index][s_index];
					s.order = s.order
						.slice(last_question, s.order.length)
						.concat(s.order.slice(0, last_question));
				} else {
					s.order = [];
				}
			});
		});
		writeQuizzes();
	}

	orderCommand(
		quiz: Quiz,
		s_index: number,
		primary: Order,
		secondary: Order
	) {
		const primarySortFunction: SortFunction = getSortFunction(primary);
		const secondarySortFunction: SortFunction = getSortFunction(secondary);

		const series = quiz.series[s_index];
		if (!series.order) return;
		const currentQuestion = series.order[current_vector.question];
		const currentPosition = series.order.indexOf(currentQuestion);

		series.order.sort(
			(a, b) =>
				primarySortFunction(series, a) - primarySortFunction(series, b)
		);

		if (primary !== Order.RANDOM && primary !== Order.DEFAULT) {
			let parts = [[series.order[0]]];
			for (let i = 1; i < series.order.length; i++) {
				const currentIndex = series.order[i];
				const lastIndex = series.order[i - 1];

				if (
					primarySortFunction(series, currentIndex) !==
					primarySortFunction(series, lastIndex)
				) {
					parts.push([currentIndex]);
				} else {
					parts[parts.length - 1].push(currentIndex);
				}
			}

			series.order = parts
				.map((part) =>
					part.sort(
						(a, b) =>
							secondarySortFunction(series, a) -
							secondarySortFunction(series, b)
					)
				)
				.flat();
		}

		setCommand(0, 0, -currentPosition);
	}
}

class FlashcardSettingTab extends PluginSettingTab {
	plugin: FlashcardPlugin;

	constructor(app: App, plugin: FlashcardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// add new settings
	}
}
