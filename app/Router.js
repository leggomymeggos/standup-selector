//Entry point for POST requests received when published as web app
function doPost(e) {
    var params = e.parameter;

    //request for an interactive button response
    var gScriptProperties = PropertiesService.getScriptProperties();

    if (params.payload) {
        var payload = JSON.parse(params.payload);
        var providedToken = payload.token;

        if (providedToken !== gScriptProperties.getProperty('SLACK_CALLBACK_TOKEN')) {
            var output = ContentService.createTextOutput(JSON.stringify({'error': true}));
            output.setMimeType(ContentService.MimeType.JSON);
            return output;
        } else {
            var newMessage = respondToInteraction(payload);

            var output = ContentService.createTextOutput(JSON.stringify({'text': newMessage}));
            output.setMimeType(ContentService.MimeType.JSON);
            return output;
        }
    //admin request or unknown
    } else {
        if (params.token !== gScriptProperties.getProperty('SLACK_CALLBACK_TOKEN')) {
            var output = ContentService.createTextOutput(JSON.stringify({'error': true}));
            output.setMimeType(ContentService.MimeType.JSON);
            return output;
        } else {
            var app = new Initializer(gScriptProperties).newSlashCommandApp();

            var response = app.serviceAdminRequest(params);
            var responseJson = JSON.stringify(response);
            var output = ContentService.createTextOutput(responseJson);
            output.setMimeType(ContentService.MimeType.JSON);

            return output;
        }

    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = doPost;
    Initializer = require('./Initializer');
    //need to explicitly import these for integration tests...
    //probably because theyre both exported from 'services'?
    UserInfoService = require('./Services').UserInfoService;
    ChannelService = require('./Services').ChannelService;
}