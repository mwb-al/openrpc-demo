import diff from 'deep-diff';
import { inspect } from 'node:util';
import { getMethodMap, getDifferingTopLevelKeys } from '../utils/openrpc.utils.js';

function compareIgnoringFormatting(obj1, obj2) {
  const normalized1 = JSON.parse(JSON.stringify(obj1));
  const normalized2 = JSON.parse(JSON.stringify(obj2));
  
  return diff(normalized1, normalized2);
}

export async function generateReport(
  originalJson,
  modifiedJson,
  { methodArg, keyArg }
) {

  const originalMethods = getMethodMap(originalJson);
  const modifiedMethods = getMethodMap(modifiedJson);

  if (methodArg && keyArg) {
    const origMethod = originalMethods.get(methodArg);
    const modMethod = modifiedMethods.get(methodArg);

    if (!origMethod && !modMethod) {
      console.error(`Method "${methodArg}" not found in either document.`);
      return;
    }

    const originalValue = origMethod ? origMethod[keyArg] : undefined;
    const modifiedValue = modMethod ? modMethod[keyArg] : undefined;

    if (JSON.stringify(originalValue) === JSON.stringify(modifiedValue)) {
      console.log(`No differences for "${methodArg}.${keyArg}"`);
      return;
    }

    const differences = compareIgnoringFormatting(originalValue, modifiedValue) || [];
    console.log(
      `\nDifferences for method "${methodArg}" and key "${keyArg}":\n`
    );

    if (differences.length === 0) {
      console.log(
        'No differences detected.'
      );
      return;
    }

    for (const d of differences) {
      const buildPath = (df) =>
        df.kind === 'A'
          ? [...df.path, `[${df.index}]`].join('.')
          : df.path?.join('.') || '(root)';

      const pathStr = buildPath(d);
      let before, after;

      switch (d.kind) {
        case 'N': // new property
          before = undefined;
          after = d.rhs; // right-hand side (modified-openrpc.json)
          break;
        case 'D': // deleted property
          before = d.lhs; // left-hand side (original-openrpc.json)
          after = undefined;
          break;
        case 'E': // edited property
          before = d.lhs;
          after = d.rhs;
          break;
        case 'A': // array element changed
          if (d.item.kind === 'N') {
            before = undefined;
            after = d.item.rhs;
          } else if (d.item.kind === 'D') {
            before = d.item.lhs;
            after = undefined;
          } else if (d.item.kind === 'E') {
            before = d.item.lhs;
            after = d.item.rhs;
          }
          break;
      }

      console.log(`- ${pathStr}`);
      console.log(
        '  original:',
        inspect(before, { depth: null, colors: true, compact: false })
      );
      console.log(
        '  modified:',
        inspect(after, { depth: null, colors: true, compact: false })
      );
      console.log('\n');
    }
    return;
  }

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
