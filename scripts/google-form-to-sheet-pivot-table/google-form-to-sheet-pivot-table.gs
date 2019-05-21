function createPivotTable(SpreadSheetId, pivotTableSheetId, pivotTableParams) {
    // Create a new sheet which will contain our Pivot Table
    var pivotTableSheetId = pivotTableSheet.getSheetId();

    // Add Pivot Table to new sheet
    // Meaning we send an 'updateCells' request to the Sheets API
    // Specifying via 'start' the sheet where we want to place our Pivot Table
    // And in 'rows' the parameters of our Pivot Table
    var request = {
        "updateCells": {
            "rows": {
                "values": [{
                    "pivotTable": pivotTableParams
                }]
            },
            "start": {
                "sheetId": pivotTableSheetId
            },
            "fields": "pivotTable"
        }
    };

    //Using advanced services google sheets api enable
    Sheets.Spreadsheets.batchUpdate({ 'requests': [request] }, SpreadSheetId);
}

/**
 * Running On Form Submit
 */
function onSubmit() {



    var form = FormApp.getActiveForm();

    var ssId = form.getDestinationId();

    //get active spreadsheet to add
    var activeSpreadsheet = SpreadsheetApp.openById(ssId);
    var sheetName = "Pivot Table";

    var sourceSheet = activeSpreadsheet.getSheets()[0];

    //get first row of source sheet
    var columns = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues();

    var pivotTableParams = {};
    pivotTableParams.values = [];

    columns[0].forEach(function (column, index) {
        // check if column match with [column name]
        var matches = column.match(/\[(.*?)\]/);

        if (matches) {
            pivotTableParams.values.push({
                summarizeFunction: "COUNTA",
                sourceColumnOffset: index
            });
        }
    });


    // The source indicates the range of data you want to put in the table.
    // optional arguments: startRowIndex, startColumnIndex, endRowIndex, endColumnIndex
    pivotTableParams.source = {
        sheetId: sourceSheet.getSheetId()
    };

    // eg: 0 to group by the first column
    pivotTableParams.columns = [{
        sourceColumnOffset: 2,
        sortOrder: "ASCENDING",
        showTotals: true,
    }];

    pivotTableParams.valueLayout = "VERTICAL";

    // Create Sheet if not exists
    var newSheet = activeSpreadsheet.getSheetByName(sheetName);
    if (newSheet != null) {
        activeSpreadsheet.deleteSheet(newSheet);
    }

    newSheet = activeSpreadsheet.insertSheet();
    newSheet.setName(sheetName);

    createPivotTable(activeSpreadsheet.getId(), newSheet.getSheetId(), pivotTableParams);
}