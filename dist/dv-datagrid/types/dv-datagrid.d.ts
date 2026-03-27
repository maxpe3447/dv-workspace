import * as dv_datagrid from 'dv-datagrid';
import * as _angular_core from '@angular/core';
import { Type, TemplateRef, Signal, OnInit, OnDestroy } from '@angular/core';

type TextFilterOperator = 'ctns' | 'eq' | 'sw' | 'ew';
type NumberFilterOperator = 'eq' | '>' | '<' | 'btw';
type DateFilterOperator = 'eq' | 'before' | 'after' | 'btw';
interface TextFilter {
    type: 'text';
    operator: TextFilterOperator;
    value: string;
}
interface NumberFilter {
    type: 'number';
    operator: NumberFilterOperator;
    value: number | null;
    valueTo?: number | null;
}
interface DateFilter {
    type: 'date';
    operator: DateFilterOperator;
    value: string | null;
    valueTo?: string | null;
}
interface SetFilter {
    type: 'set';
    values: any[];
}
type FilterInstance = TextFilter | NumberFilter | DateFilter | SetFilter;
type FilterModel = Record<string, FilterInstance>;

interface DvGridLocale {
    loading: string;
    noData: string;
    filterButtonTitle: string;
    filterMenuTitle: string;
    operator: string;
    value: string;
    to: string;
    filterValuePlaceholder: string;
    toValuePlaceholder: string;
    noValuesAvailable: string;
    clearFilter: string;
    applyFilter: string;
    textContains: string;
    textEquals: string;
    textStartsWith: string;
    textEndsWith: string;
    numberEquals: string;
    numberGreaterThan: string;
    numberLessThan: string;
    numberBetween: string;
    dateEquals: string;
    dateBefore: string;
    dateAfter: string;
    dateBetween: string;
    noRecords: string;
    rowsPerPage: string;
    of: string;
    firstPage: string;
    previousPage: string;
    nextPage: string;
    lastPage: string;
}
declare const EN_LOCALE: DvGridLocale;
declare const UK_LOCALE: DvGridLocale;

type SortDirection = 'asc' | 'desc';
interface SortItem {
    colId: string;
    sort: SortDirection;
}
type FilterType = 'text' | 'number' | 'date' | 'set';
interface DvColDef<T = any> {
    field: string;
    headerName?: string;
    sortable?: boolean;
    filter?: boolean | FilterType;
    filterValues?: any[];
    width?: number;
    minWidth?: number;
    resizable?: boolean;
    valueFormatter?: (param: any) => any;
    cellClass?: string | ((params: CellClassParams<T>) => string);
    cellRenderer?: Type<any> | TemplateRef<any>;
    cellRendererParams?: Record<string, any>;
    tooltipField?: string;
    tooltipValueGetter?: (params: CellClassParams<T>) => string;
}
interface CellClassParams<T = any> {
    value: any;
    row: T;
    field: string;
    rowIndex: number;
}
interface ServerRequestParams {
    page: number;
    pageSize: number;
    sortModel: SortItem[];
    filterModel: FilterModel;
}
interface DvGridOptions {
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
    rowExpansion?: {
        enabled: boolean;
    };
}
interface DvGridApi {
    setServerData(rows: any[], totalRecords: number): void;
    refreshServerData(): void;
    readonly sortModel: Signal<SortItem[]>;
    readonly filterModel: Signal<FilterModel>;
    readonly currentPage: Signal<number>;
    readonly pageSize: Signal<number>;
    readonly totalRecords: Signal<number>;
    readonly totalPages: Signal<number>;
    readonly rowData: Signal<any[]>;
    readonly isLoading: Signal<boolean>;
    readonly selectedRowIds: Signal<Set<any>>;
    selectRow(id: any): void;
    deselectRow(id: any): void;
    toggleRowSelection(id: any): void;
    selectAll(ids: any[]): void;
    deselectAll(): void;
    clearSelection(): void;
    isRowSelected(id: any): boolean;
    setPage(page: number): void;
    setPageSize(pageSize: number): void;
    setColumnFilter(field: string, filter: FilterInstance): void;
    clearColumnFilter(field: string): void;
    resetFilters(): void;
    resetSort(): void;
    resetAll(): void;
}

