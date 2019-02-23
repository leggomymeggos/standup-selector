function Initializer(appProperties) {
    this.appproperties = appProperties;
    this.sheetFactory = new SheetFactory(appProperties);

    this.initializeShared = function () {
        this.stateSheet = this.sheetFactory.getStateSheet();
        this.stateService = new StateService(this.stateSheet);

        this.adminSheet = this.sheetFactory.getAdminSheet();
        this.initializeMessaging();

        this.adminService = new AdminService(this.messagingService, this.adminSheet, this.stateService);
    };

    this.newSlashCommandApp = function () {
        this.initializeShared();
        this.commandParser = new CommandParser();
        return new SlashCommandApp(this.commandParser, this.stateService, this.adminService, this.attachmentBuilder);
    };

    this.newInteractiveButtonApp = function () {
        this.initializeShared();

        return new InteractiveButtonApp(this.stateService, this.adminService, this.attachmentBuilder);
    };

    this.initializeMessaging = function() {
        this.attachmentBuilder = new AttachmentBuilder(this.stateService);
        this.slackClient = new SlackClient(this.appproperties, this.attachmentBuilder);
        this.userInfoService = new UserInfoService(this.slackClient);
        this.channelService = new ChannelService(this.userInfoService, this.slackClient);
        this.messagingService = new MessagingService(this.channelService, this.slackClient);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Initializer;
}