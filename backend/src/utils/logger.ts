const levels = ['debug', 'info', 'warn', 'error'] as const;
type Level = (typeof levels)[number];

const currentLevel: Level =
  (process.env.LOG_LEVEL as Level) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function log(level: Level, message: string, meta?: any) {
  if (levels.indexOf(level) < levels.indexOf(currentLevel)) return;

  const timestamp = new Date().toISOString();
  const output = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (level === 'error') {
    console.error(output, meta ?? '');
  } else if (level === 'warn') {
    console.warn(output, meta ?? '');
  } else {
    console.log(output, meta ?? '');
  }
}

export const logger = {
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
  info: (msg: string, meta?: any) => log('info', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
};