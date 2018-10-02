function MessagingService(channelService, slackClient) {
    this.channelService = channelService;
    this.slackClient = slackClient;

    this.notifyStanduppersOfSelection = function(standuppers, msg){
        standuppers.forEach(function(e) { this.notifyOfSelection(e, msg) }.bind(this));
    };

    this.notify = function(standupper, msg) {
        var slackDmUcid = standupper.slackDmUcid ? standupper.slackDmUcid : this.channelService.getDmUcid(standupper);

        this.slackClient.writeToChannel(msg, slackDmUcid);
    };

    this.notifyOfSelection = function(standupper, msg) {
        var slackDmUcid = standupper.slackDmUcid ? standupper.slackDmUcid : this.channelService.getDmUcid(standupper);

        this.slackClient.writeToChannelWithSelectionAttachment(msg, slackDmUcid, standupper.slackName);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessagingService
}