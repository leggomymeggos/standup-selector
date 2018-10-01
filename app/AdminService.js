function AdminService(messagingService, adminSheet) {
    this.messagingService = messagingService;
    this.adminSheet = adminSheet;

    this.admins = this.adminSheet.getDataValues().map(function (row) {
        return new Admin(row)
    });

    this.messageAdmins = function(msg) {
        var self = this;
        this.admins.forEach(function(a) {
            self.messagingService.notify(a, msg);
        });
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {AdminService}
}