import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_PATH = path.join(import.meta.dirname, "../../../data/db.json");

export async function write(value) {
  const text = JSON.stringify(value, null, 2);
  await writeFile(DATA_PATH, text, "utf8");
}

export async function read() {
  const text = await readFile(DATA_PATH, "utf8");
  return JSON.parse(text);
}
