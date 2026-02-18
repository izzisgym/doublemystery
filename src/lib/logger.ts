type LogMeta = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    };
  }

  return { message: "Unknown error" };
}

export function createRequestId() {
  return crypto.randomUUID();
}

export function logInfo(message: string, meta: LogMeta = {}) {
  console.info(JSON.stringify({ level: "info", message, ...meta }));
}

export function logError(message: string, error: unknown, meta: LogMeta = {}) {
  console.error(
    JSON.stringify({ level: "error", message, error: serializeError(error), ...meta })
  );
}
