function IdentificationApp(standupperService, userInfoService) {
    this.standupperService = standupperService;
    this.userInfoService = userInfoService;

    this.identifyStanduppers = function () {
        var standuppers = this.standupperService.getStanduppers();

        standuppers.forEach(function (su) {
            if (su.slackName === '') {
                var userInfo = userInfoService.getUserInfo(su.email);

                su.slackName = userInfo.user.name;
                standupperService.saveStandupper(su);
            }
        });
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = IdentificationApp
}
