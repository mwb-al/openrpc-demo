import fs from 'fs';
import { readJson } from './utils/file.utils.js';
import { mergeDocuments } from './operations/merge.js';
import { generateReport } from './operations/report.js';

const originalFilePath = './original-openrpc.json';
const modifiedFilePath = './modified-openrpc.json';

const originalJson = readJson(originalFilePath);
const modifiedJson = readJson(modifiedFilePath);

function parseArgs() {
  const argv = process.argv.slice(2);
  const result = { methodArg: undefined, keyArg: undefined, mergeFlag: false };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '-m':
      case '--method':
        result.methodArg = argv[i + 1];
        i++;
        break;
      case '-k':
      case '--key':
        result.keyArg = argv[i + 1];
        i++;
        break;
      case '-g':
      case '--merge':
        result.mergeFlag = true;
        break;
    }
  }
  return result;
}

(async () => {
  const { mergeFlag, methodArg, keyArg } = parseArgs();

  if (mergeFlag) {
    const merged = mergeDocuments(originalJson, modifiedJson);
    
    fs.writeFileSync(modifiedFilePath, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(`\n Merge completed. Updated file: '${modifiedFilePath}'.\n`);
    return;
  }

  await generateReport(originalJson, modifiedJson, {
    methodArg,
    keyArg,
  }).catch((err) => {
    console.error('Unexpected error while generating report:', err);
    process.exit(1);
  });
})();
