function CommandParser() {

    this.parseCommand = function (commandText) {
        var commandRegex = /([A-Za-z]+)\s?(.*$)/;
        var parsed = commandText.match(commandRegex);

        if (parsed && parsed[1]) {
            var action = parsed[1]; //should be command action
            var args = [];

            //should be comma separated args
            if (parsed[2]) {
                args = parsed[2].split(/,\s*/);
            }

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