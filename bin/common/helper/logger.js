import winston from 'winston';
import path from 'path';
import os from 'os';

"use strict";
export default new class Logger {
    /**
     * @type {winston.Logger}
     */
    static #logger;

    /**
     * @type {boolean}
     */
    static #hasLogs = false;

    /**
     * @type {string}
     */
    static #filename;

    /**
     * Prepare for logging
     */
    create() {
        Logger.#setFilename();

        Logger.#logger = winston.createLogger({
            level: 'info',
            format: winston.format.simple(),
            transports: [
                new winston.transports.File({ filename: Logger.#filename })
            ]
        })
    }

    /**
     * Stop logging
     */
    destroy() {
        Logger.#logger.destroy();
    }

    getLogFile() {
        return Logger.#filename;
    }

    hasLogs() {
        return Logger.#hasLogs;
    }

    /**
     * Log info level
     * @param message {string}
     * @return void
     */
    info(message) {
        Logger.#throwIfLoggerIsNotInstantiated();

        console.info(message);

        Logger.#logger.log('info', message);
        Logger.#hasLogs = true;
    }

    /**
     * Log warning level
     * @param message {string}
     * @return void
     */
    warn(message) {
        Logger.#throwIfLoggerIsNotInstantiated();

        console.warn(message);

        Logger.#logger.log('warning', message);
        Logger.#hasLogs = true;
    }

    /**
     * Log error level
     * @param message {string}
     * @param error {Error=} null
     * @return void
     */
    error(message, error = null) {
        Logger.#throwIfLoggerIsNotInstantiated();

        console.error(message);

        Logger.#logger.log('error', message);

        if (error != null)
            Logger.#logger.log('error', error?.message);

        Logger.#hasLogs = true;
    }

    static #setFilename() {
        const timestamp = Logger.#getTime();
        const tmpdir = os.tmpdir();
        Logger.#filename = path.join(tmpdir, `dever-${timestamp}.log`);
    }

    static #getTime() {
        return new Date().toJSON().replaceAll(':', '.');
    }

    static #throwIfLoggerIsNotInstantiated() {
        if (Logger.#logger == null) {
            throw new Error('Logger.logger has not been instantiated');
        }
    }
}