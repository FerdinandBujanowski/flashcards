import { App, ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import FlashCardContainer from "./flashcard_view/FlashCardContainer";
import { AnswerCommand, Commands, Quiz } from "exports";

export const FLASHCARD_VIEW = "flashcard-view";

export class FlashcardView extends ItemView {
	root: Root | null = null;
	app: App;
	quizzes: Quiz[];
	change_vector: number[] = [0, 0, 0];
	commands: Commands;

	constructor(
		app: App,
		leaf: WorkspaceLeaf,
		quizzes: Quiz[],
		commands: Commands
	) {
		super(leaf);
		this.app = app;
		this.quizzes = quizzes;
		this.commands = commands;
	}

	getViewType() {
		return FLASHCARD_VIEW;
	}

	getDisplayText() {
		return "Flashcard View";
	}

	getIcon(): string {
		return "layers-3";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<FlashCardContainer
					app={this.app}
					key="react_view"
					quizzes={this.quizzes}
					commands={this.commands}
				/>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount;
	}

	async passCommand(
		quiz_index: number,
		series_index: number,
		question_index: number
	) {
		this.change_vector = [quiz_index, series_index, question_index];

		this.root?.render(
			<StrictMode>
				<FlashCardContainer
					app={this.app}
					key="react_view"
					quizzes={this.quizzes}
					change_vector={this.change_vector}
					commands={this.commands}
				/>
			</StrictMode>
		);
	}

	updateQuizzes(quizzes: Quiz[]) {
		this.quizzes = quizzes;
		this.passCommand(0, 0, 0);
	}
}
