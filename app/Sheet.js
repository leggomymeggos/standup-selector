function Sheet(sheet, rangeRowStart, rangeColStart, rangeRowLength, rangeColLength) {
    this.sheet = sheet;
    this.rangeRowStart = rangeRowStart;
    this.rangeColStart = rangeColStart;
    this.rangeRowLength = rangeRowLength;
    this.rangeColLength = rangeColLength;

    this.getDataValues = function () {
        return sheet.getRange(rangeRowStart, rangeColStart, rangeRowLength, rangeColLength).getValues();
    };

    this.setDataValues = function (data) {
        sheet.getRange(rangeRowStart, rangeColStart, rangeRowLength, rangeColLength).setValues(data);
    };

    this.getLastRowNum = function () {
        return sheet.getLastRow();
    };

    this.addNewRow = function (dataArray) {
        sheet.appendRow(dataArray);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sheet
}