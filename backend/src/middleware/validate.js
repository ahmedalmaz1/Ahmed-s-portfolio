import { zValidator } from '@hono/zod-validator';
import { ApiError } from '../lib/errors.js';

/** Zod validation that answers with a consistent 400 body: { error, details: [{ field, message }] } */
export const validate = (target, schema) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ApiError(
        400,
        'Validation failed',
        result.error.issues.map((issue) => ({ field: issue.path.join('.') || target, message: issue.message })),
      );
    }
  });
