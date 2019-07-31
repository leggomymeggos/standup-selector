function InteractiveButtonApp(stateService, adminService, selectionService, standupperService) {
    this.stateService = stateService;
    this.adminService = adminService;
    this.selectionService = selectionService;
    this.standupperService = standupperService;

    this.respondToInteraction = function (payload) {
        if (this.stateService.validateCallbackId(payload.callback_id)) {
            var nameOnCallback = payload.callback_id.split('_')[0];

            if (payload.actions[0].value === 'yes') {
                return this.handleConfirmation(nameOnCallback);

                // 'You have wisely accepted standup bot\'s offer. You will help run standup the week of 1/1 with person2. Glory to standup bot!'
            } else if (payload.actions[0].value === 'no') {
                if (stateService.getRejectedStandupperNames().includes(nameOnCallback)) {
                    return 'You have already rejected this standup issuance and will be replaced';
                }
                this.handleRejection(nameOnCallback);
                return 'You will be replaced...for running standup';
            } else {
                return 'Error';
            }
        } else {
            return 'This standup issuance you have responded to is for an older or invalid week.';
        }
    };

    this.handleConfirmation = function (nameOnCallback) {
        var currentConfirmed = this.stateService.getConfirmedStandupperNames();
        var redundantConfirmation = currentConfirmed.includes(nameOnCallback);
        var responseMessage = "";

        switch (currentConfirmed.length) {
            case 0:
                this.recordConfirmation(nameOnCallback);
                responseMessage = this.createConfirmationResponse(null);
                break;
            case 1:
                if (redundantConfirmation) {
                    responseMessage = 'You are already confirmed to run standup the week of '
                        + this.stateService.getCurrentStandupDateString()
                        + '.';
                } else {
                    this.recordConfirmation(nameOnCallback);
                    responseMessage = this.createConfirmationResponse(currentConfirmed[0])
                }
                break;
            case 2:
                if (redundantConfirmation) {
                    responseMessage = 'You are already confirmed to run standup the week of '
                        + this.stateService.getCurrentStandupDateString()
                        + '.';
                } else {
                    responseMessage = 'There are already two people confirmed to run Standup this upcoming week.'
                }
                break;
            default:
                break;
        }

        return responseMessage;
    };

    this.recordConfirmation = function (nameOnCallback) {
        this.stateService.recordConfirmation(nameOnCallback);
        this.standupperService.addConfirmation(nameOnCallback);
        this.adminService.messageAdmins('[ADMIN]: '
            + nameOnCallback
            + ' has been confirmed to run standup the week of '
            + this.stateService.getCurrentStandupDateString()
        );
    };

    this.createConfirmationResponse = function (standupPartner) {
        return 'You have wisely accepted Standup bot\'s offer. You will help run standup the week of '
            + this.stateService.getCurrentStandupDateString()
            + (standupPartner ? '. You will be running Standup with ' + standupPartner : '')
            + '. Glory to Standup bot!';
    };

    this.handleRejection = function (nameOnCallback) {
        this.stateService.recordRejection(nameOnCallback);
        this.adminService.messageAdmins('[ADMIN]: '
            + nameOnCallback
            + ' has rejected their selection for running standup the week of '
            + this.stateService.getCurrentStandupDateString()
        );

        this.selectionService.replaceStandupper(nameOnCallback);
    };

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveButtonApp;
}