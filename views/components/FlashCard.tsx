import Answer from "./Answer";
import { useState } from "react";

interface FlashcardProps {
	question: string;
	answers: string[];
	correct: number;
}

function FlashCard({ question, answers, correct }: FlashcardProps) {
	const [reveal, setReveal] = useState(-1);

	const clickAnswer = (index: number) => {
		setReveal(index);
	};

	return (
		<>
			<article className="flashcard">
				<div className="flashcard-header">
					<div className="flashcard-header-top">
						<div className="header-top-left">Test1</div>
						<div className="header-top-center">Test</div>
						<div className="header-top-right">Test3</div>
					</div>
					<div className="flashcard-header-text">{question}</div>
				</div>
				<div className="flashcard-answers">
					<section className="to-do-text">
						<div className="to-do-text-container">
							Choose matching definition
						</div>
					</section>
					<div className="multiple-choice">
						{answers.map((text, index) => {
							return (
								<Answer
									answer={text}
									index={index}
									clickFunction={clickAnswer}
									correct={reveal !== -1 && index === correct}
									wrong={index === reveal}
								/>
							);
						})}
					</div>
				</div>
			</article>
		</>
	);
}

export default FlashCard;
