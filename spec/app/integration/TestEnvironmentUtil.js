function FakeGSheet(sheetData) {
    this.sheetData = sheetData;
    this.rowStart = 0;
    this.colStart = 0;
    this.rowLen = 0;
    this.colLen = 0;

    //row/colStart are not zero-indexed
    this.getRange = function (rowStart, colStart, rowLen, colLen) {
        this.rowStart = rowStart;
        this.colStart = colStart;
        this.rowLen = rowLen;
        this.colLen = colLen;
        return this;
    };

    this.setValues = function (rangeData) {
        if (rangeData.length !== this.colLen) {
            throw "Invalid data provided for current range";
        } else if (rangeData.filter(function (row) {
            return row.length !== colLen
        }).length > 0) {
            throw "Every row must have as many columns as specified in the range";
            //currently dont ever use a range that doesnt start at the first column
        } else if (this.colStart !== 1) {
            throw "Not yet implemented!";
        } else {

            var currRow = this.rowStart;
            var self = this;

            rangeData.forEach(function (rangeRow) {
                self.sheetData[currRow++] = rangeRow;
            });
        }

    };

    this.getLastRow = function () {
        return this.sheetData.length
    };

    //why is rowStart 2
    this.getValues = function () {
        var values = this.sheetData.slice((this.rowStart - 1), (this.rowStart + this.rowLen));
        return values;
    };
}

function FakeProperties(propertyStore) {
    this.propertyStore = propertyStore;

    this.getProperty = function (name) {
        return this.propertyStore[name];
    };
}

function TestEnvBuilder() {
    this.addScriptProperty = function (key, value) {
        this.propertyStore ? this.propertyStore[key] = value : this.propertyStore = {key: value};
        return this;
    };

    this.configureGSheets = function (stateGSheet, adminGSheet, standupperGSheet) {
        this.stateGSheet = stateGSheet;
        this.adminGSheet = adminGSheet;
        this.standupperGSheet = standupperGSheet;
        return this;
    };

    this.build = function () {
        var self = this;
        var fakeProperties = new FakeProperties(this.propertyStore);

        PropertiesService = {
            getScriptProperties: function () {
                return fakeProperties;
            }
        };

        ContentService = new function () {
            this.createTextOutput = function (payload) {
                return new function (payload) {
                    this.payload = payload;
                    this.setMimeType = function (mimeType) {
                        this.mimeType = mimeType;
                    }
                }(payload);
            };

            this.MimeType = {JSON: 'JSON'};
        }();

        SpreadsheetApp = new function () {
            this.getActiveSpreadsheet = function () {
                return new function () {
                    this.getSheetByName = function (name) {
                        switch (name) {
                            case self.propertyStore['STATE_SHEET_NAME']:
                                return self.stateGSheet;
                            case self.propertyStore['ADMIN_SHEET_NAME']:
                                return self.adminGSheet;
                            case self.propertyStore['STANDUPPER_SHEET_NAME']:
                                return self.standupperGSheet;
                            default:
                                throw 'what you doin bruh';
                        }
                    };
                }();
            }
        }();

        UrlFetchApp = new function () {
            this.fetched = [];

            this.fetch = function (target, opts) {
                var request = {
                    target: target,
                    opts: opts
                };

                this.fetched.push(request);
                return request;
            };
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TestEnvBuilder: TestEnvBuilder,
        FakeGSheet: FakeGSheet
    };
}