import { useState, useEffect } from "react";
import FlashCard from "./FlashCard";
import { AnswerCommand, Commands, Order, Quiz, SetCommand } from "exports";
import QuizStatistics from "./QuizStatistics";
import { SaveModal } from "modals/SaveModal";
import { App, Notice } from "obsidian";
import { OrderModal } from "modals/OrderModal";
import { ResetModal } from "modals/ResetModal";

interface ReactViewProps {
	app: App;
	quizzes: Quiz[];
	change_vector?: number[];
	commands: Commands;
}

function FlashCardContainer({
	app,
	quizzes,
	change_vector,
	commands,
}: ReactViewProps) {
	const [selectedQuiz, setSelectedQuiz] = useState(
		quizzes ? (quizzes.length > 0 ? 0 : -1) : -1
	);
	const [currentSeries, setCurrentSeries] = useState(0);
	const [currentQuestion, setCurrentQuestion] = useState(0);

	useEffect(() => {
		if (change_vector) {
			const [quiz_index, series_index, question_index] = change_vector;
			setSelectedQuiz(quiz_index);
			setCurrentSeries(series_index);
			const order = quizzes[quiz_index].series[series_index].order;
			setCurrentQuestion(order ? order[question_index] : question_index);
		}
	}, [change_vector]);

	const quiz = selectedQuiz !== -1 ? quizzes[selectedQuiz] : undefined;
	if (!quiz) {
		return <h1>No Quiz found :(</h1>;
	}
	const series = quiz.series[currentSeries];
	const question = series.questions[currentQuestion];
	const correctAnswer = question?.answers.find((answer) => answer.correct);

	let correct = correctAnswer
		? question?.answers.indexOf(correctAnswer)
		: undefined;
	if (!correct) correct = 0;

	const nextQuestion = () => {
		commands.setCommand(0, 0, 1);
	};
	const prevQuestion = () => {
		commands.setCommand(0, 0, -1);
	};
	const nextSeries = () => {
		commands.setCommand(0, 1, 0);
	};
	const prevSeries = () => {
		commands.setCommand(0, -1, 0);
	};

	return (
		<>
			<div className="header">
				<button onClick={prevSeries}>Previous Series</button>
				<button onClick={nextSeries}>Next Series</button>
				<button onClick={prevQuestion}>Previous Question</button>
				<button onClick={nextQuestion}>Next Question</button>
				<button
					onClick={() => {
						new SaveModal(app, (keepOrder) => {
							commands.saveCommand(keepOrder);
						}).open();
					}}
				>
					Save Progress
				</button>
				<button
					onClick={() => {
						new ResetModal(app, () => {
							for (let question of series.questions) {
								question.success = [];
							}
							commands.setCommand(0, 0, 0);
						}).open();
					}}
				>
					Wipe Progress
				</button>
				<button
					onClick={() => {
						//TODO create modal with params
						new OrderModal(app, (primary, secondary) => {
							commands.orderCommand(
								quiz,
								currentSeries,
								primary,
								secondary
							);
						}).open();
					}}
				>
					Set Order
				</button>
			</div>
			<div className="root">
				<br />
				{selectedQuiz !== -1 && (
					<>
						<FlashCard
							quiz={quiz.name}
							series={series ? series?.name : ""}
							question={question ? question.name : ""}
							q_index={[
								currentQuestion,
								series ? series?.questions.length : 0,
							]}
							// TODO this is ugly
							quiz_series={[selectedQuiz, currentSeries]}
							answers={
								question
									? question.answers.map(
											(answer) => answer.text
									  )
									: [""]
							}
							correct={correct}
							explanation={question?.explanation}
							answerCommand={commands.answerCommand}
						/>

						<QuizStatistics
							quizzes={quizzes}
							quiz_index={selectedQuiz}
							series_index={currentSeries}
							question_index={currentQuestion}
						/>
					</>
				)}
			</div>
		</>
	);
}

export default FlashCardContainer;
