class Install {
    /**
     * Which type of install is defined. Currently only supports ('chocolately')
     * @return {string}
     */
    type;

    /**
     * Name of chocolatey package
     * @return {string}
     */
    package;

    /**
     * Name of group package belongs to
     * @return {string}
     */
    group;

    /**
     * Define functionality you would like to run after installation
     * @return {Step}
     */
    after;

    /**
     * Define functionality you would like to run after installation
     * @return {Step}
     */
    before;
}

class Step {
    /**
     * Define which type of execution you want to run before or after ('powershell-command')
     * @return {string}
     */
    type;

    /**
     * Define powershell-command you want to execute
     * @return {string}
     */
    command;
}