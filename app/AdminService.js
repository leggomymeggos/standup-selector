function AdminService(notificationService) {
    this.notificationService = notificationService;

    this.messageAdmins = function(admins, msg) {
        var self = this;
        admins.forEach(function(a) {
            self.notificationService.notify(a, msg);
        });
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {AdminService}
}