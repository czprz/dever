class Fix {
    /**
     * Keyword for fix command
     * @return {string}
     */
    key;

    /**
     * Define which handler you're using ('powershell-command','powershell-script')
     * @return {string}
     */
    type;

    /**
     * Command which is gonna be executed as part of fix. Used with ('powershell-command')
     * @return {string}
     */
    command;

    /**
     * File which is gonna be executed as part of fix. Used with ('powershell-script')
     * @return {string}
     */
    file;
}