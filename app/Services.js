function IdentificationService(slackClient) {
  this.slackClient = slackClient;
  
  this.getUserInfo = function(standupper) {
    var userInfo = this.slackClient.getUserInfo(standupper.email);
    return userInfo;
  }.bind(this);
}

function ChannelService(identificationService, slackClient) {
  this.identificationService = identificationService;
  this.slackClient = slackClient;
  
  this.getDmUcid = function(standupper) {
    var userInfo = this.identificationService.getUserInfo(standupper)
    var uuid = userInfo.user.id;
    
    var openImResponse = this.slackClient.openIm(uuid);
    standupper.slackDmUcid = openImResponse.channel.id;
    return openImResponse.channel.id;
  }.bind(this);
}

function NotificationService(channelService, slackClient) {
  this.channelService = channelService;
  this.slackClient = slackClient;
  
  this.notifyStanduppersOfSelection = function(standuppers, msg){
    standuppers.forEach(function(e) { this.notifyOfSelection(e, msg) }.bind(this));
  };
  
  this.notify = function(standupper, msg) {
    var slackDmUcid = standupper.slackDmUcid ? standupper.slackDmUcid : this.channelService.getDmUcid(standupper);
    
    this.slackClient.writeToChannel(msg, slackDmUcid, standupper);
  }.bind(this);
  
  this.notifyOfSelection = function(standupper, msg) {
    var slackDmUcid = standupper.slackDmUcid ? standupper.slackDmUcid : this.channelService.getDmUcid(standupper);
    
    this.slackClient.writeSelectionPromptToChannel(msg, slackDmUcid, standupper);
  }.bind(this);
}