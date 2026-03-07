type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
};

function write(level: LogLevel, message: string, data?: unknown) {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data !== undefined ? { data } : {})
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export const logger = {
  info: (message: string, data?: unknown) => write("info", message, data),
  warn: (message: string, data?: unknown) => write("warn", message, data),
  error: (message: string, data?: unknown) => write("error", message, data)
};
