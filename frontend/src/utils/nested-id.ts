const separator = '-';

// An id nested under another: the parent's id, then `separator`, then its own
// name.
export const createNestedId = (parentId: string, name: string | number) =>
    `${parentId}${separator}${String(name)}`;
