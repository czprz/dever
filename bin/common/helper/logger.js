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

    static #hasInfo = false;

    static #hasWarn = false;

    static #hasDebug = false;

    static #hasError = false;

    /**
     * @type {string}
     */
    static #filename;

    hasLogs = {
        info: () => Logger.#hasInfo,
        debug: () => Logger.#hasDebug,
        warning: () => Logger.#hasWarn,
        error: () => Logger.#hasError
    };


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
        Logger.#hasInfo = true;
    }

    debug(message) {
        if (!process.env.DEBUG) {
            return;
        }

        Logger.#throwIfLoggerIsNotInstantiated();

        console.debug(message);

        Logger.#logger.log('debug', message);
        Logger.#hasLogs = true;
        Logger.#hasDebug = true;
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
        Logger.#hasWarn = true;
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

        Logger.#logger.log('error', message, error);

        Logger.#hasLogs = true;
        Logger.#hasError = true;
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