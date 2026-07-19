import pino from "pino";

const logLevel = process.env.LOG_LEVEL ?? "info";

export const logger = pino({
  level: logLevel,
  ...(process.env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});

export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}
