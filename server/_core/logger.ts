type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel) {
  return levelPriority[level] >= levelPriority[DEFAULT_LEVEL];
}

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (!shouldLog('debug')) return;
    console.debug('[DEBUG]', timestamp(), ...args);
  },
  info: (...args: unknown[]) => {
    if (!shouldLog('info')) return;
    console.info('[INFO]', timestamp(), ...args);
  },
  warn: (...args: unknown[]) => {
    if (!shouldLog('warn')) return;
    console.warn('[WARN]', timestamp(), ...args);
  },
  error: (...args: unknown[]) => {
    if (!shouldLog('error')) return;
    console.error('[ERROR]', timestamp(), ...args);
  },
};

export default logger;
