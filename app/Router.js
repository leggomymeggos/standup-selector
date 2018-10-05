//Entry point for POST requests received when published as web app
function doPost(e) {
    var params = e.parameter;

    var payload = JSON.parse(params.payload);
    var providedToken = payload.token;

    if (providedToken !== appProperties.getValue('SLACK_CALLBACK_TOKEN')) {
        var output = ContentService.createTextOutput(JSON.stringify({'error': true}));
        output.setMimeType(ContentService.MimeType.JSON);
        return output;
    } else {
        var newMessage = respondToInteraction(payload);

        var output = ContentService.createTextOutput(JSON.stringify({'text': newMessage}));
        output.setMimeType(ContentService.MimeType.JSON);
        return output;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = doPost
}