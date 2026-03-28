import {
  Component,
  input,
  output,
  computed,
  Signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  HostListener,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet, NgComponentOutlet } from '@angular/common';
import { DvColDef, FilterType, DvGridApi, DvGridOptions } from '../../models/grid.model';
import { FilterInstance } from '../../models/filter.model';
import { EN_LOCALE, DvGridLocale } from '../../models/locale.model';
import { DvGridApiImpl } from '../../services/grid-api-impl';
import { DvDataGridPagination } from '../dv-pagination/dv-pagination';
import { DvDataGridFilterMenu } from '../dv-filter-menu/dv-filter-menu';
import { GridColumnResizeHandler } from './handlers/column-resize.handler';
import { GridTooltipHandler } from './handlers/tooltip.handler';
import { GridFilterMenuHandler } from './handlers/filter-menu.handler';
import { GridRowExpansionHandler } from './handlers/row-expansion.handler';
import { GridExportHandler } from './handlers/export.handler';

@Component({
  selector: 'dv-datagrid',
  imports: [DvDataGridPagination, DvDataGridFilterMenu, NgTemplateOutlet, NgComponentOutlet],
  templateUrl: './dv-datagrid.html',
  styleUrl: './dv-datagrid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvDataGrid<T extends object = object> implements OnInit, OnDestroy {
  // ── Inputs / Outputs
  readonly columnDefs = input<DvColDef<T>[]>([]);
  readonly options = input<DvGridOptions>({});
  readonly detailTemplate = input<TemplateRef<{ $implicit: T; rowIndex: number }> | null>(null);

  readonly serverDataRequested = output<ReturnType<DvGridApiImpl['buildRequestParams']>>();
  readonly gridReady = output<DvGridApi>();
  readonly selectionChanged = output<any[]>();

  // ── Internal API
  private readonly gridApi = new DvGridApiImpl();

  // ── Handlers
  private readonly resize = new GridColumnResizeHandler();
  private readonly tooltip = new GridTooltipHandler();
  private readonly filterMenu = new GridFilterMenuHandler();
  private readonly expansion = new GridRowExpansionHandler();
  private readonly exporter = new GridExportHandler();

  // ── Signals delegated from handlers (template binding)
  readonly isResizing = this.resize.isResizing;
  readonly columnWidths = this.resize.columnWidths;
  readonly openFilterField = this.filterMenu.openField;
  readonly filterMenuPos = this.filterMenu.menuPos;
  readonly expandedRowIds = this.expansion.expandedRowIds;
  readonly tooltipText = this.tooltip.tooltipText;
  readonly tooltipPos = this.tooltip.tooltipPos;

  // ── Signals delegated from API (template binding)
  readonly rowData: Signal<T[]> = this.gridApi.rowData as Signal<T[]>;
  readonly isLoading = this.gridApi.isLoading;
  readonly sortModel = this.gridApi.sortModel;
  readonly filterModel = this.gridApi.filterModel;
  readonly currentPage = this.gridApi.currentPage;
  readonly pageSize = this.gridApi.pageSize;
  readonly totalRecords = this.gridApi.totalRecords;
  readonly totalPages = this.gridApi.totalPages;
  readonly selectedRowIds = this.gridApi.selectedRowIds;

  // ── Computed
  readonly themeClass = computed(() => {
    const theme = this.options().theme;
    return theme && theme !== 'custom' ? `my-data-grid-theme-${theme}` : '';
  });

  readonly paginationEnabled = computed(() => this.options().pagination !== false);
  readonly pageSizeOptions = computed(() => this.options().paginationPageSizeOptions ?? [10, 20, 50, 100]);
  readonly selectionEnabled = computed(() => !!this.options().rowSelection);
  readonly selectionMode = computed(() => this.options().rowSelection ?? null);
  readonly rowExpansionEnabled = computed(() => !!this.options().rowExpansion?.enabled);
  readonly columnResizeEnabled = computed(() => this.options().enableColumnResize === true);
  readonly locale = computed<DvGridLocale>(() => ({ ...EN_LOCALE, ...this.options().locale }));

  readonly totalColspan = computed(() =>
    this.columnDefs().length +
    (this.selectionMode() === 'multi' ? 1 : 0) +
    (this.rowExpansionEnabled() ? 1 : 0)
  );

  readonly headerCheckboxState = computed<'all' | 'some' | 'none'>(() => {
    if (!this.selectionEnabled()) return 'none';
    const rows = this.rowData();
    if (rows.length === 0) return 'none';
    const selected = this.selectedRowIds();
    const visibleIds = rows.map((row, i) => this.getRowId(row, i));
    const selectedCount = visibleIds.filter(id => selected.has(id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === visibleIds.length) return 'all';
    return 'some';
  });

  constructor() {
    this.gridApi.registerGridComponent(this);
  }

  ngOnInit(): void {
    const opts = this.options();
    if (opts.paginationPageSize && opts.paginationPageSize > 0) {
      this.gridApi.setInitialPageSize(opts.paginationPageSize);
    }
    this.gridApi.setSelectionMode(opts.rowSelection ?? null);
    this.gridReady.emit(this.gridApi);
    this.loadServerData();
  }

  ngOnDestroy(): void {
    this.tooltip.destroy();
  }

  // ======================== Data ========================

  loadServerData(): void {
    this.gridApi.setLoading(true);
    this.serverDataRequested.emit(this.gridApi.buildRequestParams());
  }

  exportToExcel(): void {
    this.exporter.exportToExcel(this.columnDefs(), this.rowData(), this.getValue.bind(this), this.options().exportFileName);
  }

  // ======================== Column resize ========================

  getColumnWidth(col: DvColDef): number | null {
    return this.resize.getColumnWidth(col);
  }

  onResizeStart(event: MouseEvent, col: DvColDef): void {
    this.resize.onResizeStart(event, col);
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    this.resize.onMouseMove(event);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    this.resize.onMouseUp();
  }

  onResizeFit(event: MouseEvent, col: DvColDef): void {
    this.resize.onResizeFit(event, col);
  }

  // ======================== Sort ========================

  onHeaderClick(col: DvColDef): void {
    if (this.resize.wasResized) { this.resize.clearWasResized(); return; }
    if (col.sortable === false) return;
    this.gridApi.toggleSort(col.field);
  }

  getSortDirection(field: string): 'asc' | 'desc' | null {
    return this.sortModel().find(s => s.colId === field)?.sort ?? null;
  }

  // ======================== Filter ========================

  getFilterType(col: DvColDef): FilterType | null {
    if (col.filter === true) return 'text';
    if (col.filter === false || col.filter == null) return null;
    return col.filter;
  }

  isFilterable(col: DvColDef): boolean {
    return this.getFilterType(col) !== null;
  }

  hasActiveFilter(field: string): boolean {
    return field in this.filterModel();
  }

  getColumnFilter(field: string): FilterInstance | null {
    return this.filterModel()[field] ?? null;
  }

  toggleFilterMenu(event: MouseEvent, field: string): void {
    this.filterMenu.toggle(event, field);
  }

  onFilterApplied(field: string, filter: FilterInstance): void {
    this.gridApi.setColumnFilter(field, filter);
    this.filterMenu.close();
  }

  onFilterCleared(field: string): void {
    this.gridApi.clearColumnFilter(field);
    this.filterMenu.close();
  }

  onFilterMenuClosed(): void {
    this.filterMenu.close();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.filterMenu.close();
  }

  // ======================== Pagination ========================

  onPageChanged(page: number): void {
    this.gridApi.setPage(page);
  }

  onPageSizeChanged(size: number): void {
    this.gridApi.setPageSize(size);
  }

  // ======================== Selection ========================

  getRowId(row: T, index: number): any {
    return this.options().getRowId?.(row) ?? (row as any)['id'] ?? index;
  }

  isRowSelected(row: T, index: number): boolean {
    return this.selectedRowIds().has(this.getRowId(row, index));
  }

  onHeaderCheckboxChange(): void {
    const visibleIds = this.rowData().map((row, i) => this.getRowId(row, i));
    if (this.headerCheckboxState() === 'all') {
      visibleIds.forEach(id => this.gridApi.deselectRow(id));
    } else {
      this.gridApi.selectAll(visibleIds);
    }
    this.emitSelectionChanged();
  }

  onRowCheckboxChange(event: Event, row: T, index: number): void {
    event.stopPropagation();
    this.gridApi.toggleRowSelection(this.getRowId(row, index));
    this.emitSelectionChanged();
  }

  onRowClick(event: MouseEvent, row: T, index: number): void {
    if (!this.selectionEnabled()) return;
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    if ((window.getSelection()?.toString().length ?? 0) > 0) return;
    const id = this.getRowId(row, index);
    if (this.selectionMode() === 'single') {
      this.gridApi.isRowSelected(id) ? this.gridApi.deselectRow(id) : this.gridApi.selectRow(id);
    } else if (this.selectionMode() === 'multi') {
      this.gridApi.toggleRowSelection(id);
    }
    this.emitSelectionChanged();
  }

  private emitSelectionChanged(): void {
    this.selectionChanged.emit(Array.from(this.selectedRowIds()));
  }

  // ======================== Row expansion ========================

  isRowExpanded(row: T, index: number): boolean {
    return this.expansion.isExpanded(this.getRowId(row, index));
  }

  onExpandToggle(event: MouseEvent, row: T, index: number): void {
    event.stopPropagation();
    this.expansion.toggle(this.getRowId(row, index));
  }

  // ======================== Tooltip ========================

  onCellMouseEnter(event: MouseEvent, col: DvColDef<T>, row: T, index: number): void {
    this.tooltip.onCellMouseEnter(
      event, col, row, index,
      this.options().tooltipShowDelay ?? 500,
      this.getValue.bind(this)
    );
  }

  onCellMouseLeave(): void {
    this.tooltip.onCellMouseLeave();
  }

  // ======================== Value / Cell renderer ========================

  getValue(row: T, field: string): any {
    return field.split('.').reduce((obj: any, key) => obj?.[key], row);
  }

  isTemplateRef(value: any): value is TemplateRef<any> {
    return value instanceof TemplateRef;
  }

  getCellRendererInputs(col: DvColDef<T>, row: T): Record<string, any> {
    return { value: this.getValue(row, col.field), row, ...col.cellRendererParams };
  }
}
