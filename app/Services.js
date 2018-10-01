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