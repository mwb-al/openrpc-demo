export const SKIPPED_KEYS = [
  "examples",
  "baseFeePerBlobGas",
  "blobGasUsedRatio"
];

export const SKIPPED_METHODS = [
  "debug_getBadBlocks",
  "debug_getRawBlock",
  "debug_getRawHeader",
  "debug_getRawReceipts",
  "debug_getRawTransaction",
  "engine_*",
];

export function shouldSkipKey(key) {
  if (!key) return false;
  
  for (const pattern of SKIPPED_KEYS) {
    if (pattern === key) return true;

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (key.startsWith(prefix)) return true;
    }
  }
  
  return false;
}

export function shouldSkipMethod(methodName) {
  if (!methodName) return false;
  
  for (const pattern of SKIPPED_METHODS) {
    if (pattern === methodName) return true;

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (methodName.startsWith(prefix)) return true;
    }
  }
  
  return false;
}

export function shouldSkipPath(path) {
  if (!path) return false;

  const parts = path.split('.');
  for (const part of parts) {
    if (shouldSkipKey(part)) return true;
  }
  
  return false;
}
