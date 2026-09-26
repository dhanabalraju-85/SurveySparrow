import {
  saveResponse,
  findResponsesBySurveyId,
  countResponsesBySurveyId,
} from "./src/repositories/file/responseRepository.js";

console.log("s1 count:", await countResponsesBySurveyId("s1"));
console.log("xyz count:", await countResponsesBySurveyId("xyz"));

const saved = await saveResponse({
  surveyId: "s2",
  answers: [
    { questionId: "q1", value: "1" },
    { questionId: "q2", value: 2 },
    { questionId: "q3", value: "" },
  ],
});
console.log("Saved:", saved);

console.log("s2 responses:", await findResponsesBySurveyId("s2"));
