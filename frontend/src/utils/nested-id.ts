const separator = '-';

// An id nested under another: the parent's id, then `separator`, then its own
// name.
export const createNestedId = (parentId: string, name: string | number) =>
    `${parentId}${separator}${String(name)}`;

// Whether an id is nested under another, at any depth
export const isNestedIn = (id: string, parentId: string) =>
    id.startsWith(`${parentId}${separator}`);
