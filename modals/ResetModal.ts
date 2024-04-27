import { Quiz } from "exports";
import { App, Modal, Setting } from "obsidian";

export class ResetModal extends Modal {
	onSubmit: () => void;

	constructor(app: App, onSubmit: () => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Erase all series progress?" });

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Proceed")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit();
				})
		);
	}

	onClose(): void {
		let { contentEl } = this;
		contentEl.empty();
	}
}
