import {
	Question,
	Quiz,
	Series,
	getQuestionAccuracy,
	getQuestionScore,
	getQuestionStatus,
	getSeriesAccuracy,
	getUnansweredQuestions,
} from "exports";

interface StatisticsProps {
	quizzes: Quiz[];
	quiz_index: number;
	series_index: number;
	question_index: number;
}

function QuizStatistics({
	quizzes,
	quiz_index,
	series_index,
	question_index,
}: StatisticsProps) {
	if (!quizzes) return <></>;

	const currentQuiz: Quiz = quizzes[quiz_index];
	const currentSeries: Series = currentQuiz.series[series_index];
	const currentQuestion: Question = currentSeries.questions[question_index];
	const currentStat: boolean[] =
		currentQuestion.success !== undefined ? currentQuestion.success : [];

	const getBoxes = (): JSX.Element[] => {
		const boxes: JSX.Element[] = [];

		// times still unanswered
		let counter = currentStat.length;
		while (counter < 5) {
			boxes.push(<div className="box undefined" />);
			counter++;
		}

		// actual tries
		currentStat.forEach((success) => {
			boxes.push(
				<div className={"box" + (success ? " correct" : " wrong")} />
			);
		});

		return boxes;
	};

	return (
		<>
			<table>
				<tr>
					<th>Current Question</th>
					<th>Current Series</th>
					<th>Current Quiz</th>
				</tr>
				<tr>
					<td>{<div className="boxes">{getBoxes()}</div>}</td>
					<td>
						Unanswered Questions :{" "}
						{getUnansweredQuestions([currentSeries]).length}
					</td>
					<td>
						Unanswered Questions :{" "}
						{getUnansweredQuestions(currentQuiz.series).length}
					</td>
				</tr>
				<tr>
					<td>
						Accuracy :
						{" " +
							(
								getQuestionAccuracy(currentQuestion) * 100
							).toFixed(2) +
							"%"}
					</td>
					<td>
						Overall accuracy :
						{" " +
							(getSeriesAccuracy([currentSeries]) * 100).toFixed(
								2
							) +
							"%"}
					</td>
					<td>
						Overall accuracy :
						{" " +
							(
								getSeriesAccuracy(currentQuiz.series) * 100
							).toFixed(2) +
							"%"}
					</td>
				</tr>
				<tr>
					<td>
						Question status : {getQuestionStatus(currentQuestion)}
					</td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td>
						Question score : {getQuestionScore(currentQuestion)}
					</td>
				</tr>
			</table>
		</>
	);
}

export default QuizStatistics;
