module.exports = new class {
    /**
     * @type {number}
     */
    #timer;

    /**
     * @var {{value: void | PromiseLike<string>) => void}}
     */
    #resolve;

    /**
     * Message to be included with promise when delay ends
     * @var {string | boolean}
     */
    #value;

    /**
     *
     * @param ms {number} Milliseconds until delay ends
     * @param value {string | boolean} @Optional include with promise when delay is expired
     * @returns {Promise<void>}
     */
    async delay(ms, value) {
        this.#setValue(value)
        return new Promise((resolve) => this.#setTime(resolve, ms));
    }

    /**
     * Will stop delay before expiration
     * @param value {string | boolean} @Optional Value will be included with promise
     * @return {void}
     */
    done(value) {
        if (this.#timer == null || this.#resolve == null) {
            console.log('no timeout initialized');
            return;
        }

        this.#setValue(value);

        this.#resolve(this.#value);
        clearTimeout(this.#timer);
    }

    /**
     * Sets message that will be included when delay promise ends
     * @param value {string | boolean | null}
     * @return {void}
     */
    #setValue(value) {
       if (value == null) {
           return;
       }

       this.#value = value;
    }

    /**
     * Start delaying the promise response
     * @param resolve {(value: void | PromiseLike<void>) => void}
     * @param ms {number}
     * @returns {void}
     */
    #setTime(resolve, ms) {
        this.#resolve = resolve;
        this.#timer = setTimeout(resolve, ms);
    }
}