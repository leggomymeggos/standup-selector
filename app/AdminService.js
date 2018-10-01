function AdminService(messagingService) {
    this.messagingService = messagingService;

    this.messageAdmins = function(admins, msg) {
        var self = this;
        admins.forEach(function(a) {
            self.messagingService.notify(a, msg);
        });
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {AdminService}
}