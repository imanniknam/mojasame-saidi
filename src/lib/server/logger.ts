type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const shouldLogDebug = process.env.LOG_LEVEL === "debug";

function writeLog(level: LogLevel, message: string, context?: LogContext) {
  if (level === "debug" && !shouldLogDebug) return;

  const payload = {
    level,
    message,
    service: "mojasame-saidi",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    ...context,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    writeLog("debug", message, context),
  info: (message: string, context?: LogContext) => writeLog("info", message, context),
  warn: (message: string, context?: LogContext) => writeLog("warn", message, context),
  error: (message: string, context?: LogContext) =>
    writeLog("error", message, context),
};
