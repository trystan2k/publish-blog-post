import { logBuildInfo, logBuildDebug, logBuildError, logBuildWarn } from '@/pbp/git';

let loggerInstance: Logger | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerFunctions = (...args: any[]) => void;

export enum LoggerType {
  CONSOLE = 'console',
  GIT = 'git',
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const colorsByLevel = {
  [LogLevel.DEBUG]: '\x1b[34m',
  [LogLevel.INFO]: '\x1b[32m',
  [LogLevel.WARN]: '\x1b[33m',
  [LogLevel.ERROR]: '\x1b[31m',
  DEFAULT: '\x1b[0m',
};

class Logger {
  private level = LogLevel.INFO;
  protected colorEnabled = true;
  private infoFn: LoggerFunctions;
  private debugFn: LoggerFunctions;
  private errorFn: LoggerFunctions;
  private warnFn: LoggerFunctions;

  constructor(infoFn: LoggerFunctions, debugFn?: LoggerFunctions, errorFn?: LoggerFunctions, warnFn?: LoggerFunctions) {
    this.infoFn = infoFn;
    this.debugFn = debugFn || infoFn;
    this.errorFn = errorFn || infoFn;
    this.warnFn = warnFn || infoFn;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private buildMessage(message: string, level: LogLevel) {
    if (!this.colorEnabled) {
      return `[${new Date().toISOString()}] [${LogLevel[level]}] - ${message}`;
    }

    return `${colorsByLevel[level]}[${new Date().toISOString()}] [${LogLevel[level]}] - ${message}${colorsByLevel['DEFAULT']}`;
  }

  private buildArgs(message: string, level: LogLevel, data?: unknown) {
    const args: (string | unknown)[] = [this.buildMessage(message, level)];
    if (data) {
      args.push(data);
    }

    return args;
  }

  info(message: string, data?: unknown) {
    if (this.level <= LogLevel.INFO) {
      this.infoFn(...this.buildArgs(message, LogLevel.INFO, data));
    }
  }

  debug(message: string, data?: unknown) {
    if (this.level <= LogLevel.DEBUG) {
      this.debugFn(...this.buildArgs(message, LogLevel.DEBUG, data));
    }
  }

  error(message: string, data?: unknown) {
    if (this.level <= LogLevel.ERROR) {
      this.errorFn(...this.buildArgs(message, LogLevel.ERROR, data));
    }
  }

  warn(message: string, data?: unknown) {
    if (this.level <= LogLevel.WARN) {
      this.warnFn(...this.buildArgs(message, LogLevel.WARN, data));
    }
  }
}

class ConsoleLogger extends Logger {
  constructor() {
    // eslint-disable-next-line no-console
    super(console.log);
  }
}

class GitLogger extends Logger {
  constructor() {
    super(logBuildInfo, logBuildDebug, logBuildError, logBuildWarn);
    this.colorEnabled = false;
  }
}

export const getLogger = () => {
  if (loggerInstance) {
    return loggerInstance;
  }

  throw new Error('Logger instance not found');
};

export const createLogger = (type: LoggerType = LoggerType.CONSOLE) => {
  if (type === LoggerType.GIT) {
    loggerInstance = new GitLogger();
  } else {
    loggerInstance = new ConsoleLogger();
  }
};
