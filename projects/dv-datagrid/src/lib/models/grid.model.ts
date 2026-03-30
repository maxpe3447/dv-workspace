import { Signal, TemplateRef, Type } from '@angular/core';
import { FilterInstance, FilterModel } from './filter.model';
import { DvGridLocale } from './locale.model';

export type SortDirection = 'asc' | 'desc';

export interface SortItem {
  colId: string;
  sort: SortDirection;
}

export type FilterType = 'text' | 'number' | 'date' | 'set';

export interface DvColDef<T = any> {
  field: string;
  colId?: string;
  headerName?: string;
  sortable?: boolean;
  filter?: boolean | FilterType;
  filterValues?: any[];
  width?: number;
  resizable?: boolean;
  valueFormatter?: (param: T) => any;
  cellClass?: string | ((params: CellClassParams<T>) => string);
  cellRenderer?: Type<any> | TemplateRef<any>;
  cellRendererParams?: Record<string, T>;
  tooltipField?: string;
  tooltipValueGetter?: (params: CellClassParams<T>) => string;
  headerTooltip?: string;
}

export interface CellClassParams<T = any> {
  value: any;
  row: T;
  field: string;
  rowIndex: number;
}

export interface DvRowClickEvent<T = any> {
  row: T;
  rowIndex: number;
}

export interface ServerRequestParams {
  page: number;
  pageSize: number;
  sortModel: SortItem[];
  filterModel: FilterModel;
}

export interface DvGridOptions {
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeOptions?: number[];
  rowModelType?: 'serverSide';
  theme?: 'alpine' | 'material' | 'dark' | 'custom';
  enableColumnResize?: boolean;
  rowSelection?: 'single' | 'multi';
  getRowId?: (row: any) => any;
  locale?: Partial<DvGridLocale>;
  tooltipShowDelay?: number;
  rowExpansion?: { enabled: boolean };
  exportFileName?: string;
}

export interface DvGridApi {
  // Data
  setServerData(rows: any[], totalRecords: number): void;
  refreshServerData(): void;

  // Reactive state (signals)
  readonly sortModel: Signal<SortItem[]>;
  readonly filterModel: Signal<FilterModel>;
  readonly currentPage: Signal<number>;
  readonly pageSize: Signal<number>;
  readonly totalRecords: Signal<number>;
  readonly totalPages: Signal<number>;
  readonly rowData: Signal<any[]>;
  readonly isLoading: Signal<boolean>;

  // Selection
  readonly selectedRowIds: Signal<Set<any>>;
  selectRow(id: any): void;
  deselectRow(id: any): void;
  toggleRowSelection(id: any): void;
  selectAll(ids: any[]): void;
  deselectAll(): void;
  clearSelection(): void;
  isRowSelected(id: any): boolean;

  // Pagination
  setPage(page: number): void;
  setPageSize(pageSize: number): void;

  // Filtering
  setColumnFilter(field: string, filter: FilterInstance): void;
  clearColumnFilter(field: string): void;

  // Reset
  resetFilters(): void;
  resetSort(): void;
  resetAll(): void;
}
