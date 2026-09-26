import { ValidationError } from "../error.js";

export const QUESTION_TYPES = ["text", "choice", "rating"];

export function validateSurvey(input) {
  if (!input.title || !input.title.trim()) {
    throw new ValidationError("Title is required");
  }
  if (!input.questions || input.questions.length === 0) {
    throw new ValidationError("Survey needs at least one question");
  }
  input.questions.forEach((q, i) => validateQuestion(q, i));
}

function validateQuestion(q, i) {
  const label = `Question ${i + 1}`;
  if (!q.text || !q.text.trim()) {
    throw new ValidationError(`${label}: text is required`);
  }
  if (!QUESTION_TYPES.includes(q.type)) {
    throw new ValidationError(`${label}: type must be ${QUESTION_TYPES.join(", ")}`);
  }
  if (q.type === "choice" && (!q.options || q.options.length < 2)) {
    throw new ValidationError(`${label}: choice needs at least 2 options`);
  }
}

export function validateAnswer(question, value) {
  if (value === "" || value === undefined) {
    if (question.required) {
      throw new ValidationError(`"${question.text}" is required`);
    }
    return;
  }
  if (question.type === "choice" && !question.options.includes(value)) {
    throw new ValidationError(`Pick one of: ${question.options.join(", ")}`);
  }
  if (question.type === "rating") {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new ValidationError("Rating must be a number between 1 and 5");
    }
  }
}
