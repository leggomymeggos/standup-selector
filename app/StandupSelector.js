//manual reject/latency reject into accept
var NUM_STANDUPPERS = 2;

var slackClient = new SlackClient();
var identificationService = new IdentificationService(slackClient);
var channelService = new ChannelService(identificationService, slackClient);
var notificationService = new NotificationService(channelService, slackClient);
var adminService = new AdminService(notificationService);
var spreadSheetService = new SheetFactory();

var adminSheet = spreadSheetService.getAdminSheet();
var stateSheet = spreadSheetService.getStateSheet();

var appProperties = PropertiesService.getScriptProperties();
var standupperSheet = spreadSheetService.getStandupperSheet(appProperties);

var rawStateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('state');
var currentStateRowRange = rawStateSheet.getRange(rawStateSheet.getLastRow(), 1, 1, 6);
var currentStateRowData = currentStateRowRange.getValues()[0];

var standuppers = buildStanduppers();
var admins = buildAdmins();

function buildStanduppers() {
    return standupperSheet.getDataValues().map(this.rowToStandupper);
}

function buildAdmins() {
    return adminSheet.getDataValues().map(this.rowToAdmin);
}


// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = Thing
// }


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
    var selectedStanduppers = pickStanduppers();

    //id of issuance is row num in spreadsheet
    var standupIssuanceUuid = stateSheet.getLastRowNum();
    var newStateRow = [
        getNextMonday().toLocaleDateString(),
        "not-confirmed",
        "not-confirmed",
        selectedStanduppers.map(function (e) {
            return e.slackName
        }).join(', '),
        '',
        standupIssuanceUuid
    ];

    stateSheet.addNewRow(newStateRow);

    notificationService.notifyStanduppersOfSelection(selectedStanduppers, 'You have been selected to run standup this upcoming week.');
    adminService.notifyAdminsOfSelection(admins, selectedStanduppers);
    selectedStanduppers.forEach(this.incrementSelectionForStandupper)
}

function testResponse() {
    var pl = {
        callback_id: 'robthor_3',
        actions: [
            {
                value: 'yes'
            }
        ]

    };
    Logger.log(stateSheet.getLatestIssuanceId());
    Logger.log(respondToInteraction(pl));
}

