import { getMethodMap, getDifferingKeys } from '../utils/openrpc.utils.js';
import { shouldSkipPath, shouldSkipKey, shouldSkipMethod } from '../config.js';

function setNestedValue(obj, path, value) {
  if (!path) return;
  
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}

function getNestedValue(obj, path) {
  if (!path) return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

function hasNestedPath(obj, path) {
  const value = getNestedValue(obj, path);
  return value !== undefined;
}

function removeSkippedKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeSkippedKeys(item));
  }
  
  const result = {};
  for (const key in obj) {
    if (shouldSkipKey(key)) continue;
    
    result[key] = removeSkippedKeys(obj[key]);
  }
  
  return result;
}

function processDocument(document) {
  if (!document || !document.methods || !Array.isArray(document.methods)) {
    return document;
  }
  
  const result = JSON.parse(JSON.stringify(document));
  
  result.methods = result.methods.filter(method => {
    const methodName = method?.name;
    if (!methodName) return true;
    
    return !shouldSkipMethod(methodName);
  });
  
  result.methods = result.methods.map(method => removeSkippedKeys(method));
  
  return result;
}

export function mergeDocuments(originalJson, modifiedJson) {
  if (!Array.isArray(originalJson.methods)) return modifiedJson;
  if (!Array.isArray(modifiedJson.methods)) modifiedJson.methods = [];

  const filteredOriginal = JSON.parse(JSON.stringify(originalJson));
  filteredOriginal.methods = filteredOriginal.methods.filter(method => {
    const methodName = method?.name;
    if (!methodName) return true;
    return !shouldSkipMethod(methodName);
  });

  const filteredModified = JSON.parse(JSON.stringify(modifiedJson));
  filteredModified.methods = filteredModified.methods.filter(method => {
    const methodName = method?.name;
    if (!methodName) return true;
    return !shouldSkipMethod(methodName);
  });

  const modifiedMap = getMethodMap(filteredModified);

  for (const origMethod of filteredOriginal.methods) {
    const name = origMethod.name;
    if (!name) continue;

    if (!modifiedMap.has(name)) {
      filteredModified.methods.push(origMethod);
      continue;
    }

    const modMethod = modifiedMap.get(name);
    const differingKeys = getDifferingKeys(origMethod, modMethod);

    for (const path of differingKeys) {
      if (shouldSkipPath(path)) continue;
      
      const valueFromOriginal = getNestedValue(origMethod, path);
      
      const existsInOriginal = hasNestedPath(origMethod, path);
      const existsInModified = hasNestedPath(modMethod, path);
      
      if (!existsInOriginal && existsInModified) {
        continue;
      }
      
      if (path.includes('.')) {
        setNestedValue(modMethod, path, valueFromOriginal);
      } else {
        modMethod[path] = valueFromOriginal;
      }
    }
  }

  if (filteredOriginal.components && typeof filteredOriginal.components === 'object') {
    if (!filteredModified.components) {
      filteredModified.components = {};
    }

    for (const section in filteredOriginal.components) {
      if (!filteredModified.components[section]) {
        filteredModified.components[section] = {};
      }

      for (const key in filteredOriginal.components[section]) {
        if (shouldSkipKey(key)) continue;

        if (!filteredModified.components[section][key]) {
          filteredModified.components[section][key] =
              removeSkippedKeys(filteredOriginal.components[section][key]);
        }
      }
    }
  }

  return processDocument(filteredModified);
}
