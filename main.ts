import { App, Plugin, PluginSettingTab, WorkspaceLeaf, Notice } from "obsidian";

import { FlashcardView, FLASHCARD_VIEW } from "views/FlashcardView";
import { QuizOverview, QUIZ_OVERVIEW } from "views/QuizOverview";
import { Quiz, Series, Question, Answer } from "interfaces";

interface QuizVector {
	quiz: number;
	series: number;
	question: number;
}

interface FlashcardSettings {}

const DEFAULT_SETTINGS: FlashcardSettings = {};

export default class FlashcardPlugin extends Plugin {
	settings: FlashcardSettings;
	quizzes: Quiz[];
	current_vector: QuizVector = { quiz: 0, series: 0, question: 0 };

	async onload() {
		await this.scanQuizzes();

		this.registerView(
			FLASHCARD_VIEW,
			(leaf) => new FlashcardView(leaf, this.quizzes)
		);
		this.registerView(
			QUIZ_OVERVIEW,
			(leaf) => new QuizOverview(leaf, this.quizzes)
		);
		const ribbonIconEl = this.addRibbonIcon(
			"layers-3",
			"Open Quizzer",
			async () => {
				await this.scanQuizzes();
				this.activateFlashcardView();
				this.activateOverview();
			}
		);

		this.addSettingTab(new FlashcardSettingTab(this.app, this));

		// next question
		this.addCommand({
			id: "next-question-command",
			name: "Show Next Quiz Question",
			callback: () => {
				this.passQuizCommand(0, 0, 1);
			},
		});

		// previous question
		this.addCommand({
			id: "prev-question-command",
			name: "Show Previous Quiz Question",
			callback: () => {
				this.passQuizCommand(0, 0, -1);
			},
		});

		// next series
		this.addCommand({
			id: "next-series-command",
			name: "Show Next Quiz Series",
			callback: () => {
				this.passQuizCommand(0, 1, 0);
			},
		});

		// previous series
		this.addCommand({
			id: "prev-series-command",
			name: "Show Previous Quiz Series",
			callback: () => {
				this.passQuizCommand(0, -1, 0);
			},
		});
	}

	onunload() {}

	async scanQuizzes() {
		let quizzes: Quiz[] = [];
		for (let file of this.app.vault.getFiles()) {
			if (file.extension == "json") {
				await this.app.vault.read(file).then((content) => {
					const data = <Quiz>JSON.parse(content);
					quizzes.push(data);
				});
			}
		}
		new Notice("Found " + quizzes.length + " quiz files");
		this.quizzes = quizzes;
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
				if (leaf != null) workspace.revealLeaf(leaf);
			}
		}
	}

	passQuizCommand(v_quiz: number, v_series: number, v_question: number) {
		let v = this.current_vector;

		if (v_quiz !== 0) {
			v.quiz =
				(v_quiz + v_quiz + this.quizzes.length) % this.quizzes.length;
			v.series = 0;
			v.question = 0;
		} else {
			const current_quiz = this.quizzes[v.quiz];
			if (v_series !== 0) {
				v.series =
					(v.series + v_series + current_quiz.series.length) %
					current_quiz.series.length;
				v.question = 0;
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

		const { workspace } = this.app;
		let leaves = workspace.getLeavesOfType(FLASHCARD_VIEW);

		if (leaves.length > 0) {
			const leaf = leaves[0];
			if (leaf.view instanceof FlashcardView) {
				const flashcard_view = <FlashcardView>leaf.view;

				flashcard_view.passCommand(v.quiz, v.series, v.question);
			}
		}

		leaves = workspace.getLeavesOfType(QUIZ_OVERVIEW);

		if (leaves.length > 0) {
			const leaf = leaves[0];
			if (leaf.view instanceof QuizOverview) {
				const quiz_overview = <QuizOverview>leaf.view;

				quiz_overview.passCommand(v.quiz, v.series);
			}
		}
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
