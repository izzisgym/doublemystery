import { z } from "zod";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function parseJson<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.path.join(".") || issue.message)
      .join(", ");
    throw new ValidationError(`Invalid request body: ${message}`);
  }
  return parsed.data;
}
