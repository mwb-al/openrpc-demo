import { compareIgnoringFormatting } from '../operations/prepare.js';
import { shouldSkipPath, shouldSkipKey } from '../config.js';

export function getMethodMap(openrpcDoc) {
  const map = new Map();
  if (Array.isArray(openrpcDoc.methods)) {
    for (const m of openrpcDoc.methods) {
      if (m?.name) map.set(m.name, m);
    }
  }
  return map;
}

export function getDifferingKeys(origMethod, modMethod) {
  const differences = compareIgnoringFormatting(origMethod, modMethod) || [];
  const keys = new Set();

  for (const d of differences) {
    if (d.path) {
      const fullPath = d.path.join('.');
      
      if (!fullPath || fullPath.startsWith('name')) continue;
      
      if (shouldSkipPath(fullPath)) continue;
      
      keys.add(fullPath);
    }
  }

  function addKeysRecursively(prefix, orig, mod) {
    for (const key in orig) {
      if (shouldSkipKey(key)) continue;
      
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      
      if (newPrefix === 'name') continue;
      
      if (shouldSkipPath(newPrefix)) continue;
      
      if (!(key in mod)) {
        keys.add(newPrefix);
      } else if (
        typeof orig[key] === 'object' &&
        orig[key] !== null &&
        typeof mod[key] === 'object' &&
        mod[key] !== null &&
        !Array.isArray(orig[key]) &&
        !Array.isArray(mod[key])
      ) {
        addKeysRecursively(newPrefix, orig[key], mod[key]);
      }
    }
  }
  
  addKeysRecursively('', origMethod, modMethod);
  
  return [...keys];
}
