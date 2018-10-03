function SlackClient(appProperties, attachmentBuilder) {
    this.appProperties = appProperties;
    this.attachmentBuilder = attachmentBuilder;
    const openImUrl = 'https://slack.com/api/im.open';
    const userInfoByEmailUrl = 'https://slack.com/api/users.lookupByEmail';

    this.openIm = function (uuid) {
        var body = {
            'user': uuid
        };

        var resp = this.postSlackJson(body, openImUrl);
        return JSON.parse(resp.getContentText());
    };

    this.getUserInfo = function (email) {
        var body = {
            'email': email
        };

        var resp = this.postSlackFormUrlEncoded(body, userInfoByEmailUrl);
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
        const slack_post_message_url = 'https://slack.com/api/chat.postMessage';

        var resp = this.postSlackJson(body, slack_post_message_url);
        return JSON.parse(resp.getContentText());
    };

    this.postSlackJson = function (body, target) {
        var payload = JSON.stringify(body);
        var token = 'Bearer ' + this.appProperties.getValue('SLACK_API_TOKEN');

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
        var tokenData = {'token': this.appProperties.getValue('SLACK_API_TOKEN')};
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