import diff from 'deep-diff';
import { getMethodMap, getDifferingTopLevelKeys } from '../utils/openrpc.utils.js';

function compareIgnoringFormatting(obj1, obj2) {
  const normalized1 = JSON.parse(JSON.stringify(obj1));
  const normalized2 = JSON.parse(JSON.stringify(obj2));

  return diff(normalized1, normalized2);
}

export async function generateReport(
  originalJson,
  modifiedJson
) {

  const originalMethods = getMethodMap(originalJson);
  const modifiedMethods = getMethodMap(modifiedJson);

  const missingMethods = [];
  for (const name of originalMethods.keys()) {
    if (!modifiedMethods.has(name)) missingMethods.push({ missingMethod: name });
  }

  const changedMethods = [];
  for (const [name, origMethod] of originalMethods) {
    if (!modifiedMethods.has(name)) continue;
    const modMethod = modifiedMethods.get(name);

    const differingKeys = getDifferingTopLevelKeys(origMethod, modMethod);
    if (differingKeys.length > 0) {
      changedMethods.push({
        method: name,
        differingKeys: differingKeys.join(', '),
      });
    }
  }

  if (missingMethods.length === 0 && changedMethods.length === 0) {
    console.log('No differences detected.');
    return;
  }

  if (missingMethods.length > 0) {
    console.log(
      '\nMethods present in the original document but missing from the modified document:\n'
    );
    console.table(missingMethods);
  }

  if (changedMethods.length > 0) {
    console.log('\nMethods whose other fields differ between documents:\n');
    console.table(changedMethods);
  }
}
