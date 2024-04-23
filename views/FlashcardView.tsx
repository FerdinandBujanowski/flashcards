import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import FlashCardContainer from "./flashcard_view/FlashCardContainer";
import { Quiz, Series, Question, Answer } from "interfaces";

export const FLASHCARD_VIEW = "flashcard-view";

export class FlashcardView extends ItemView {
	root: Root | null = null;
	quizzes: Quiz[];
	change_vector: number[] = [0, 0, 0];

	constructor(leaf: WorkspaceLeaf, quizzes: Quiz[]) {
		super(leaf);
		this.quizzes = quizzes;
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
				<FlashCardContainer key="react_view" quizzes={this.quizzes} />
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
					key="react_view"
					quizzes={this.quizzes}
					change_vector={this.change_vector}
				/>
			</StrictMode>
		);
	}
}
