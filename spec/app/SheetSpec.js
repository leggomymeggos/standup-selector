Sheet = require('../../app/Sheet');
StandupperSheet = require('../../app/ChildSheets').StandupperSheet;
AdminSheet = require('../../app/ChildSheets').AdminSheet;
StateSheet = require('../../app/ChildSheets').StateSheet;

describe("SheetSpec", () => {
    let gSheetSpy;

    beforeEach(function () {
        gSheetSpy = jasmine.createSpyObj('sheet', ['getRange', 'getLastRow', 'appendRow']);
    });

    describe('Sheet', () => {
        let genericSheet;
        let rangeSpy;

        const rowStart = 0;
        const colStart = 1;
        const rowLength = 2;
        const colLength = 3;

        beforeEach(() => {
            genericSheet = new Sheet(
                gSheetSpy,
                rowStart,
                colStart,
                rowLength,
                colLength);

            rangeSpy = jasmine.createSpyObj('range', ['getValues', 'setValues']);
            gSheetSpy.getRange.and.returnValue(rangeSpy);
        });

        it('getDataValues', () => {
            const expectedDataValues = [[]];
            rangeSpy.getValues.and.returnValue(expectedDataValues);

            const actualDataValues = genericSheet.getDataValues();
            expect(gSheetSpy.getRange).toHaveBeenCalledWith(
                rowStart,
                colStart,
                rowLength,
                colLength
            );
            expect(actualDataValues).toEqual(expectedDataValues);
        });

        it('setDataValues', () => {
            const expectedDataValues = [[]];
            genericSheet.setDataValues(expectedDataValues);

            expect(gSheetSpy.getRange).toHaveBeenCalledWith(
                rowStart,
                colStart,
                rowLength,
                colLength
            );
            expect(rangeSpy.setValues).toHaveBeenCalledWith(expectedDataValues);
        });

        it('getLastRowNum', () => {
            gSheetSpy.getLastRow.and.returnValue(1);
            const actual = genericSheet.getLastRowNum();
            expect(actual).toEqual(1);
        });

        it('addNewRow', () => {
            let expectedDataArray = [];
            genericSheet.addNewRow(expectedDataArray)
            expect(gSheetSpy.appendRow).toHaveBeenCalledWith(expectedDataArray);
        })
    });

    describe('StandupperSheet', () => {
        let standupperSheet;
        const numRowsWithHeader = 3;

        beforeEach(() => {
            gSheetSpy.getLastRow.and.returnValue(numRowsWithHeader);
            standupperSheet = new StandupperSheet(gSheetSpy);
        });

        it("was created with the correct properties", function () {
            expect(standupperSheet.rangeRowStart).toEqual(2);
            expect(standupperSheet.rangeColStart).toEqual(1);
            expect(standupperSheet.rangeRowLength).toEqual(numRowsWithHeader - 1);
            expect(standupperSheet.rangeColLength).toEqual(6);
        });
    });

    describe('AdminSheet', () => {
        let adminSheet;
        const numRowsWithHeader = 3;

        beforeEach(() => {
            gSheetSpy.getLastRow.and.returnValue(numRowsWithHeader);
            adminSheet = new AdminSheet(gSheetSpy);
        });

        it("was created with the correct properties", function () {
            expect(adminSheet.rangeRowStart).toEqual(2);
            expect(adminSheet.rangeColStart).toEqual(1);
            expect(adminSheet.rangeRowLength).toEqual(numRowsWithHeader - 1);
            expect(adminSheet.rangeColLength).toEqual(2);
        });
    });

    describe('StateSheet', () => {
        let stateSheet;
        let currentStateRow = 3;

        beforeEach(() => {
            gSheetSpy.getLastRow.and.returnValue(currentStateRow);
            stateSheet = new StateSheet(gSheetSpy);
        });

        it("was created with the correct properties", function () {
            expect(stateSheet.rangeRowStart).toEqual(currentStateRow);
            expect(stateSheet.rangeColStart).toEqual(1);
            expect(stateSheet.rangeRowLength).toEqual(1);
            expect(stateSheet.rangeColLength).toEqual(6);
        });

        it('getLatestIssuanceId', () => {
            expect(stateSheet.getLatestIssuanceId()).toEqual(currentStateRow - 1)
        });
    });
});