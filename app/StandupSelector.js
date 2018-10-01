var appProperties = PropertiesService.getScriptProperties();
var sheetFactory = new SheetFactory(appProperties);

var adminSheet = sheetFactory.getAdminSheet();
var stateSheet = sheetFactory.getStateSheet();
var standupperSheet = sheetFactory.getStandupperSheet();

var slackClient = new SlackClient();
var identificationService = new IdentificationService(slackClient);
var channelService = new ChannelService(identificationService, slackClient);
var messagingService = new MessagingService(channelService, slackClient);

var adminService = new AdminService(messagingService, adminSheet);
var standupperService = new StandupperService(standupperSheet);
var stateService = new StateService(stateSheet);

var algorithmService = new AlgorithmService();
var selectionService = new SelectionService(standupperService, algorithmService);

var rawStateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('state');
var currentStateRowRange = rawStateSheet.getRange(rawStateSheet.getLastRow(), 1, 1, 6);
var currentStateRowData = currentStateRowRange.getValues()[0];

var standuppers = standupperService.getStanduppers();

// function constTest() {
//   (function(){
//     const TEST1 = 3;
//     const asdfghjl = 4;
//
//     const a = function() {
//       Logger.log('a' + TEST1 + asdfghjl);
//     };
//
//     a();
//
//
//   })();
// }

function runSelectionApp() {
    var selectedStanduppers = selectionService.pickStanduppers();

    stateService.createNewStandup(selectedStanduppers);

    messagingService.notifyStanduppersOfSelection(selectedStanduppers, 'You have been selected to run standup this upcoming week.');

    var msg = selectedStanduppers.map(function (e) {
        return e.slackName
    }).join(' and ') + ' have been selected to run standup this upcoming week.';
    adminService.messageAdmins(msg);

    selectedStanduppers.forEach(standupperService.incrementSelection);
}

function respondToInteraction(payload) {
    console.log('PAYLOAD: ' + payload);
    var issuanceId = payload.callback_id.match(/\d+$/);

    if (issuanceId ? (parseInt(issuanceId[0]) !== stateService.getCurrentIssuanceId()) : false) {
        return 'This standup issuance is for an older week; it is no longer active. How dare you try to break glorious standup bot.';
    }

    var nameOnCallback = payload.callback_id.split('_')[0];

    if (payload.actions[0].value === 'yes') {

        var confirmedCols = currentStateRowData.slice(1, 3).filter(function (c) {
            return c !== 'not-confirmed'
        });
        var response = '';

        switch (confirmedCols.length) {
            case 0:
                currentStateRowData[1] = nameOnCallback;
                response = 'You have wisely accepted standup bot\'s offer. Glory to standup bot!';
                break;
            case 1:
                if (confirmedCols.includes(nameOnCallback)) {
                    response = 'You are already confirmed to run standup';
                } else {
                    currentStateRowData[2] = nameOnCallback;
                    response = 'You have wisely accepted standup bot\'s offer. Glory to standup bot!';
                    response += ' You will be running standup with ' + confirmedCols.filter(function (col) {
                        return col !== nameOnCallback;
                    })[0];
                }
                break;
            case 2:
                if (confirmedCols.includes(nameOnCallback)) {
                    response = 'You are already confirmed to run standup with ' + confirmedCols.filter(function (col) {
                        return col !== nameOnCallback;
                    })[0];
                } else {
                    response = confirmedCols.join(',') + ' are already confirmed to run standup';
                }
                break;
            default:
                response = 'Error.';
                break;
        }

        currentStateRowRange.setValues([currentStateRowData]);

        var respondingStandupper = standuppers.filter(function (su) {
            return su.slackName === nameOnCallback
        })[0];
        standupperService.addConfirmationForStandupper(respondingStandupper);
        adminService.messageAdmins('[ADMIN]: ' + nameOnCallback + ' has been confirmed to run the upcoming standup.');

        return response;

    } else if (payload.actions[0].value === 'no') {
        if (currentStateRowData[4].split(', ').includes(nameOnCallback)) {
            return 'You have already rejected this issuance and will be replaced';
        } else {
            rejectAndReplace(nameOnCallback);
            return 'You will be replaced...for running standup this upcoming week.';
        }
    }
}

function rejectAndReplace(nameOnCallback) {
    currentStateRowData[4] = currentStateRowData[4] === '' ? nameOnCallback : currentStateRowData[4] + ', ' + nameOnCallback;
    currentStateRowRange.setValues([currentStateRowData]);
    adminService.messageAdmins('[ADMIN]: ' + nameOnCallback
        + ' has rejected their selection for next week\'s standup.');
    replaceStandupper(nameOnCallback);
}

function replaceStandupper(replacedName) {
    var rejected = currentStateRowData[4].split(', ');
    var alreadySelected = currentStateRowData[3].split(', ');
    var newSelections = [];

    while (newSelections.filter(function (e) {
        return !rejected.includes(e.slackName) && !alreadySelected.includes(e.slackName);
    }).length < 1) {
        newSelections.push(selectRandomStandupperByProbability());
    }

    var replacementStandupper = newSelections.filter(function (e) {
        return !rejected.includes(e.slackName) && !alreadySelected.includes(e.slackName);
    }).slice(0, 1);

    messagingService.notifyStanduppersOfSelection(replacementStandupper,
        'Glory to the bot! You have been selected as a replacement to run standup this upcoming week.');

    //write new selection to list of ppl we've selected
    currentStateRowData[3] += ", " + replacementStandupper[0].slackName;
    currentStateRowRange.setValues([currentStateRowData]);
    standupperService.incrementSelection(replacementStandupper[0]);
    adminService.messageAdmins('[ADMIN]: ' + replacementStandupper[0].slackName + ' has been selected as a replacement to run next week\'s standup.');
}

//useful - move to admin
function identifyStanduppers() {
    var newStandupperData = [];
    standuppers.forEach(function (su, index) {
        var userInfo = identificationService.getUserInfo(su);
        Logger.log('Identifying: ' + su.slackName);
        su.slackName = userInfo.user ? userInfo.user.name : (userInfo.error + '[' + su.email + ']');
        newStandupperData.push(su.toDataArray());
    });

    standupperSheet.setDataValues(newStandupperData);
}

//useful - move to admin
function checkCurrentStateAndNotifyAdmin() {
    var currentStateRow = stateSheet.getDataValues()[0];

    var currentConfirmed = currentStateRow.slice(1, 3).join(', ');
    var selected = currentStateRow[3].split(',');
    var rejected = currentStateRow[4].split(',');

    var awaitingResponse = selected.filter(function (s) {
        return rejected.indexOf(s) === -1;
    }).join(', ');

    adminService.messageAdmins('[ADMIN]: Current confirmed: ' + currentConfirmed);
    adminService.messageAdmins('[ADMIN]: Awaiting response from: ' + awaitingResponse);
    adminService.messageAdmins('[ADMIN]: Current rejected: ' + rejected);
}

//still being used herein by replacement flow
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

