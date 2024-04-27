export interface Answer {
	text: string;
	correct?: boolean;
}

export interface Question {
	name: string;
	answers: Answer[];
	explanation?: string;
	success?: boolean[];
}

export interface Series {
	name: string;
	questions: Question[];
	order?: number[];
}

export interface Quiz {
	name: string;
	series: Series[];
	path?: string;
}

export enum Order {
	DEFAULT = "Default Order",
	SCORE_ASC = "Ascending Score",
	SCORE_DESC = "Descending Score",
	RANDOM = "Random",
}

export interface SetCommand {
	(quiz: number, series: number, question: number): void;
}

export interface AnswerCommand {
	(quiz: number, series: number, question: number, correct: boolean): void;
}

export interface SaveCommand {
	(keepOrder: boolean): void;
}

export interface OrderCommand {
	(quiz: Quiz, s_index: number, primary: Order, secondary: Order): void;
}

export interface Commands {
	setCommand: SetCommand;
	answerCommand: AnswerCommand;
	saveCommand: SaveCommand;
	orderCommand: OrderCommand;
}

/**STATISTICS */

export const getUnansweredQuestions = (series: Series[]): Question[] => {
	return series
		.map((s) =>
			s.questions.filter((q) => !q.success || q.success.length === 0)
		)
		.flat();
};

export const getQuestionAccuracy = (question: Question): number => {
	if (!question.success || question.success.length === 0) return 0;
	return question.success.filter((s) => s).length / question.success.length;
};

export const getSeriesAccuracy = (series: Series[]): number => {
	let sum_s = 0;
	series.forEach((s) => {
		let sum_q = 0;
		s.questions.forEach((q) => {
			sum_q += getQuestionAccuracy(q);
		});
		sum_s += sum_q / s.questions.length;
	});
	return sum_s / series.length;
};

export const getQuestionStatus = (question: Question): string => {
	const success = question.success;
	if (!success) return "NOT ANSWERED";
	const correct = success.filter((s) => s);
	const wrong = success.filter((s) => !s);
	if (correct.length === 5) return "PERFECT";
	if (correct.length === success.length) return "GOOD";
	if (wrong.length === 5) return "HORRIBLE";
	if (wrong.length === success.length) return "BAD";

	if (success.length >= 2) {
		const lastTwo = [
			success[success.length - 2],
			success[success.length - 1],
		];
		if (lastTwo[0]) {
			if (lastTwo[1]) return "GETTING THERE";
			return "FALLING";
		} else {
			if (lastTwo[1]) return "RISING";
			return "WRONG WAY";
		}
	}

	return "";
};

export const getQuestionScore = (question: Question): number => {
	const success = question.success;
	if (!success) return -5;

	const last: boolean = success[success.length - 1];
	const score = success.filter((s) => s).length;
	return last ? score : -5 + score;
};

export interface SortFunction {
	(series: Series, index: number): number;
}

export const getSortFunction = (order: Order): SortFunction => {
	switch (order) {
		case Order.RANDOM:
			return () => Math.random();
		case Order.SCORE_ASC:
			return (series, index) => getQuestionScore(series.questions[index]);
		case Order.SCORE_DESC:
			return (series, index) =>
				-getQuestionScore(series.questions[index]);
		case Order.DEFAULT:
			return (series, index) => index;
	}
};

export const getOrderFromString = (name: string): Order => {
	switch (name) {
		case Order.DEFAULT:
			return Order.DEFAULT;
		case Order.SCORE_ASC:
			return Order.SCORE_ASC;
		case Order.SCORE_DESC:
			return Order.SCORE_DESC;
		case Order.RANDOM:
			return Order.RANDOM;
		default:
			return Order.DEFAULT;
	}
};
