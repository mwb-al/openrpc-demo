import fs from 'fs';

export function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Unable to read or parse "${filePath}":`, err);
    process.exit(1);
  }
}

export function writeJson(filePath, data, indent = 2) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, indent), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Unable to write to "${filePath}":`, err);
    process.exit(1);
  }
}
