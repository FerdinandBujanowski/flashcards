import { Order, getOrderFromString } from "exports";
import { App, Modal, Setting } from "obsidian";

export class OrderModal extends Modal {
	primary: Order = Order.DEFAULT;
	secondary: Order = Order.DEFAULT;
	record: Record<string, string> = {};

	onSubmit: (primary: Order, secondary: Order) => void;

	constructor(
		app: App,
		onSubmit: (primary: Order, secondary: Order) => void
	) {
		super(app);
		this.onSubmit = onSubmit;

		const keys = Object.keys(Order);
		const values = Object.values(Order);
		keys.forEach((key, index) => (this.record[key] = values[index]));
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Change Order" });

		new Setting(contentEl).setName("Primary Order").addDropdown((comp) => {
			comp.addOptions(this.record).onChange((value) => {
				this.primary = getOrderFromString(this.record[value]);
			});
		});

		new Setting(contentEl)
			.setName("Secondary Order")
			.addDropdown((comp) => {
				comp.addOptions(this.record).onChange((value) => {
					this.secondary = getOrderFromString(this.record[value]);
				});
			});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.primary, this.secondary);
				})
		);
	}

	onClose(): void {
		let { contentEl } = this;
		contentEl.empty();
	}
}
