function MessagingService(channelService, slackClient) {
    this.channelService = channelService;
    this.slackClient = slackClient;

    this.notifyStanduppersOfSelection = function(standuppers, msg){
        standuppers.forEach(function(e) { this.notifyOfSelection(e, msg) }.bind(this));
    };

    this.sendMessage = function(standupper, msg) {
        var dmUcid = standupper.dmUcid ? standupper.dmUcid : this.channelService.getDmUcid(standupper.email);

        this.slackClient.writeToChannel(msg, dmUcid);
    };

    this.notifyOfSelection = function(standupper, msg) {
        var dmUcid = standupper.dmUcid ? standupper.dmUcid : this.channelService.getDmUcid(standupper.email);

        this.slackClient.writeToChannelWithSelectionAttachment(msg, dmUcid, standupper.slackName);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessagingService
}