import { readJson, writeJson } from './utils/file.utils.js';
import { mergeDocuments } from './operations/merge.js';
import { generateReport } from './operations/report.js';
import { prepareDocuments } from './operations/prepare.js';
import { SKIPPED_KEYS, SKIPPED_METHODS } from './config.js';

const originalFilePath = './original-openrpc.json';
const modifiedFilePath = './modified-openrpc.json';

const { data: originalJson } = readJson(originalFilePath);
const { data: modifiedJson, originalContent: modifiedContent } = readJson(modifiedFilePath);

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
    console.log(`\nMerging documents with the following configuration:` +
                `\n- Skipped keys: ${SKIPPED_KEYS.join(', ')}` +
                `\n- Skipped methods: ${SKIPPED_METHODS.join(', ')}\n`);
    
    const merged = mergeDocuments(normalizedOriginal, normalizedModified);

    writeJson(modifiedFilePath, merged, modifiedContent);
    console.log(`\nMerge completed. Updated file: '${modifiedFilePath}'.\n`);
    return;
  }

  await generateReport(normalizedOriginal, normalizedModified).catch((err) => {
    console.error('Unexpected error while generating report:', err);
    process.exit(1);
  });
})();
