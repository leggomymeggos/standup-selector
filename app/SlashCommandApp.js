function SlashCommandApp(commandParser, stateService) {
    this.commandParser = commandParser;
    this.stateService = stateService;

    this.serviceAdminRequest = function (params) {
        var msg = 'Error: ';

        if (params.command === '/ssbot') {
            var parsed = this.commandParser.parse(params.text);

            if (parsed) {
                switch (parsed.action) {
                    case 'forceReject':
                        var validStanduppers =
                            parsed.args
                                .every(function (el) {
                                    return stateService.getSelectedStandupperNames().indexOf(el) >= 0
                                    && stateService.getRejectedStandupperNames().indexOf(el) < 0
                                });

                        if (!validStanduppers) {
                            msg += 'Invalid standupper provided. ' +
                                'Check to make sure they are currently selected and not already rejected.';
                        } else {
                            parsed.args.forEach(function (standupper) {
                                replaceStandupper(standupper);
                            });
                            msg = 'Force rejecting for ';
                            msg += stateService.getCurrentStandupDateString() + ': ';
                            msg += parsed.args.join(', ');
                        }
                        break;
                    default:
                        msg += 'Invalid action.'
                }
            } else {
                msg += 'Failed to parse command text.'
            }
        } else {
            msg += 'Invalid command.';
        }

        return msg;
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlashCommandApp;
}