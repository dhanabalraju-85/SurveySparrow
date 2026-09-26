import { validateAnswer } from "../validation/surveyValidation.js";
import { getSurvey } from "./surveyService.js";
import * as responseRepo from "../../repositories/file/responseRepository.js";

export async function submitResponse(surveyId, answers) {
  const survey = await getSurvey(surveyId);
  for (const question of survey.questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    validateAnswer(question, answer?.value);
  }
  return responseRepo.saveResponse({ surveyId, answers });
}

export async function getResults(surveyId) {
  const survey = await getSurvey(surveyId);
  const responses = await responseRepo.findResponsesBySurveyId(surveyId);

  const questions = survey.questions.map((question) => {
    const values = responses
      .map((r) => r.answers.find((a) => a.questionId === question.id)?.value)
      .filter((v) => v !== undefined && v !== "");

    const result = { text: question.text, type: question.type, answered: values.length };

    if (question.type === "choice") {
      result.counts = {};
      for (const option of question.options) {
        result.counts[option] = values.filter((v) => v === option).length;
      }
    } else if (question.type === "rating") {
      const total = values.reduce((sum, v) => sum + v, 0);
      result.average = values.length ? (total / values.length).toFixed(1) : "-";
    } else {
      result.answers = values;
    }
    return result;
  });

  return { title: survey.title, totalResponses: responses.length, questions };
}
