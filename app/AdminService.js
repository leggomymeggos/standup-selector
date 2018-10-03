function AdminService(messagingService, adminSheet, stateService) {
    this.messagingService = messagingService;
    this.adminSheet = adminSheet;
    this.stateService = stateService;

    this.admins = this.adminSheet.getDataValues().map(function (row) {
        return new Admin(row)
    });

    this.messageAdmins = function (msg) {
        var self = this;
        this.admins.forEach(function (a) {
            self.messagingService.notify(a, msg);
        });
    };

    this.sendAdminUpdate = function () {
        var dateString = this.stateService.getCurrentStandupDateString();
        var rejected = this.stateService.getRejectedStandupperNames();
        var selectedNotRejected = this.stateService.getSelectedStandupperNames()
            .filter(function (selected) {
                return !rejected.includes(selected);
            });


        var confirmedMsg = 'Current confirmed: ' + this.stateService.getConfirmedStandupperNames().join(', ');
        var rejectedMsg = 'Current rejected: ' + rejected.join(', ');
        var awaitingMsg = 'Awaiting Response From: ' + selectedNotRejected.join(', ');

        this.messageAdmins(this.formatAdminMessage(confirmedMsg, dateString));
        this.messageAdmins(this.formatAdminMessage(rejectedMsg, dateString));
        this.messageAdmins(this.formatAdminMessage(awaitingMsg, dateString));
    };

    this.formatAdminMessage = function (message, dateString) {
        var adminPrefix = '[ADMIN][' + dateString + '] ';
        return adminPrefix + message;
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminService
}