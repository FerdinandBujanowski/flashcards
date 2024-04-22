import { App, Plugin, PluginSettingTab } from "obsidian";

// Remember to rename these classes and interfaces!

interface FlashcardSettings {}

const DEFAULT_SETTINGS: FlashcardSettings = {};

export default class FlashcardPlugin extends Plugin {
	settings: FlashcardSettings;

	async onload() {}

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
