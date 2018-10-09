function UserInfoService(slackClient) {
    this.slackClient = slackClient;

    this.getUserInfo = function (email) {
        var userInfo = this.slackClient.getUserInfo(email);
        return userInfo;
    };
}

function ChannelService(userInfoService, slackClient) {
    this.userInfoService = userInfoService;
    this.slackClient = slackClient;

    this.getDmUcid = function (email) {
        var userInfo = this.userInfoService.getUserInfo(email);
        var uuid = userInfo.user.id;

        var openImResponse = this.slackClient.openIm(uuid);
        return openImResponse.channel.id;
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UserInfoService: UserInfoService,
        ChannelService: ChannelService
    }
}