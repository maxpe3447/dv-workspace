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
      a.download = (exportFileName ?? 'export') + '.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  exportToCsv<T>(
    cols: DvColDef<T>[],
    rows: T[],
    getValue: (row: T, field: string) => any,
    exportFileName?: string
  ): void {
    const escape = (val: any): string => {
      const str = val == null ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const headers = cols.map(col => escape(col.headerName ?? col.field));
    const dataRows = rows.map(row =>
      cols.map(col =>
        escape(col.valueFormatter ? col.valueFormatter(row) : getValue(row, col.field))
      ).join(',')
    );

    const csv = [headers.join(','), ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (exportFileName ?? 'export') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
