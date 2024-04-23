import { useState, useEffect } from "react";
import FlashCard from "./FlashCard";
import { Quiz, Series, Question, Answer } from "interfaces";

interface ReactViewProps {
	quizzes: Quiz[];
	change_vector?: number[];
}

function FlashCardContainer({ quizzes, change_vector }: ReactViewProps) {
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
			setCurrentQuestion(question_index);
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
		setCurrentQuestion((currentQuestion + 1) % series.questions.length);
	};
	const prevQuestion = () => {
		setCurrentQuestion(
			(currentQuestion + series.questions.length - 1) %
				series.questions.length
		);
	};
	const nextSeries = () => {
		setCurrentSeries((currentSeries + 1) % quiz.series.length);
		setCurrentQuestion(0);
	};
	const prevSeries = () => {
		setCurrentSeries(
			(currentSeries - 1 + quiz.series.length) % quiz.series.length
		);
		setCurrentQuestion(0);
	};

	return (
		<>
			<div className="header">
				<button onClick={prevSeries}>Previous Series</button>
				<button onClick={nextSeries}>Next Series</button>
				<button onClick={prevQuestion}>Previous Question</button>
				<button onClick={nextQuestion}>Next Question</button>
			</div>
			<div className="root">
				<br />
				{selectedQuiz !== -1 && (
					<FlashCard
						quiz={quiz.name}
						series={series ? series?.name : ""}
						question={question ? question.name : ""}
						q_index={[
							currentQuestion,
							series ? series?.questions.length : 0,
						]}
						answers={
							question
								? question.answers.map((answer) => answer.text)
								: [""]
						}
						correct={correct}
						explanation={question?.explanation}
					/>
				)}
			</div>
		</>
	);
}

export default FlashCardContainer;
