import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { AppError } from "../../core/error.js";
import { QUESTION_TYPES, validateAnswer } from "../../core/validation/surveyValidation.js";
import * as surveyService from "../../core/services/surveyService.js";
import * as responseService from "../../core/services/responseService.js";

const rl = readline.createInterface({ input, output });

async function ask(question) {
  return (await rl.question(question)).trim();
}

async function listSurveys() {
  const surveys = await surveyService.listAllSurveys();
  if (surveys.length === 0) {
    console.log("No surveys yet.");
    return;
  }
  for (const s of surveys) {
    console.log(`[${s.id}] ${s.title} - ${s.questions.length} questions, ${s.responseCount} responses`);
  }
}

async function viewSurvey() {
  const id = await ask("Survey id: ");
  const survey = await surveyService.getSurvey(id);
  console.log(`\n${survey.title}`);
  survey.questions.forEach((q, i) => {
    const req = q.required ? " *" : "";
    const opts = q.options ? ` (${q.options.join(" / ")})` : "";
    console.log(`  ${i + 1}. ${q.text}${req} [${q.type}]${opts}`);
  });
}

async function createSurvey() {
  const title = await ask("Survey title: ");
  const count = Number(await ask("How many questions? "));
  const questions = [];

  for (let i = 0; i < count; i++) {
    console.log(`\nQuestion ${i + 1}`);
    const text = await ask("  Text: ");
    const type = await ask(`  Type (${QUESTION_TYPES.join("/")}): `);
    const question = { text, type };
    if (type === "choice") {
      const options = await ask("  Options (comma separated): ");
      question.options = options.split(",").filter((o) => o.trim());
    }
    question.required = (await ask("  Required? (y/n): ")).toLowerCase() === "y";
    questions.push(question);
  }

  const survey = await surveyService.createSurvey({ title, questions });
  console.log(`\nSurvey created with id ${survey.id}`);
}

async function takeSurvey() {
  const id = await ask("Survey id: ");
  const survey = await surveyService.getSurvey(id);
  console.log(`\n${survey.title}`);

  const answers = [];
  for (const q of survey.questions) {
    while (true) {
      let hint = "";
      if (q.type === "choice") hint = ` (${q.options.join(" / ")})`;
      if (q.type === "rating") hint = " (1-5)";
      const req = q.required ? " *" : "";

      let value = await ask(`${q.text}${req}${hint}: `);
      if (q.type === "rating" && value !== "") value = Number(value);

      try {
        validateAnswer(q, value);
        answers.push({ questionId: q.id, value });
        break;
      } catch (err) {
        console.log(`  ${err.message}`);
      }
    }
  }

  await responseService.submitResponse(id, answers);
  console.log("\nThanks! Your response was saved.");
}

async function showResults() {
  const id = await ask("Survey id: ");
  const results = await responseService.getResults(id);
  console.log(`\n${results.title} - ${results.totalResponses} responses`);

  for (const q of results.questions) {
    console.log(`\n${q.text} (${q.answered} answered)`);
    if (q.type === "choice") {
      for (const [option, count] of Object.entries(q.counts)) {
        console.log(`  ${option}: ${count}`);
      }
    } else if (q.type === "rating") {
      console.log(`  Average: ${q.average}`);
    } else {
      q.answers.forEach((a) => console.log(`  - ${a}`));
    }
  }
}

async function deleteSurvey() {
  const id = await ask("Survey id: ");
  const confirm = await ask(`Delete survey ${id} and its responses? (y/n): `);
  if (confirm.toLowerCase() !== "y") return;
  const deleted = await surveyService.deleteSurvey(id);
  console.log(`Deleted "${deleted.title}"`);
}

const actions = {
  1: listSurveys,
  2: viewSurvey,
  3: createSurvey,
  4: takeSurvey,
  5: showResults,
  6: deleteSurvey,
};

async function main() {
  while (true) {
    console.log(`
===== Survey CLI =====
1. List surveys
2. View survey
3. Create survey
4. Take survey
5. Show results
6. Delete survey
0. Exit`);

    const choice = await ask("Choose: ");
    if (choice === "0") break;

    const action = actions[choice];
    if (!action) {
      console.log("Invalid choice");
      continue;
    }

    try {
      await action();
    } catch (err) {
      if (err instanceof AppError) {
        console.log(`Error: ${err.message}`);
      } else {
        throw err;
      }
    }
  }
  rl.close();
}

main();
