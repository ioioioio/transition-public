const parseBody = (text: string): unknown => {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

// Used by the generated client instead of fetch.
// The default client parses every answer as JSON, but some of Transition's
// errors are plain text.
export const fetchTransition = async <T>(
    url: string,
    options: RequestInit,
): Promise<T> => {
    const response = await fetch(url, options);
    const text = await response.text();
    return {
        data: text === '' ? {} : parseBody(text),
        status: response.status,
        headers: response.headers,
    } as T;
};
