function CommandParser() {

    this.parseCommand = function (commandText) {
        var commandRegex = /(\w+)\s+(.*$)/;
        var parsed = commandText.match(commandRegex);

        if (parsed && parsed[1] && parsed[2]) {
            var action = parsed[1]; //should be command action
            var args = parsed[2].split(/,?\s+/); //should be comma separated args

            return {
                action: action,
                args: args
            }
        } else {
            return false;
        }
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommandParser
}