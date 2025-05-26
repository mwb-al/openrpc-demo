import { getMethodMap, getDifferingKeys } from '../utils/openrpc.utils.js';

export function mergeDocuments(originalJson, modifiedJson) {
  if (!Array.isArray(originalJson.methods)) return modifiedJson;
  if (!Array.isArray(modifiedJson.methods)) modifiedJson.methods = [];

  const modifiedMap = getMethodMap(modifiedJson);

  for (const origMethod of originalJson.methods) {
    const name = origMethod.name;
    if (!name) continue;

    if (!modifiedMap.has(name)) {
      modifiedJson.methods.push(origMethod);
      continue;
    }

    const modMethod = modifiedMap.get(name);
    const differingKeys = getDifferingKeys(origMethod, modMethod);

    for (const k of differingKeys) {
      modMethod[k] = origMethod[k];
    }
  }
  return modifiedJson;
}
