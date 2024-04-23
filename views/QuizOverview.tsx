import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import { Quiz, Series, Question, Answer } from "interfaces";
import QuizList from "../views/quiz_overview/QuizList";

export const QUIZ_OVERVIEW = "quiz-overview";

export class QuizOverview extends ItemView {
	root: Root | null = null;
	quizzes: Quiz[];
	change_vector: number[] = [0, 0];

	constructor(leaf: WorkspaceLeaf, quizzes: Quiz[]) {
		super(leaf);
		this.quizzes = quizzes;
	}

	getViewType(): string {
		return QUIZ_OVERVIEW;
	}

	getDisplayText(): string {
		return "Quiz Overview";
	}

	getIcon(): string {
		return "layers-3";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<QuizList quizzes={this.quizzes} />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount;
	}

	async passCommand(quiz_index: number, series_index: number) {
		this.change_vector = [quiz_index, series_index];

		this.root?.render(
			<StrictMode>
				<QuizList
					quizzes={this.quizzes}
					change_vector={this.change_vector}
				/>
			</StrictMode>
		);
	}
}
