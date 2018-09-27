SheetFactory = require('../../app/SheetFactory').SheetFactory;
Sheet = require('../../app/Sheet').Sheet;
StateSheet = require('../../app/ChildSheets').StateSheet;
AdminSheet = require('../../app/ChildSheets').AdminSheet;
StandupperSheet = require('../../app/ChildSheets').StandupperSheet;

describe("SheetFactory", () => {
    let subject;
    let gPropertiesSpy;
    let gSpreadsheetAppSpy;
    let gActiveSpreadsheetSpy;
    let gSheetSpy;

    beforeEach(() => {
        gSheetSpy = jasmine.createSpyObj('sheet', ['getRange', 'getLastRow', 'appendRow']);

        gPropertiesSpy = jasmine.createSpyObj('gProperties', ['getProperty']);
        gPropertiesSpy.getProperty.and.returnValue('SHEET_NAME');

        gActiveSpreadsheetSpy = jasmine.createSpyObj('gActiveSpreadsheet', ['getSheetByName']);
        gActiveSpreadsheetSpy.getSheetByName.and.returnValue(gSheetSpy);

        gSpreadsheetAppSpy = jasmine.createSpyObj('gSpreadSheetApp', ['getActiveSpreadsheet']);
        gSpreadsheetAppSpy.getActiveSpreadsheet.and.returnValue(gActiveSpreadsheetSpy);

        SpreadsheetApp = gSpreadsheetAppSpy;

        subject = new SheetFactory(gPropertiesSpy);
    });

    it('provides a correctly created stateSheet', () => {
        const result = subject.getStateSheet();

        expect(gPropertiesSpy.getProperty).toHaveBeenCalledWith('STATE_SHEET_NAME');
        expect(gActiveSpreadsheetSpy.getSheetByName).toHaveBeenCalledWith('SHEET_NAME');
        expect(result instanceof StateSheet).toEqual(true);
        expect(result.sheet).toEqual(gSheetSpy);
    });

    it('provides a correctly created adminSheet', () => {
        const result = subject.getAdminSheet();

        expect(gPropertiesSpy.getProperty).toHaveBeenCalledWith('ADMIN_SHEET_NAME');
        expect(gActiveSpreadsheetSpy.getSheetByName).toHaveBeenCalledWith('SHEET_NAME');
        expect(result instanceof AdminSheet).toEqual(true);
        expect(result.sheet).toEqual(gSheetSpy);
    });

    it('provides a correctly created StandupperSheet', () => {
        const result = subject.getStandupperSheet();

        expect(gPropertiesSpy.getProperty).toHaveBeenCalledWith('STANDUPPER_SHEET_NAME');
        expect(gActiveSpreadsheetSpy.getSheetByName).toHaveBeenCalledWith('SHEET_NAME');
        expect(result instanceof StandupperSheet).toEqual(true);
        expect(result.sheet).toEqual(gSheetSpy);
    });

});