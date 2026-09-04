/**
 * Namespaced logger for oh-my-pi-zh
 */
export class Logger {
  private prefix: string;

  constructor(prefix = "oh-my-pi-zh") {
    this.prefix = `[${prefix}]`;
  }

  debug(...args: unknown[]): void {
    if (process.env.DEBUG || process.env.OH_MY_PI_DEBUG) {
      console.debug(this.prefix, ...args);
    }
  }

  info(...args: unknown[]): void {
    console.info(this.prefix, ...args);
  }

  warn(...args: unknown[]): void {
    console.warn(this.prefix, ...args);
  }

  error(...args: unknown[]): void {
    console.error(this.prefix, ...args);
  }
}

export const logger = new Logger();
