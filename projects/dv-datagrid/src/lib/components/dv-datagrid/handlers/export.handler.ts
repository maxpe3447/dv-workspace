import * as ExcelJS from 'exceljs';
import { DvColDef } from '../../../models/grid.model';

export class GridExportHandler {
  exportToExcel<T>(
    cols: DvColDef<T>[],
    rows: T[],
    getValue: (row: T, field: string) => any,
    exportFileName?: string
  ): void {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1');

    ws.addRow(cols.map(col => col.headerName ?? col.field));
    rows.forEach(row =>
      ws.addRow(cols.map(col =>
        col.valueFormatter ? col.valueFormatter(row) : getValue(row, col.field)
      ))
    );

    wb.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFileName ?? 'export.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
