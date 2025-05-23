import diff from 'deep-diff';

export function getMethodMap(openrpcDoc) {
  const map = new Map();
  if (Array.isArray(openrpcDoc.methods)) {
    for (const m of openrpcDoc.methods) {
      if (m?.name) map.set(m.name, m);
    }
  }
  return map;
}

export function getDifferingTopLevelKeys(origMethod, modMethod) {
  const differences = diff(origMethod, modMethod) || [];
  const keys = new Set();

  for (const d of differences) {
    const topKey = d.path?.[0];
    if (topKey && topKey !== 'name') keys.add(topKey);
  }
  return [...keys];
}
