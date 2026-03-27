import {
  Component,
  input,
  output,
  computed,
  signal,
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

@Component({
  selector: 'dv-datagrid',
  imports: [DvDataGridPagination, DvDataGridFilterMenu, NgTemplateOutlet, NgComponentOutlet],
  templateUrl: './dv-datagrid.html',
  styleUrl: './dv-datagrid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvDataGrid<T extends object = object> implements OnInit, OnDestroy {
  // Inputs
  readonly columnDefs = input<DvColDef<T>[]>([]);
  readonly options = input<DvGridOptions>({});
  readonly detailTemplate = input<TemplateRef<{ $implicit: T; rowIndex: number }> | null>(null);

  // Outputs
  readonly serverDataRequested = output<ReturnType<DvGridApiImpl['buildRequestParams']>>();
  readonly gridReady = output<DvGridApi>();
  readonly selectionChanged = output<any[]>();

  // Internal API
  private readonly gridApi = new DvGridApiImpl();

  // Expose signals from API for template binding
  readonly rowData: Signal<T[]> = this.gridApi.rowData as Signal<T[]>;
  readonly isLoading = this.gridApi.isLoading;
  readonly sortModel = this.gridApi.sortModel;
  readonly filterModel = this.gridApi.filterModel;
  readonly currentPage = this.gridApi.currentPage;
  readonly pageSize = this.gridApi.pageSize;
  readonly totalRecords = this.gridApi.totalRecords;
  readonly totalPages = this.gridApi.totalPages;
  readonly selectedRowIds = this.gridApi.selectedRowIds;

  // Filter menu state
  readonly openFilterField = signal<string | null>(null);
  readonly filterMenuPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  // Row expansion state
  readonly expandedRowIds = signal<Set<any>>(new Set<any>());

  // Tooltip state
  readonly tooltipText = signal<string | null>(null);
  readonly tooltipPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Column resize state
  private resizingField: string | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private resizeDelta = 0;
  private wasResized = false;
  readonly isResizing = signal(false);
  readonly columnWidths = signal<Map<string, number>>(new Map());

  // Computed
  readonly themeClass = computed(() => {
    const theme = this.options().theme;
    return theme && theme !== 'custom' ? `my-data-grid-theme-${theme}` : '';
  });

  readonly paginationEnabled = computed(() => this.options().pagination !== false);

  readonly pageSizeOptions = computed(
    () => this.options().paginationPageSizeOptions ?? [10, 20, 50, 100]
  );

  readonly selectionEnabled = computed(() => !!this.options().rowSelection);

  readonly selectionMode = computed(() => this.options().rowSelection ?? null);

  readonly rowExpansionEnabled = computed(() => !!this.options().rowExpansion?.enabled);

  readonly columnResizeEnabled = computed(() => this.options().enableColumnResize === true);

  readonly totalColspan = computed(
    () =>
      this.columnDefs().length +
      (this.selectionMode() === 'multi' ? 1 : 0) +
      (this.rowExpansionEnabled() ? 1 : 0)
  );

  readonly locale = computed<DvGridLocale>(() => ({ ...EN_LOCALE, ...this.options().locale }));

  readonly headerCheckboxState = computed<'all' | 'some' | 'none'>(() => {
    if (!this.selectionEnabled()) return 'none';
    const rows = this.rowData();
    if (rows.length === 0) return 'none';
    const selected = this.selectedRowIds();
    const visibleIds = rows.map((row, i) => this.getRowId(row, i));
    const selectedCount = visibleIds.filter((id) => selected.has(id)).length;
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

  loadServerData(): void {
    this.gridApi.setLoading(true);
    this.serverDataRequested.emit(this.gridApi.buildRequestParams());
  }

  // ======================== Column resize ========================

  getColumnWidth(col: DvColDef): number | null {
    return this.columnWidths().get(col.field) ?? col.width ?? null;
  }

  onResizeStart(event: MouseEvent, col: DvColDef): void {
    event.preventDefault();
    event.stopPropagation();
    const th = (event.currentTarget as HTMLElement).closest('th') as HTMLElement;
    this.resizingField = col.field;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = th.offsetWidth;
    this.resizeDelta = 0;
    this.wasResized = false;
    this.isResizing.set(true);
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.resizingField) return;
    this.resizeDelta = event.clientX - this.resizeStartX;
    const col = this.columnDefs().find(c => c.field === this.resizingField);
    const minW = col?.minWidth ?? 50;
    const newWidth = Math.max(minW, this.resizeStartWidth + this.resizeDelta);
    this.columnWidths.update(map => new Map(map).set(this.resizingField!, newWidth));
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (this.resizingField) {
      this.wasResized = Math.abs(this.resizeDelta) > 3;
      this.resizingField = null;
      this.isResizing.set(false);
    }
  }

  // ======================== Sort ========================

  onHeaderClick(col: DvColDef): void {
    if (this.wasResized) { this.wasResized = false; return; }
    if (col.sortable === false) return;
    this.gridApi.toggleSort(col.field);
  }

  getSortDirection(field: string): 'asc' | 'desc' | null {
    const item = this.sortModel().find((s) => s.colId === field);
    return item?.sort ?? null;
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
    event.stopPropagation();
    if (this.openFilterField() === field) {
      this.openFilterField.set(null);
      return;
    }
    // Position the dropdown below the trigger button
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 240;
    // Prefer left-aligned, but flip to right-aligned if it would overflow viewport
    let left = rect.left;
    if (left + menuWidth > window.innerWidth) {
      left = rect.right - menuWidth;
    }
    this.filterMenuPos.set({ top: rect.bottom + 4, left });
    this.openFilterField.set(field);
  }

  onFilterApplied(field: string, filter: FilterInstance): void {
    this.gridApi.setColumnFilter(field, filter);
    this.openFilterField.set(null);
  }

  onFilterCleared(field: string): void {
    this.gridApi.clearColumnFilter(field);
    this.openFilterField.set(null);
  }

  onFilterMenuClosed(): void {
    this.openFilterField.set(null);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openFilterField() !== null) {
      this.openFilterField.set(null);
    }
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
    const rows = this.rowData();
    const visibleIds = rows.map((row, i) => this.getRowId(row, i));
    if (this.headerCheckboxState() === 'all') {
      visibleIds.forEach((id) => this.gridApi.deselectRow(id));
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
    const id = this.getRowId(row, index);
    if (this.selectionMode() === 'single') {
      if (this.gridApi.isRowSelected(id)) {
        this.gridApi.deselectRow(id);
      } else {
        this.gridApi.selectRow(id);
      }
      this.emitSelectionChanged();
    } else if (this.selectionMode() === 'multi') {
      this.gridApi.toggleRowSelection(id);
      this.emitSelectionChanged();
    }
  }

  private emitSelectionChanged(): void {
    this.selectionChanged.emit(Array.from(this.selectedRowIds()));
  }

  // ======================== Value accessor ========================

  getValue(row: T, field: string): any {
    return field.split('.').reduce((obj: any, key) => obj?.[key], row);
  }

  // ======================== Cell renderer ========================

  isTemplateRef(value: any): value is TemplateRef<any> {
    return value instanceof TemplateRef;
  }

  getCellRendererInputs(col: DvColDef<T>, row: T): Record<string, any> {
    return {
      value: this.getValue(row, col.field),
      row,
      ...col.cellRendererParams,
    };
  }

  // ======================== Row expansion ========================

  isRowExpanded(row: T, index: number): boolean {
    return this.expandedRowIds().has(this.getRowId(row, index));
  }

  onExpandToggle(event: MouseEvent, row: T, index: number): void {
    event.stopPropagation();
    const id = this.getRowId(row, index);
    this.expandedRowIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ======================== Tooltip ========================

  getTooltipText(col: DvColDef<T>, row: T, index: number): string | null {
    if (col.tooltipValueGetter) {
      return col.tooltipValueGetter({
        value: this.getValue(row, col.field),
        row,
        field: col.field,
        rowIndex: index,
      });
    }
    if (col.tooltipField) {
      const val = this.getValue(row, col.tooltipField);
      return val != null ? String(val) : null;
    }
    return null;
  }

  onCellMouseEnter(event: MouseEvent, col: DvColDef<T>, row: T, index: number): void {
    const text = this.getTooltipText(col, row, index);
    if (!text) return;
    const delay = this.options().tooltipShowDelay ?? 500;
    const el = event.currentTarget as HTMLElement;
    this.tooltipTimer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const tooltipWidth = 280;
      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth) {
        left = rect.right - tooltipWidth;
      }
      this.tooltipPos.set({ top: rect.bottom + 6, left });
      this.tooltipText.set(text);
    }, delay);
  }

  onCellMouseLeave(): void {
    if (this.tooltipTimer !== null) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    this.tooltipText.set(null);
  }

  ngOnDestroy(): void {
    if (this.tooltipTimer !== null) {
      clearTimeout(this.tooltipTimer);
    }
  }
}
