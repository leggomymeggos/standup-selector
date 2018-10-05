var appProperties = PropertiesService.getScriptProperties();
var sheetFactory = new SheetFactory(appProperties);

var adminSheet = sheetFactory.getAdminSheet();
var stateSheet = sheetFactory.getStateSheet();
var standupperSheet = sheetFactory.getStandupperSheet();

var stateService = new StateService(stateSheet);
var attachmentBuilder = new AttachmentBuilder(stateService);

var slackClient = new SlackClient(attachmentBuilder);
var identificationService = new IdentificationApp(slackClient);
var channelService = new ChannelService(identificationService, slackClient);
var messagingService = new MessagingService(channelService, slackClient);

var standupperService = new StandupperService(standupperSheet);
var adminService = new AdminService(messagingService, adminSheet, stateService);

var algorithmService = new AlgorithmService();
var selectionService = new SelectionService(standupperService, algorithmService);

var standuppers = standupperService.getStanduppers();

function swapToTestEnvironment() {
    appProperties.setProperty('STATE_SHEET_NAME', 'test-state');
    appProperties.setProperty('ADMIN_SHEET_NAME', 'test-admin');
    appProperties.setProperty('STANDUPPER_SHEET_NAME', 'test-standuppers');
}

function swapToProdEnvironment() {
    appProperties.setProperty('STATE_SHEET_NAME', 'state');
    appProperties.setProperty('ADMIN_SHEET_NAME', 'admin');
    appProperties.setProperty('STANDUPPER_SHEET_NAME', 'standuppers');
}


function runSelectionApp() {
    var selectedStanduppers = selectionService.pickStanduppers();

    stateService.createNewStandup(selectedStanduppers);

    messagingService.notifyStanduppersOfSelection(
        selectedStanduppers,
        'You have been selected to run standup for the week of ' + stateService.getCurrentStandupDateString()
    );

    var msg = selectedStanduppers.map(function (e) {
        return e.slackName
    }).join(' and ') + ' have been selected to run standup the week of ' + stateService.getCurrentStandupDateString();
    adminService.messageAdmins(msg);

    selectedStanduppers.forEach(standupperService.incrementSelection);
}

function respondToInteraction(payload) {
    console.log('PAYLOAD: ' + JSON.stringify(payload));
    var issuanceId = payload.callback_id.match(/\d+$/);

    if (issuanceId ? (parseInt(issuanceId[0]) !== stateService.getCurrentIssuanceId()) : false) {
        return 'This standup issuance is for an older week; it is no longer active. How dare you try to break glorious standup bot.';
    }

    var nameOnCallback = payload.callback_id.split('_')[0];

    if (payload.actions[0].value === 'yes') {

        var confirmed = stateService.getConfirmedStandupperNames();
        var response = '';

        switch (confirmed.length) {
            case 0:
                stateService.recordConfirmation(nameOnCallback);
                response = 'You have wisely accepted standup bot\'s offer. You will help run standup the week of '
                    + stateService.getCurrentStandupDateString()
                    + '. Glory to standup bot!';
                break;
            case 1:
                if (confirmed.includes(nameOnCallback)) {
                    response = 'You are already confirmed to run standup the week of ' + stateService.getCurrentStandupDateString();
                } else {
                    stateService.recordConfirmation(nameOnCallback);
                    response = 'You have wisely  accepted standup bot\'s offer. You will help run standup the week of '
                        + stateService.getCurrentStandupDateString()
                        + '. Glory to standup bot!';

                    if (confirmed.length > 0) {
                        response += ' You will be running standup with ' + confirmed.filter(function (col) {
                            return col !== nameOnCallback;
                        })[0];
                    }
                }
                break;
            case 2:
                if (confirmed.includes(nameOnCallback)) {
                    response = 'You are already confirmed to run standup the week of ' +
                        stateService.getCurrentStandupDateString();

                    var standupPartners = confirmed.filter(function (col) {
                        return col !== nameOnCallback;
                    })[0];

                    if (standupPartners) response += 'You will run the standup with ' + standupPartners;
                } else {
                    response = confirmed.join(',') + ' are already confirmed to run standup the week of ' + stateService.getCurrentStandupDateString();
                }
                break;
            default:
                response = 'Error.';
                break;
        }

        var respondingStandupper = standuppers.filter(function (su) {
            return su.slackName === nameOnCallback
        })[0];
        standupperService.addConfirmationForStandupper(respondingStandupper);
        adminService.messageAdmins('[ADMIN]: ' + nameOnCallback + ' has been confirmed to run standup the week of ' + stateService.getCurrentStandupDateString());

        return response;

    } else if (payload.actions[0].value === 'no') {
        if (stateService.getRejectedStandupperNames().includes(nameOnCallback)) {
            return 'You have already rejected this standup issuance and will be replaced';
        } else {
            stateService.recordRejection(nameOnCallback);
            adminService.messageAdmins('[ADMIN]: ' + nameOnCallback
                + ' has rejected their selection for running standup the week of ' + stateService.getCurrentStandupDateString());
            replaceStandupper(nameOnCallback);
            return 'You will be replaced...for running standup';
        }
    }
}

function replaceStandupper(replacedName) {
    var rejected = stateService.getRejectedStandupperNames();
    var alreadySelected = stateService.getSelectedStandupperNames();
    var forceOmitted = standupperService.getOmittedStandupperNames();
    var newSelections = [];

    //replacement
    //rewrite this
    while (newSelections
        .filter(function (e) {
            return !rejected.includes(e.slackName) && !alreadySelected.includes(e.slackName) && !forceOmitted.includes(e.slackName);
        }).length < 1) {
        newSelections.push(selectRandomStandupperByProbability());
    }

    var replacementStandupper = newSelections.filter(function (e) {
        return !rejected.includes(e.slackName) && !alreadySelected.includes(e.slackName) && !forceOmitted.includes(e.slackName);
    }).slice(0, 1);

    messagingService.notifyStanduppersOfSelection(replacementStandupper,
        'Glory to the bot! You have been selected as a replacement to run standup the week of ' + stateService.getCurrentStandupDateString());

    stateService.recordSelection(replacementStandupper[0].slackName);
    standupperService.incrementSelection(replacementStandupper[0]);
    adminService.messageAdmins('[ADMIN]: ' + replacementStandupper[0].slackName +
        ' has been selected as a replacement to run standup the week of ' + stateService.getCurrentStandupDateString());
}

//TODO - still being used herein by replacement flow
function selectRandomStandupperByProbability() {
    var totalWeight = standuppers.reduce(function (acc, ele) {
        return acc + ele.getProbability();
    }, 0);
    var random = Math.floor(Math.random() * totalWeight) + 1;
    var selected;

    standuppers.slice().sort(randomize).some(function (standupper) {
        random -= standupper.getProbability();

        if (random <= 0) {
            selected = standupper;
            return true;
        } else {
            return false;
        }
    });
    return selected;
}

