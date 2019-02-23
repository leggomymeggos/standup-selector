function InteractiveButtonApp(stateService, adminService, selectionService, standupperService) {
    this.stateService = stateService;
    this.adminService = adminService;
    this.selectionService = selectionService;
    this.standupperService = standupperService;

    this.respondToInteraction = function (payload) {
        if (this.stateService.validateCallbackId(payload.callback_id)) {
            var nameOnCallback = payload.callback_id.split('_')[0];

            if (stateService.getRejectedStandupperNames().includes(nameOnCallback)) {
                return 'You have already rejected this standup issuance and will be replaced';
            }

            if (payload.actions[0].value === 'yes') {
                this.handleConfirmation(nameOnCallback);
            } else if (payload.actions[0].value === 'no') {
                this.handleRejection(nameOnCallback);
                return 'You will be replaced...for running standup';
            } else {

            }
        } else {
            return 'This standup issuance you have responded to is for an older or invalid week.';
        }

    };

    this.handleConfirmation = function (nameOnCallback) {
        this.stateService.recordConfirmation(nameOnCallback);
    };

    this.handleRejection = function (nameOnCallback) {
        this.stateService.recordRejection(nameOnCallback);
        this.adminService.messageAdmins('[ADMIN]: '
            + nameOnCallback
            + ' has rejected their selection for running standup the week of '
            + this.stateService.getCurrentStandupDateString());

        this.selectionService.replaceStandupper(nameOnCallback);
    };

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveButtonApp;
}