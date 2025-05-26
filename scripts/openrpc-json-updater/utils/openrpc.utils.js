import { compareIgnoringFormatting } from '../operations/prepare.js';

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
      if (fullPath && !fullPath.startsWith('name')) keys.add(fullPath);
    }
  }
  return [...keys];
}
