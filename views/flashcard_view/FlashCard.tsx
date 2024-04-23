import Answer from "./Answer";
import { useEffect, useState } from "react";

interface FlashcardProps {
	quiz: string;
	series: string;
	question: string;
	q_index: [number, number];
	answers: string[];
	correct: number;
	explanation?: string;
}

function FlashCard({
	quiz,
	series,
	question,
	q_index,
	answers,
	correct,
	explanation,
}: FlashcardProps) {
	const [reveal, setReveal] = useState(-1);

	const clickAnswer = (index: number) => {
		if (reveal === -1) setReveal(index);
	};

	useEffect(() => {
		setReveal(-1);
	}, [question]);

	const explanation_mode = reveal !== -1 && explanation;

	return (
		<>
			<article className="flashcard">
				<div className="flashcard-header">
					<div className="flashcard-header-top">
						<div className="header-top-left">{series}</div>
						<div className="header-top-center">{quiz}</div>
						<div className="header-top-right">
							Question {q_index[0] + 1} of {q_index[1]}
						</div>
					</div>
					<div
						className={
							"flashcard-header-text" + explanation_mode
								? " expl"
								: ""
						}
						dangerouslySetInnerHTML={{
							__html: explanation_mode ? explanation : question,
						}}
					/>
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
									key={index}
									text={text}
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
