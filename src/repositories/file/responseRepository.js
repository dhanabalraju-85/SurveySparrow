import { read, write } from "./fileStore.js";
import { generateId } from "../../utils/id.js";

export async function saveResponse(response) {
  const data = await read();
  const newResponse = {
    id: generateId(),
    surveyId: response.surveyId,
    answers: response.answers,
    submittedAt: new Date().toISOString(),
  };
  data.responses.push(newResponse);
  await write(data);
  return newResponse;
}

export async function findResponsesBySurveyId(surveyId) {
  const data = await read();
  return data.responses.filter((res) => res.surveyId === surveyId);
}

export async function countResponsesBySurveyId(surveyId) {
  const responses = await findResponsesBySurveyId(surveyId);
  return responses.length;
}
