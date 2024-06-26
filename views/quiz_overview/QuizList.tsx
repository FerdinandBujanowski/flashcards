import { useState, useEffect } from "react";
import { Quiz, SetCommand } from "exports";

interface QuizListProps {
	quizzes: Quiz[];
	change_vector?: number[];
	setCommand: SetCommand;
}
function QuizList({ quizzes, change_vector, setCommand }: QuizListProps) {
	const [selectedQuiz, setSelectedQuiz] = useState(
		quizzes ? (quizzes.length > 0 ? 0 : -1) : -1
	);
	const [currentSeries, setCurrentSeries] = useState(0);

	useEffect(() => {
		if (change_vector) {
			const [quiz_index, series_index] = change_vector;
			setSelectedQuiz(quiz_index);
			setCurrentSeries(series_index);
		}
	}, [change_vector]);

	if (!quizzes) return <></>;

	return (
		<>
			<h1>Quiz Overview</h1>
			<ul className="quiz-list">
				{quizzes.map((quiz, quiz_index) => (
					<li key={quiz_index}>
						<div
							className={
								"quiz" +
								(quiz_index === selectedQuiz ? " selected" : "")
							}
							onClick={() => {
								setCommand(quiz_index - selectedQuiz, 0, 0);
							}}
						>
							{quiz.name}
						</div>
						{quiz.series && (
							<ul className="series-list">
								{quiz.series.map((series, series_index) => (
									<li key={series_index} className="series">
										<div
											className={
												series_index ===
													currentSeries &&
												selectedQuiz === quiz_index
													? "selected"
													: ""
											}
											onClick={() => {
												if (selectedQuiz !== quiz_index)
													return;
												setCommand(
													0,
													series_index -
														currentSeries,
													0
												);
											}}
										>
											{series.name}
										</div>
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</>
	);
}

export default QuizList;
