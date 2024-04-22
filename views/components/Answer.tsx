interface AnswerProps {
	answer: String;
	index: number;
	clickFunction: (index: number) => void;
	correct: boolean;
	wrong: boolean;
}

function Answer({ answer, index, clickFunction, correct, wrong }: AnswerProps) {
	return (
		<>
			<section
				className={
					//"answer" + " correct"
					"answer" + (correct ? " correct" : wrong ? " wrong" : "")
				}
				onClick={() => clickFunction(index)}
			>
				<div className="answer-number">{index + 1}</div>
				<div className="answer-text">{answer}</div>
			</section>
		</>
	);
}

export default Answer;
