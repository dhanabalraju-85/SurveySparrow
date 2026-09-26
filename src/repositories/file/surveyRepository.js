import { read, write } from "./fileStore.js";
import { generateId } from "../../utils/id.js";

export async function findAllSurveys() {
  const data = await read();
  return data.surveys;
}

export async function findById(id) {
  const data = await read();
  return data.surveys.find((s) => s.id === id) ?? null;
}

export async function saveSurvey(survey) {
  const data = await read();
  const newSurvey = {
    id: generateId(),
    title: survey.title,
    questions: survey.questions,
    createdAt: new Date().toISOString(),
  };
  data.surveys.push(newSurvey);
  await write(data);
  return newSurvey;
}

export async function updateSurvey(id, survey) {
  const data = await read();
  const index = data.surveys.findIndex((s) => s.id === id);
  if (index === -1) {
    return null;
  }
  const updated = {
    ...data.surveys[index],
    ...survey,
    id,
    createdAt: data.surveys[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  data.surveys[index] = updated;
  await write(data);
  return updated;
}

export async function deleteSurvey(id) {
  const data = await read();
  const index = data.surveys.findIndex((s) => s.id === id);

  if (index === -1) {
    return null;
  }

  const [deleted] = data.surveys.splice(index, 1);
  data.responses = data.responses.filter((r) => r.surveyId !== id);
  await write(data);
  return deleted;
}
