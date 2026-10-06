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
        throw new ApiError(502, { error: result.error.issues });
    }
    return result.data;
};
