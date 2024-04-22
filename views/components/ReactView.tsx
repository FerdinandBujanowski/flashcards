import FlashCard from "./FlashCard";

function ReactView(app: any) {
	return (
		<>
			<div className="root">
				<h1>Flashcard View!</h1>
				<FlashCard
					question="deine mamer"
					answers={[
						"Answer One",
						"Answer Two",
						"Answer Three",
						"Answer Four",
					]}
					correct={2}
				/>
			</div>
		</>
	);
}

export default ReactView;
