import { describe, test, expect, vi, beforeEach, afterAll, afterEach } from 'vitest';

import * as gitModule from '@/pbp/git';
import { createLogger, getLogger, LoggerType, LogLevel } from '@/pbp/utils/logger';

describe('Logger', () => {
  const date = new Date();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test('should throw an error if getLogger is called before createLogger', () => {
    expect(() => getLogger()).toThrow('Logger instance not found');
  });

  test('should create a ConsoleLogger instance by default', () => {
    createLogger();
    const logger = getLogger();
    expect(logger).toBeInstanceOf(Object);
  });

  test('should create a GitLogger instance when specified', () => {
    createLogger(LoggerType.GIT);
    const logger = getLogger();
    expect(logger).toBeInstanceOf(Object);
  });

  test('should log info messages when level is INFO and logger is GIT, without colors', () => {
    const infoSpy = vi.spyOn(gitModule, 'logBuildInfo').mockImplementationOnce(() => undefined);
    createLogger(LoggerType.GIT);
    const logger = getLogger();
    logger.setLevel(LogLevel.INFO);
    logger.info('Test info message');
    expect(infoSpy).toHaveBeenCalledWith(`[${new Date().toISOString()}] [INFO] - Test info message`);
  });

  test('should log info messages when level is INFO', () => {
    const infoSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.INFO);
    logger.info('Test info message');
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[${new Date().toISOString()}] [INFO] - Test info message`),
    );
  });

  test('should log debug messages when level is DEBUG', () => {
    const debugSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('Test debug message');
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[${new Date().toISOString()}] [DEBUG] - Test debug message`),
    );
  });

  test('should log error messages when level is ERROR', () => {
    const errorSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.ERROR);
    logger.error('Test error message');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[${new Date().toISOString()}] [ERROR] - Test error message`),
    );
  });

  test('should log messages with optional data', () => {
    const errorSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.ERROR);
    logger.error('Test error message', { key: 'value' });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[${new Date().toISOString()}] [ERROR] - Test error message`),
      {
        key: 'value',
      },
    );
  });

  test('should log warn messages when level is WARN', () => {
    const warnSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.WARN);
    logger.warn('Test warn message');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[${new Date().toISOString()}] [WARN] - Test warn message`),
    );
  });

  test('should not log info messages when level is higher than INFO (WARN, ERROR)', () => {
    const infoSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.WARN);
    logger.info('Test info message');
    expect(infoSpy).not.toHaveBeenCalled();
  });

  test('should not log debug messages when level is higher than DEBUG (INFO, WARN, ERROR)', () => {
    const debugSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.INFO);
    logger.debug('Test debug message');
    expect(debugSpy).not.toHaveBeenCalled();
  });

  test('should not log warn messages when level is higher than WARN (ERROR)', () => {
    const warnSpy = vi.spyOn(console, 'log').mockImplementationOnce(() => undefined);
    createLogger();
    const logger = getLogger();
    logger.setLevel(LogLevel.ERROR);
    logger.warn('Test warn message');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
