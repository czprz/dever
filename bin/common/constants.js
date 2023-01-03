"use strict";
export default new class {
    predefinedKeys = ['init', 'scan', 'list', 'config', 'validate'];
    notAllowedKeywords = ['init', 'scan', 'list', 'config', 'validate', '--help', '--version'];
}