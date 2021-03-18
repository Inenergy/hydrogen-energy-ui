const path = require('path');
const ExcelJS = require('exceljs');
const { writeFile } = require('fs');

let file;
let fileIdx = 1;

function createFile({ name, headers, worksheets: ws }) {
  const workbook = new ExcelJS.Workbook();
  const worksheets = [];
  for (let i = 0; i < ws.length; ++i) {
    worksheets.push(workbook.addWorksheet(ws[i]));
    worksheets[i].columns = headers[i].map((header) => ({
      header,
      width: header.length + 3,
    }));
  }
  file = {
    name,
    workbook,
    worksheets,
  };
}

function writeRows(rows) {
  if (!file) return;
  for (let i = 0; i < rows.length; ++i) file.worksheets[i].addRow(rows[i]);
}

function saveFile(dir, cb) {
  for (const ws of file.worksheets) stylizeSheet(ws);
  file.workbook.xlsx
    .writeBuffer()
    .then((blob) =>
      writeFile(
        path.join(dir, `${file.name}_${fileIdx++}.xlsx`),
        blob,
        cb
      )
    );
}

function stylizeSheet(ws) {
  var borderline = { style: 'thin' };
  var borderStyle = {
    top: borderline,
    left: borderline,
    bottom: borderline,
    right: borderline,
  };

  rows = ws.getRows(2, ws.rowCount - 1);
  rows.forEach((r) => {
    for (let c = 1; c <= ws.columnCount; c++) {
      let cell = r.getCell(c);
      cell.border = borderStyle;
      cell.font = { name: 'Arial', size: 10, bold: false };
    }
  });

  headerRow = ws.getRow(1);
  for (let c = 1; c <= ws.columnCount; c++) {
    let cell = headerRow.getCell(c);
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'darkVertical',
      fgColor: { argb: 'FFc0c0c0' },
    };
    cell.border = borderStyle;
  }
}

module.exports = {
  writeRows,
  createFile,
  saveFile,
};
