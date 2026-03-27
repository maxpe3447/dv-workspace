import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { DvGridApi, ServerRequestParams, SortItem } from '../models/grid.model';
import { FilterInstance, FilterModel } from '../models/filter.model';

export class DvGridApiImpl implements DvGridApi {
  private _gridComponent: any = null;
  private _selectionMode: 'single' | 'multi' | null = null;

  // Writable state
  private readonly _sortModel: WritableSignal<SortItem[]> = signal([]);
  private readonly _filterModel: WritableSignal<FilterModel> = signal({});
  private readonly _currentPage: WritableSignal<number> = signal(1);
  private readonly _pageSize: WritableSignal<number> = signal(20);
  private readonly _totalRecords: WritableSignal<number> = signal(0);
  private readonly _rowData: WritableSignal<any[]> = signal([]);
  private readonly _isLoading: WritableSignal<boolean> = signal(false);
  private readonly _selectedRowIds: WritableSignal<Set<any>> = signal(new Set());

  // Public readonly signals
  readonly sortModel: Signal<SortItem[]> = this._sortModel.asReadonly();
  readonly filterModel: Signal<FilterModel> = this._filterModel.asReadonly();
  readonly currentPage: Signal<number> = this._currentPage.asReadonly();
  readonly pageSize: Signal<number> = this._pageSize.asReadonly();
  readonly totalRecords: Signal<number> = this._totalRecords.asReadonly();
  readonly rowData: Signal<any[]> = this._rowData.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  readonly selectedRowIds: Signal<Set<any>> = this._selectedRowIds.asReadonly();

  readonly totalPages: Signal<number> = computed(() => {
    const size = this._pageSize();
    if (size <= 0) return 0;
    return Math.ceil(this._totalRecords() / size);
  });

  registerGridComponent(gridComponent: any): void {
    this._gridComponent = gridComponent;
  }

  // ======================== Data ========================

  setServerData(rows: any[], totalRecords: number): void {
    this._rowData.set(rows);
    this._totalRecords.set(totalRecords);
    this._isLoading.set(false);
  }

  refreshServerData(): void {
    this._gridComponent?.loadServerData();
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  // ======================== Pagination ========================

  setInitialPageSize(pageSize: number): void {
    if (pageSize > 0) this._pageSize.set(pageSize);
  }

  setPage(page: number): void {
    if (page < 1) return;
    this._currentPage.set(page);
    this.refreshServerData();
  }

  setPageSize(pageSize: number): void {
    if (pageSize < 1) return;
    this._pageSize.set(pageSize);
    this._currentPage.set(1);
    this.refreshServerData();
  }

  // ======================== Sort ========================

  updateSortModel(sortModel: SortItem[]): void {
    this._sortModel.set([...sortModel]);
  }

  toggleSort(colId: string): void {
    const current = this._sortModel();
    const existing = current.find((s) => s.colId === colId);

    let next: SortItem[];
    if (!existing) {
      next = [{ colId, sort: 'asc' }];
    } else if (existing.sort === 'asc') {
      next = [{ colId, sort: 'desc' }];
    } else {
      next = [];
    }

    this._sortModel.set(next);
    this._currentPage.set(1);
    this.refreshServerData();
  }

  resetSort(): void {
    this._sortModel.set([]);
    this.refreshServerData();
  }

  // ======================== Filter ========================

  setColumnFilter(field: string, filter: FilterInstance): void {
    this._filterModel.update((current) => ({ ...current, [field]: filter }));
    this._currentPage.set(1);
    this.refreshServerData();
  }

  clearColumnFilter(field: string): void {
    this._filterModel.update((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    this._currentPage.set(1);
    this.refreshServerData();
  }

  updateFilterModel(filterModel: FilterModel): void {
    this._filterModel.set({ ...filterModel });
  }

  resetFilters(): void {
    this._filterModel.set({});
    this._currentPage.set(1);
    this.refreshServerData();
  }

  // ======================== Selection ========================

  setSelectionMode(mode: 'single' | 'multi' | null): void {
    this._selectionMode = mode;
  }

  selectRow(id: any): void {
    if (this._selectionMode === 'single') {
      this._selectedRowIds.set(new Set([id]));
    } else {
      this._selectedRowIds.update((s) => { const next = new Set(s); next.add(id); return next; });
    }
  }

  deselectRow(id: any): void {
    this._selectedRowIds.update((s) => { const next = new Set(s); next.delete(id); return next; });
  }

  toggleRowSelection(id: any): void {
    if (this._selectedRowIds().has(id)) {
      this.deselectRow(id);
    } else {
      this.selectRow(id);
    }
  }

  selectAll(ids: any[]): void {
    this._selectedRowIds.update((s) => {
      const next = new Set(s);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  deselectAll(): void {
    this._selectedRowIds.set(new Set());
  }

  clearSelection(): void {
    this._selectedRowIds.set(new Set());
  }

  isRowSelected(id: any): boolean {
    return this._selectedRowIds().has(id);
  }

  // ======================== Reset ========================

  resetAll(): void {
    this._sortModel.set([]);
    this._filterModel.set({});
    this._currentPage.set(1);
    this.refreshServerData();
  }

  // ======================== Build request params ========================

  buildRequestParams(): ServerRequestParams {
    return {
      page: this._currentPage(),
      pageSize: this._pageSize(),
      sortModel: this._sortModel(),
      filterModel: this._filterModel(),
    };
  }
}
