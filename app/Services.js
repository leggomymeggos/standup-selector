function IdentificationService(slackClient) {
  this.slackClient = slackClient;
  
  this.getUserInfo = function(standupper) {
    var userInfo = this.slackClient.getUserInfo(standupper.email);
    return userInfo;
  }.bind(this);
};

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
};

function NotificationService(channelService, slackClient) {
  this.channelService = channelService;
  this.slackClient = slackClient;
  
  this.notifyStanduppersOfSelection = function(standuppers, msg){
    standuppers.forEach(function(e) { this.notifyOfSelection(e, msg) }.bind(this));
  };
  
  this.notify = function(standupper, msg) {
    var slackDmUcid = standupper.slackDmUcid ? standupper.slackDmUcid : this.channelService.getDmUcid(standupper);
    
    slackClient.writeToChannel(msg, slackDmUcid, standupper);
  }.bind(this);
  
  this.notifyOfSelection = function(standupper, msg) {
    var slackDmUcid = standupper.slackDmUcid ? standupper.slackDmUcid : this.channelService.getDmUcid(standupper);
    
    slackClient.writeSelectionPromptToChannel(msg, slackDmUcid, standupper);
  }.bind(this);
};

function AdminService(notificationService) {
  this.notificationService = notificationService;
  
  this.notifyAdminsOfSelection = function(admins, selectedStanduppers) {
    var msg = selectedStanduppers.map(function(e){return e.slackName}).join(' and ') + ' have been selected to run standup this upcoming week.';
    this.notificationService.notify(admins[0], '[ADMIN]: ' + msg);
  }.bind(this);
  
  this.notifyAdminOfAcceptance = function(admin, acceptedStandupper) {
    this.notificationService.notify(admin, acceptedStandupper + ' has confirmed running standup this upcoming week.');
  }.bind(this);
  
  this.notifyAdminOfRejection = function(admin, rejectedStandupper) {
    this.notificationService.notify(admin, rejectedStandupper + ' has rejected running standup this upcoming week.');
  }.bind(this);
  
  this.messageAdmins = function(admins, msg) {
    admins.forEach(function(a) {
      this.notificationService.notify(a, msg);
    });
  }.bind(this);
};