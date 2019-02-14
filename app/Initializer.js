function Initializer(appProperties) {
    this.appproperties = appProperties;
    this.sheetFactory = new SheetFactory(appProperties);

    this.newSlashCommandApp = function () {
        this.commandParser = new CommandParser();
        this.stateSheet = this.sheetFactory.getStateSheet();
        this.adminSheet = this.sheetFactory.getAdminSheet();
        this.stateService = new StateService(this.stateSheet);
        this.messagingService = this.newMessagingService();

        this.adminService = new AdminService(this.messagingService, this.adminSheet, this.stateService);
        return new SlashCommandApp(this.commandParser, this.stateService, this.adminService, this.attachmentBuilder);
    };

    this.newMessagingService = function() {
        this.attachmentBuilder = new AttachmentBuilder(this.stateService);
        this.slackClient = new SlackClient(this.appproperties, this.attachmentBuilder);
        this.userInfoService = new UserInfoService(this.slackClient);
        this.channelService = new ChannelService(this.userInfoService, this.slackClient);
        return new MessagingService(this.channelService, this.slackClient);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Initializer;
}