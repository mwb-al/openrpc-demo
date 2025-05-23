import fs from 'fs';

export function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Unable to read or parse "${filePath}":`, err);
    process.exit(1);
  }
}
