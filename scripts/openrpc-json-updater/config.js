export const SKIPPED_KEYS = [
  "examples",
  "baseFeePerBlobGas",
  "blobGasUsedRatio"
];

export const DISCARDED_METHODS = [
  "engine_*"
];

export const NOT_IMPLEMENTED_METHODS = [
  "debug_getBadBlocks",
  "debug_getRawBlock",
  "debug_getRawHeader",
  "debug_getRawReceipts",
  "debug_getRawTransaction"
];

export const SKIPPED_METHODS = [
  ...DISCARDED_METHODS,
  ...NOT_IMPLEMENTED_METHODS
];

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

export function shouldSkipPath(path) {
  if (!path) return false;

  const parts = path.split('.');
  for (const part of parts) {
    if (shouldSkipKey(part)) return true;
  }
  
  return false;
}

export function getSkippedMethodCategory(methodName) {
  if (!methodName) return null;
  
  for (const pattern of DISCARDED_METHODS) {
    if (pattern === methodName) return 'discarded';
    
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (methodName.startsWith(prefix)) return 'discarded';
    }
  }
  
  for (const pattern of NOT_IMPLEMENTED_METHODS) {
    if (pattern === methodName) return 'not implemented';
    
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (methodName.startsWith(prefix)) return 'not implemented';
    }
  }
  
  return null;
}
