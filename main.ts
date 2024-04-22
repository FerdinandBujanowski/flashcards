import { App, Plugin, PluginSettingTab, WorkspaceLeaf } from "obsidian";

import { FlashcardView, FLASHCARD_VIEW } from "views/FlashcardView";

interface FlashcardSettings {}

const DEFAULT_SETTINGS: FlashcardSettings = {};

export default class FlashcardPlugin extends Plugin {
	settings: FlashcardSettings;

	async onload() {
		this.registerView(FLASHCARD_VIEW, (leaf) => new FlashcardView(leaf));
		const ribbonIconEl = this.addRibbonIcon(
			"layers-3",
			"Open Quizzer",
			() => {
				// Called when the user clicks the icon.
				this.activateFlashcardView();
			}
		);
	}

	onunload() {}

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
				leaf = workspace.createLeafBySplit(activeLeaf, "vertical");
				await leaf.setViewState({ type: FLASHCARD_VIEW, active: true });
				if (leaf != null) workspace.revealLeaf(leaf);
			}
		}

		// workspace.revealLeaf();
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
