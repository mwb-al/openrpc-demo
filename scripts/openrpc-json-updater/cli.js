import { readJson, writeJson } from './utils/file.utils.js';
import { mergeDocuments } from './operations/merge.js';
import { generateReport } from './operations/report.js';
import { prepareDocuments } from './operations/prepare.js';

const originalFilePath = './original-openrpc.json';
const modifiedFilePath = './modified-openrpc.json';

const originalJson = readJson(originalFilePath);
const modifiedJson = readJson(modifiedFilePath);

function parseArgs() {
  const argv = process.argv.slice(2);
  const result = { mergeFlag: false };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '-g':
      case '--merge':
        result.mergeFlag = true;
        break;
    }
  }
  return result;
}

(async () => {
  const { mergeFlag } = parseArgs();
  
  const { normalizedOriginal, normalizedModified } = prepareDocuments(originalJson, modifiedJson);

  if (mergeFlag) {
    const merged = mergeDocuments(normalizedOriginal, normalizedModified);

    writeJson(modifiedFilePath, merged);
    console.log(`\n Merge completed. Updated file: '${modifiedFilePath}'.\n`);
    return;
  }

  await generateReport(normalizedOriginal, normalizedModified).catch((err) => {
    console.error('Unexpected error while generating report:', err);
    process.exit(1);
  });
})();
