function SlackClient(appProperties, attachmentBuilder) {
    this.appProperties = appProperties;
    this.attachmentBuilder = attachmentBuilder;

    this.openImUrl = this.appProperties.getProperty('SLACK_URL_OPEN_IM');
    this.userInfoByEmailUrl = this.appProperties.getProperty('SLACK_URL_USER_INFO_BY_EMAIL');
    this.postMessageUrl = this.appProperties.getProperty('SLACK_URL_POST_MESSAGE');

    this.openIm = function (uuid) {
        var body = {
            'user': uuid
        };

        var resp = this.postSlackJson(body, this.openImUrl);
        return JSON.parse(resp.getContentText());
    };

    this.getUserInfo = function (email) {
        var body = {
            'email': email
        };

        var resp = this.postSlackFormUrlEncoded(body, this.userInfoByEmailUrl);
        return JSON.parse(resp.getContentText());
    };

    this.writeToChannel = function (msg, cuid) {
        var body = {
            'text': msg,
            'channel': cuid
        };
        return this.postMessage(body);
    };

    this.writeToChannelWithSelectionAttachment = function (msg, cuid, slackName) {
        var body = {
            'text': msg,
            'channel': cuid,
            'attachments': this.attachmentBuilder.buildSelectionPrompt(slackName)
        };
        return this.postMessage(body);
    };

    this.postMessage = function (body) {
        var resp = this.postSlackJson(body, this.postMessageUrl);
        return JSON.parse(resp.getContentText());
    };

    this.postSlackJson = function (body, target) {
        var payload = JSON.stringify(body);
        var token = 'Bearer ' + this.appProperties.getProperty('SLACK_API_TOKEN');

        var opts = {
            'method': 'post',
            'contentType': 'application/json',
            'headers': {
                'Authorization': token
            },
            'payload': payload
        };
        return UrlFetchApp.fetch(target, opts);
    };

    this.postSlackFormUrlEncoded = function (payload, target) {
        var tokenData = {'token': this.appProperties.getProperty('SLACK_API_TOKEN')};
        var formData = mergeObjs(payload, tokenData);
        var opts = mergeObjs({
            'method': 'post',
            'contentType': 'application/x-www-form-urlencoded'
        }, {
            'payload': formData
        });

        return UrlFetchApp.fetch(target, opts);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlackClient;
}