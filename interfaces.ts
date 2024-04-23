export interface Answer {
	text: string;
	correct?: boolean;
}

export interface Question {
	name: string;
	answers: Answer[];
	explanation?: string;
}

export interface Series {
	name: string;
	questions: Question[];
}

export interface Quiz {
	name: string;
	series: Series[];
}
