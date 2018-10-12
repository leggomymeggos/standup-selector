function Sheet(sheet, rangeRowStart, rangeColStart, rangeRowLength, rangeColLength) {
    this.sheet = sheet;
    this.rangeRowStart = rangeRowStart;
    this.rangeColStart = rangeColStart;
    this.rangeRowLength = rangeRowLength;
    this.rangeColLength = rangeColLength;

    this.getDataValues = function () {
        return this.sheet.getRange(
            this.rangeRowStart,
            this.rangeColStart,
            this.rangeRowLength,
            this.rangeColLength
        ).getValues();
    };

    this.setDataValues = function (data) {
        this.sheet.getRange(
            this.rangeRowStart,
            this.rangeColStart,
            this.rangeRowLength,
            this.rangeColLength
        ).setValues(data);
    };

    this.getLastRowNum = function () {
        return this.sheet.getLastRow();
    };

    this.addNewRow = function (dataArray) {
        this.sheet.appendRow(dataArray);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sheet
}