declare var Logger: Logging.LoggerStatic;
declare module Logging {
    interface LogLevel {
        value: number;
        name: string;
    }
    interface Logger {
        setHandler(handler: Function): void;
        enabledFor(level: LogLevel): boolean;
        setLevel(level: LogLevel): void;
        debug(...arguments: any[]): void;
        info(...arguments: any[]): void;
        warn(...arguments: any[]): void;
        error(...arguments: any[]): void;
        formatStackTraceString(stack: string): string;
    }
    interface LoggerStatic extends Logger {
        useDefaults(level: LogLevel): void;
        get(name: string): Logger;
        DEBUG: LogLevel;
        INFO: LogLevel;
        WARN: LogLevel;
        ERROR: LogLevel;
        OFF: LogLevel;
    }
}