declare class DvDataGrid<T extends object = object> implements OnInit, OnDestroy {
    readonly columnDefs: _angular_core.InputSignal<DvColDef<T>[]>;
    readonly options: _angular_core.InputSignal<DvGridOptions>;
    readonly detailTemplate: _angular_core.InputSignal<TemplateRef<{
        $implicit: T;
        rowIndex: number;
    }> | null>;
    readonly serverDataRequested: _angular_core.OutputEmitterRef<dv_datagrid.ServerRequestParams>;
    readonly gridReady: _angular_core.OutputEmitterRef<DvGridApi>;
    readonly selectionChanged: _angular_core.OutputEmitterRef<any[]>;
    private readonly gridApi;
    readonly rowData: Signal<T[]>;
    readonly isLoading: Signal<boolean>;
    readonly sortModel: Signal<dv_datagrid.SortItem[]>;
    readonly filterModel: Signal<dv_datagrid.FilterModel>;
    readonly currentPage: Signal<number>;
    readonly pageSize: Signal<number>;
    readonly totalRecords: Signal<number>;
    readonly totalPages: Signal<number>;
    readonly selectedRowIds: Signal<Set<any>>;
    readonly openFilterField: _angular_core.WritableSignal<string | null>;
    readonly filterMenuPos: _angular_core.WritableSignal<{
        top: number;
        left: number;
    }>;
    readonly expandedRowIds: _angular_core.WritableSignal<Set<any>>;
    readonly tooltipText: _angular_core.WritableSignal<string | null>;
    readonly tooltipPos: _angular_core.WritableSignal<{
        top: number;
        left: number;
    }>;
    private tooltipTimer;
    readonly themeClass: Signal<string>;
    readonly paginationEnabled: Signal<boolean>;
    readonly pageSizeOptions: Signal<number[]>;
    readonly selectionEnabled: Signal<boolean>;
    readonly selectionMode: Signal<"single" | "multi" | null>;
    readonly rowExpansionEnabled: Signal<boolean>;
    readonly totalColspan: Signal<number>;
    readonly locale: Signal<DvGridLocale>;
    readonly headerCheckboxState: Signal<"some" | "all" | "none">;
    constructor();
    ngOnInit(): void;
    loadServerData(): void;
    onHeaderClick(col: DvColDef): void;
    getSortDirection(field: string): 'asc' | 'desc' | null;
    getFilterType(col: DvColDef): FilterType | null;
    isFilterable(col: DvColDef): boolean;
    hasActiveFilter(field: string): boolean;
    getColumnFilter(field: string): FilterInstance | null;
    toggleFilterMenu(event: MouseEvent, field: string): void;
    onFilterApplied(field: string, filter: FilterInstance): void;
    onFilterCleared(field: string): void;
    onFilterMenuClosed(): void;
    onDocumentClick(): void;
    onPageChanged(page: number): void;
    onPageSizeChanged(size: number): void;
    getRowId(row: T, index: number): any;
    isRowSelected(row: T, index: number): boolean;
    onHeaderCheckboxChange(): void;
    onRowCheckboxChange(event: Event, row: T, index: number): void;
    onRowClick(event: MouseEvent, row: T, index: number): void;
    private emitSelectionChanged;
    getValue(row: T, field: string): any;
    isTemplateRef(value: any): value is TemplateRef<any>;
    getCellRendererInputs(col: DvColDef<T>, row: T): Record<string, any>;
    isRowExpanded(row: T, index: number): boolean;
    onExpandToggle(event: MouseEvent, row: T, index: number): void;
    getTooltipText(col: DvColDef<T>, row: T, index: number): string | null;
    onCellMouseEnter(event: MouseEvent, col: DvColDef<T>, row: T, index: number): void;
    onCellMouseLeave(): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DvDataGrid<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DvDataGrid<any>, "dv-datagrid", never, { "columnDefs": { "alias": "columnDefs"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "detailTemplate": { "alias": "detailTemplate"; "required": false; "isSignal": true; }; }, { "serverDataRequested": "serverDataRequested"; "gridReady": "gridReady"; "selectionChanged": "selectionChanged"; }, never, never, true, never>;
}

declare class DvDataGridPagination {
    readonly currentPage: _angular_core.InputSignal<number>;
    readonly pageSize: _angular_core.InputSignal<number>;
    readonly totalRecords: _angular_core.InputSignal<number>;
    readonly pageSizeOptions: _angular_core.InputSignal<number[]>;
    readonly locale: _angular_core.InputSignal<DvGridLocale>;
    readonly pageChanged: _angular_core.OutputEmitterRef<number>;
    readonly pageSizeChanged: _angular_core.OutputEmitterRef<number>;
    readonly totalPages: _angular_core.Signal<number>;
    readonly rangeStart: _angular_core.Signal<number>;
    readonly rangeEnd: _angular_core.Signal<number>;
    readonly visiblePages: _angular_core.Signal<(number | "...")[]>;
    goToPage(page: number | '...'): void;
    goFirst(): void;
    goPrev(): void;
    goNext(): void;
    goLast(): void;
    onPageSizeChange(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DvDataGridPagination, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DvDataGridPagination, "dv-datagrid-pagination", never, { "currentPage": { "alias": "currentPage"; "required": true; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": true; "isSignal": true; }; "totalRecords": { "alias": "totalRecords"; "required": true; "isSignal": true; }; "pageSizeOptions": { "alias": "pageSizeOptions"; "required": false; "isSignal": true; }; "locale": { "alias": "locale"; "required": false; "isSignal": true; }; }, { "pageChanged": "pageChanged"; "pageSizeChanged": "pageSizeChanged"; }, never, never, true, never>;
}

declare class DvDataGridFilterMenu implements OnInit {
    readonly filterType: _angular_core.InputSignal<FilterType>;
    readonly field: _angular_core.InputSignal<string>;
    readonly currentFilter: _angular_core.InputSignal<FilterInstance | null>;
    readonly setFilterValues: _angular_core.InputSignal<any[]>;
    readonly positionTop: _angular_core.InputSignal<number>;
    readonly positionLeft: _angular_core.InputSignal<number>;
    readonly locale: _angular_core.InputSignal<DvGridLocale>;
    readonly filterApplied: _angular_core.OutputEmitterRef<FilterInstance>;
    readonly filterCleared: _angular_core.OutputEmitterRef<void>;
    readonly closed: _angular_core.OutputEmitterRef<void>;
    readonly textOperator: _angular_core.WritableSignal<TextFilterOperator>;
    readonly textValue: _angular_core.WritableSignal<string>;
    readonly numberOperator: _angular_core.WritableSignal<NumberFilterOperator>;
    readonly numberValue: _angular_core.WritableSignal<string>;
    readonly numberValueTo: _angular_core.WritableSignal<string>;
    readonly dateOperator: _angular_core.WritableSignal<DateFilterOperator>;
    readonly dateValue: _angular_core.WritableSignal<string>;
    readonly dateValueTo: _angular_core.WritableSignal<string>;
    readonly selectedSetValues: _angular_core.WritableSignal<Set<any>>;
    readonly showNumberTo: _angular_core.Signal<boolean>;
    readonly showDateTo: _angular_core.Signal<boolean>;
    readonly canApply: _angular_core.Signal<boolean>;
    readonly textOperators: _angular_core.Signal<{
        value: TextFilterOperator;
        label: string;
    }[]>;
    readonly numberOperators: _angular_core.Signal<{
        value: NumberFilterOperator;
        label: string;
    }[]>;
    readonly dateOperators: _angular_core.Signal<{
        value: DateFilterOperator;
        label: string;
    }[]>;
    ngOnInit(): void;
    onTextOperatorChange(event: Event): void;
    onTextValueInput(event: Event): void;
    onNumberOperatorChange(event: Event): void;
    onNumberValueInput(event: Event): void;
    onNumberValueToInput(event: Event): void;
    onDateOperatorChange(event: Event): void;
    onDateValueInput(event: Event): void;
    onDateValueToInput(event: Event): void;
    toggleSetValue(value: any): void;
    isSetValueSelected(value: any): boolean;
    apply(): void;
    clear(): void;
    onEscapeKey(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DvDataGridFilterMenu, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DvDataGridFilterMenu, "dv-datagrid-filter-menu", never, { "filterType": { "alias": "filterType"; "required": true; "isSignal": true; }; "field": { "alias": "field"; "required": true; "isSignal": true; }; "currentFilter": { "alias": "currentFilter"; "required": false; "isSignal": true; }; "setFilterValues": { "alias": "setFilterValues"; "required": false; "isSignal": true; }; "positionTop": { "alias": "positionTop"; "required": false; "isSignal": true; }; "positionLeft": { "alias": "positionLeft"; "required": false; "isSignal": true; }; "locale": { "alias": "locale"; "required": false; "isSignal": true; }; }, { "filterApplied": "filterApplied"; "filterCleared": "filterCleared"; "closed": "closed"; }, never, never, true, never>;
}

export { DvDataGrid, DvDataGridFilterMenu, DvDataGridPagination, EN_LOCALE, UK_LOCALE };
export type { CellClassParams, DateFilter, DateFilterOperator, DvColDef, DvGridApi, DvGridLocale, DvGridOptions, FilterInstance, FilterModel, FilterType, NumberFilter, NumberFilterOperator, ServerRequestParams, SetFilter, SortDirection, SortItem, TextFilter, TextFilterOperator };
