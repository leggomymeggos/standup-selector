function UserInfoService(slackClient) {
    this.slackClient = slackClient;

    this.getUserInfo = function (email) {
        var userInfo = this.slackClient.getUserInfo(email);
        return userInfo;
    };
}

function ChannelService(identificationService, slackClient) {
    this.identificationService = identificationService;
    this.slackClient = slackClient;

    this.getDmUcid = function (email) {
        var userInfo = this.identificationService.getUserInfo(email)
        var uuid = userInfo.user.id;

        var openImResponse = this.slackClient.openIm(uuid);
        standupper.slackDmUcid = openImResponse.channel.id;
        return openImResponse.channel.id;
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UserInfoService: UserInfoService,
        ChannelService: ChannelService
    }
}