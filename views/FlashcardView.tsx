import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import ReactView from "./ReactView";

export const FLASHCARD_VIEW = "flashcard-view";

export class FlashcardView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return FLASHCARD_VIEW;
	}

	getDisplayText() {
		return "Flashcard View";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<ReactView />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount;
	}
}
