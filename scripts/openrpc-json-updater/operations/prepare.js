import diff from 'deep-diff';

/**
 * Prepares OpenRPC documents for comparison by normalizing formatting
 * @param {Object} originalJson - The original OpenRPC document
 * @param {Object} modifiedJson - The modified OpenRPC document
 * @returns {Object} Object containing normalized versions of both documents
 */
export function prepareDocuments(originalJson, modifiedJson) {
  return {
    normalizedOriginal: normalizeDocument(originalJson),
    normalizedModified: normalizeDocument(modifiedJson)
  };
}

/**
 * Normalizes an OpenRPC document to eliminate formatting differences
 * @param {Object} document - The OpenRPC document to normalize
 * @returns {Object} A normalized copy of the document
 */
export function normalizeDocument(document) {
  return JSON.parse(JSON.stringify(document));
}

/**
 * Compares two objects while ignoring formatting differences
 * @param {Object} obj1 - First object to compare
 * @param {Object} obj2 - Second object to compare
 * @returns {Array|undefined} Array of differences or undefined if objects are equal
 */
export function compareIgnoringFormatting(obj1, obj2) {
  const normalized1 = normalizeDocument(obj1);
  const normalized2 = normalizeDocument(obj2);

  return diff(normalized1, normalized2);
}
