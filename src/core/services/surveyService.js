import { NotFoundError } from "../error.js";
import { validateSurvey } from "../validation/surveyValidation.js";
import * as surveyRepo from "../../repositories/file/surveyRepository.js";
import * as responseRepo from "../../repositories/file/responseRepository.js";

export async function listAllSurveys() {
  const surveys = await surveyRepo.findAllSurveys();
  const result = [];
  for (const survey of surveys) {
    const responseCount = await responseRepo.countResponsesBySurveyId(
      survey.id,
    );
    result.push({ ...survey, responseCount });
  }
  return result;
}

export async function getSurvey(id) {
  const survey = await surveyRepo.findById(id);
  if (!survey) {
    throw new NotFoundError(`Survey ${id} not found`);
  }
  return survey;
}

export async function createSurvey(input) {
  validateSurvey(input);
  const cleaned = {
    title: input.title.trim(),
    questions: input.questions.map((q, i) => cleanQuestion(q, i)),
  };
  return surveyRepo.saveSurvey(cleaned);
}

export async function deleteSurvey(id) {
  const deleted = await surveyRepo.deleteSurvey(id);
  if (!deleted) {
    throw new NotFoundError(`Survey ${id} not found`);
  }
  return deleted;
}

function cleanQuestion(q, i) {
  const question = {
    id: `q${i + 1}`,
    text: q.text.trim(),
    type: q.type,
    required: Boolean(q.required),
  };
  if (q.type === "choice") {
    question.options = q.options.map((o) => o.trim());
  }
  return question;
}