function respondToInteraction(payload) {
    console.log('PAYLOAD: ' + payload);
    var issuanceId = payload.callback_id.match(/\d+$/);

    if (issuanceId ? (parseInt(issuanceId[0]) !== stateSheet.getLastRowNum()) : false) {
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
        addConfirmationForStandupper(respondingStandupper);
        adminService.messageAdmins(admins, '[ADMIN]: ' + nameOnCallback + ' has been confirmed to run the upcoming standup.');

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
    adminService.messageAdmins(admins, '[ADMIN]: ' + nameOnCallback
        + ' has rejected their selection for next week\'s standup.');
    replaceStandupper(nameOnCallback);
}

function checkCurrentStateAndNotifyAdmin() {
    var currentStateRow = stateSheet.getDataValues()[0];

    var currentConfirmed = currentStateRow.slice(1, 3).join(', ');
    var selected = currentStateRow[3].split(',');
    var rejected = currentStateRow[4].split(',');

    var awaitingResponse = selected.filter(function (s) {
        return rejected.indexOf(s) === -1;
    }).join(', ');

    adminService.messageAdmins(admins, '[ADMIN]: Current confirmed: ' + currentConfirmed);
    adminService.messageAdmins(admins, '[ADMIN]: Awaiting response from: ' + awaitingResponse);
    adminService.messageAdmins(admins, '[ADMIN]: Current rejected: ' + rejected);
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

    notificationService.notifyStanduppersOfSelection(replacementStandupper,
        'Glory to the bot! You have been selected as a replacement to run standup this upcoming week.');

    //write new selection to list of ppl we've selected
    currentStateRowData[3] += ", " + replacementStandupper[0].slackName;
    currentStateRowRange.setValues([currentStateRowData]);
    incrementSelectionForStandupper(replacementStandupper[0]);
    adminService.messageAdmins(admins, '[ADMIN]: ' + replacementStandupper[0].slackName + ' has been selected as a replacement to run next week\'s standup.');
}

function addConfirmationForStandupper(standupper) {
    var currentStandupperData = standupperSheet.getDataValues();
    var standupperRow = currentStandupperData[standupper.id - 1];
    standupperRow[2] = getNextMonday().toLocaleDateString();
    standupperSheet.setDataValues(currentStandupperData);
}

function incrementSelectionForStandupper(standupper) {
    var currentStandupperData = standupperSheet.getDataValues();
    var standupperRow = currentStandupperData[standupper.id - 1];
    standupperRow[3] === "" ? standupperRow[3] = 1 : standupperRow[3] += 1;
    standupperSheet.setDataValues(currentStandupperData);
}

function standupperFromSlackName(slackName) {
    var indexOfRow;
    var standupperRow = standupperSheet.getDataValues().filter(function (row, index) {
        if (row[0] === slackName) {
            indexOfRow = index;
            return true;
        } else {
            return false;
        }
    })[0];

    return rowToStandupper(standupperRow, indexOfRow);
}

function writeLastConfirmedStandupForStandupper(standupper) {
    var currentStandupperData = standupperSheet.getDataValues();
    var standupperRow = currentStandupperData[standupper[0].id - 1];
    standupperRow[2] = getNextMonday().toLocaleDateString();
    standupperSheet.setDataValues(currentStandupperData);
}

function rowToStandupper(row_data, index) {
    return {
        id: (index + 1),
        slackName: row_data[0],
        email: row_data[1],
        lastStandupRun: row_data[2],
        numTimesSelected: row_data[3],
        forceSelection: row_data[4] !== '',
        // forceOmission: row_data[5] !== '',
        isForceSelected: function() {
            return this.forceSelection;
        },
        // isForceOmitted: function() {
        // },
        getNormalizedFrequencyScore: function () {
            //which is faster i wonder

//      var maxTimesSelected = standuppers.reduce(function(acc, ele) {
//        return Math.max(acc, ele.getNumTimesSelected());
//      }, standuppers[0].getNumTimesSelected());

            var maxTimesSelected = Math.max.apply(Math, standuppers.map(function (su) {
                return su.getNumTimesSelected();
            }));

            return 100 -
                (this.getNumTimesSelected() === maxTimesSelected ? 100 : (100 * this.getNumTimesSelected()) / maxTimesSelected);
        },
        getNormalizedProximityScore: function () {
            var maxNumWeeksSince = standuppers.reduce(function (acc, ele) {
                return Math.max(acc, ele.getNumWeeksSinceLastStandupRun());
            }, standuppers[0].getNumWeeksSinceLastStandupRun());

            return this.getNumWeeksSinceLastStandupRun() === maxNumWeeksSince ? 100 : (100 * this.getNumWeeksSinceLastStandupRun()) / maxNumWeeksSince;
        },
        getProbability: function () {
            return Math.floor((this.getNormalizedProximityScore() * 0.60) + (this.getNormalizedFrequencyScore() * 0.40));
        },
        getNumWeeksSinceLastStandupRun: function () {
            return Math.floor((new Date() - this.lastStandupRun) / 1000 / 60 / 60 / 24 / 7);
        },
        getNumTimesSelected: function () {
            return this.numTimesSelected === '' ? 0 : this.numTimesSelected;
        },
        //Get as array corresponding to spreadsheet row
        toDataArray: function () {
            return [this.slackName, this.email, this.lastStandupRun, this.numTimesSelected, this.forceSelection ? this.forceSelection : ''];
        }
    }
}

function rowToAdmin(row_data) {
    return {
        email: row_data[0]
    };
}

function pickStanduppers() {
    var selected = [];

    standuppers.forEach(function (su) {
        if (su.forceSelection) selected.push(su);
    });

    while (selected.filter(onlyUnique).length < NUM_STANDUPPERS) {
        var randomSelection = selectRandomStandupperByProbability();
        selected.push(randomSelection);
    }

    return selected.filter(onlyUnique);
}

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

