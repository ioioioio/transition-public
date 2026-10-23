import { z } from 'zod';

// Thrown from handlers, and sent as the response by the app's error handler
export class ApiError extends Error {
    constructor(
        readonly status: number,
        readonly body: unknown,
    ) {
        super(`HTTP ${status}`);
    }
}

// When a service the backend depends on fails, or answers unexpectedly
export class UpstreamError extends Error {}

// When the service answered with an HTTP error
export class HttpUpstreamError extends UpstreamError {
    readonly status: number;
    readonly data: unknown;

    constructor(response: { status: number; data: unknown }) {
        super(`HTTP ${response.status}`);
        this.status = response.status;
        this.data = response.data;
    }
}

// Any failure of the request itself, like an unreachable service, becomes an
// UpstreamError
export const fetchUpstream = async <T>(
    request: () => Promise<T>,
): Promise<T> => {
    try {
        return await request();
    } catch (error) {
        throw new UpstreamError('Request failed', { cause: error });
    }
};

export const parseRequest = <T>(
    schema: z.core.$ZodType<T>,
    input: unknown,
): T => {
    const result = z.safeParse(schema, input);
    if (!result.success) {
        throw new ApiError(400, { error: result.error.issues });
    }
    return result.data;
};

export const parseUpstreamResponse = <T>(
    schema: z.core.$ZodType<T>,
    data: unknown,
): T => {
    const result = z.safeParse(schema, data);
    if (!result.success) {
        throw new UpstreamError('Unexpected answer', { cause: result.error });
    }
    return result.data;
};
