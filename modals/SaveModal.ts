import { Quiz } from "exports";
import { App, Modal, Setting } from "obsidian";

export class SaveModal extends Modal {
	onSubmit: (keepOrder: boolean) => void;
	keepOrder: boolean = false;

	constructor(app: App, onSubmit: (keepOrder: boolean) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Save all quizzes" });

		new Setting(contentEl).setName("Keep Order").addToggle((comp) => {
			comp.setValue(this.keepOrder).onChange(
				(value) => (this.keepOrder = value)
			);
		});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.keepOrder);
				})
		);
	}

	onClose(): void {
		let { contentEl } = this;
		contentEl.empty();
	}
}
