import * as i0 from '@angular/core';
import { signal, computed, input, output, ChangeDetectionStrategy, Component, HostListener, TemplateRef } from '@angular/core';
import { NgTemplateOutlet, NgComponentOutlet } from '@angular/common';

const EN_LOCALE = {
    loading: 'Loading...',
    noData: 'No data',
    filterButtonTitle: 'Filter',
    filterMenuTitle: 'Filter',
    operator: 'Operator',
    value: 'Value',
    to: 'To',
    filterValuePlaceholder: 'Filter value...',
    toValuePlaceholder: 'To value...',
    noValuesAvailable: 'No values available',
    clearFilter: 'Clear',
    applyFilter: 'Apply',
    textContains: 'Contains',
    textEquals: 'Equals',
    textStartsWith: 'Starts with',
    textEndsWith: 'Ends with',
    numberEquals: 'Equals',
    numberGreaterThan: 'Greater than',
    numberLessThan: 'Less than',
    numberBetween: 'Between',
    dateEquals: 'Equals',
    dateBefore: 'Before',
    dateAfter: 'After',
    dateBetween: 'Between',
    noRecords: '0 records',
    rowsPerPage: 'Rows:',
    of: 'of',
    firstPage: 'First page',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    lastPage: 'Last page',
};
const UK_LOCALE = {
    loading: 'Завантаження...',
    noData: 'Немає даних',
    filterButtonTitle: 'Фільтр',
    filterMenuTitle: 'Фільтр',
    operator: 'Оператор',
    value: 'Значення',
    to: 'До',
    filterValuePlaceholder: 'Значення фільтра...',
    toValuePlaceholder: 'Кінцеве значення...',
    noValuesAvailable: 'Немає доступних значень',
    clearFilter: 'Очистити',
    applyFilter: 'Застосувати',
    textContains: 'Містить',
    textEquals: 'Рівно',
    textStartsWith: 'Починається з',
    textEndsWith: 'Закінчується на',
    numberEquals: 'Рівно',
    numberGreaterThan: 'Більше ніж',
    numberLessThan: 'Менше ніж',
    numberBetween: 'Між',
    dateEquals: 'Рівно',
    dateBefore: 'До',
    dateAfter: 'Після',
    dateBetween: 'Між',
    noRecords: '0 записів',
    rowsPerPage: 'Рядків:',
    of: 'з',
    firstPage: 'Перша сторінка',
    previousPage: 'Попередня сторінка',
    nextPage: 'Наступна сторінка',
    lastPage: 'Остання сторінка',
};

class DvGridApiImpl {
    _gridComponent = null;
    _selectionMode = null;
    // Writable state
    _sortModel = signal([], ...(ngDevMode ? [{ debugName: "_sortModel" }] : /* istanbul ignore next */ []));
    _filterModel = signal({}, ...(ngDevMode ? [{ debugName: "_filterModel" }] : /* istanbul ignore next */ []));
    _currentPage = signal(1, ...(ngDevMode ? [{ debugName: "_currentPage" }] : /* istanbul ignore next */ []));
    _pageSize = signal(20, ...(ngDevMode ? [{ debugName: "_pageSize" }] : /* istanbul ignore next */ []));
    _totalRecords = signal(0, ...(ngDevMode ? [{ debugName: "_totalRecords" }] : /* istanbul ignore next */ []));
    _rowData = signal([], ...(ngDevMode ? [{ debugName: "_rowData" }] : /* istanbul ignore next */ []));
    _isLoading = signal(false, ...(ngDevMode ? [{ debugName: "_isLoading" }] : /* istanbul ignore next */ []));
    _selectedRowIds = signal(new Set(), ...(ngDevMode ? [{ debugName: "_selectedRowIds" }] : /* istanbul ignore next */ []));
    // Public readonly signals
    sortModel = this._sortModel.asReadonly();
    filterModel = this._filterModel.asReadonly();
    currentPage = this._currentPage.asReadonly();
    pageSize = this._pageSize.asReadonly();
    totalRecords = this._totalRecords.asReadonly();
    rowData = this._rowData.asReadonly();
    isLoading = this._isLoading.asReadonly();
    selectedRowIds = this._selectedRowIds.asReadonly();
    totalPages = computed(() => {
        const size = this._pageSize();
        if (size <= 0)
            return 0;
        return Math.ceil(this._totalRecords() / size);
    }, ...(ngDevMode ? [{ debugName: "totalPages" }] : /* istanbul ignore next */ []));
    registerGridComponent(gridComponent) {
        this._gridComponent = gridComponent;
    }
    // ======================== Data ========================
    setServerData(rows, totalRecords) {
        this._rowData.set(rows);
        this._totalRecords.set(totalRecords);
        this._isLoading.set(false);
    }
    refreshServerData() {
        this._gridComponent?.loadServerData();
    }
    setLoading(loading) {
        this._isLoading.set(loading);
    }
    // ======================== Pagination ========================
    setInitialPageSize(pageSize) {
        if (pageSize > 0)
            this._pageSize.set(pageSize);
    }
    setPage(page) {
        if (page < 1)
            return;
        this._currentPage.set(page);
        this.refreshServerData();
    }
    setPageSize(pageSize) {
        if (pageSize < 1)
            return;
        this._pageSize.set(pageSize);
        this._currentPage.set(1);
        this.refreshServerData();
    }
    // ======================== Sort ========================
    updateSortModel(sortModel) {
        this._sortModel.set([...sortModel]);
    }
    toggleSort(colId) {
        const current = this._sortModel();
        const existing = current.find((s) => s.colId === colId);
        let next;
        if (!existing) {
            next = [{ colId, sort: 'asc' }];
        }
        else if (existing.sort === 'asc') {
            next = [{ colId, sort: 'desc' }];
        }
        else {
            next = [];
        }
        this._sortModel.set(next);
        this._currentPage.set(1);
        this.refreshServerData();
    }
    resetSort() {
        this._sortModel.set([]);
        this.refreshServerData();
    }
    // ======================== Filter ========================
    setColumnFilter(field, filter) {
        this._filterModel.update((current) => ({ ...current, [field]: filter }));
        this._currentPage.set(1);
        this.refreshServerData();
    }
    clearColumnFilter(field) {
        this._filterModel.update((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
        this._currentPage.set(1);
        this.refreshServerData();
    }
    updateFilterModel(filterModel) {
        this._filterModel.set({ ...filterModel });
    }
    resetFilters() {
        this._filterModel.set({});
        this._currentPage.set(1);
        this.refreshServerData();
    }
    // ======================== Selection ========================
    setSelectionMode(mode) {
        this._selectionMode = mode;
    }
    selectRow(id) {
        if (this._selectionMode === 'single') {
            this._selectedRowIds.set(new Set([id]));
        }
        else {
            this._selectedRowIds.update((s) => { const next = new Set(s); next.add(id); return next; });
        }
    }
    deselectRow(id) {
        this._selectedRowIds.update((s) => { const next = new Set(s); next.delete(id); return next; });
    }
    toggleRowSelection(id) {
        if (this._selectedRowIds().has(id)) {
            this.deselectRow(id);
        }
        else {
            this.selectRow(id);
        }
    }
    selectAll(ids) {
        this._selectedRowIds.update((s) => {
            const next = new Set(s);
            ids.forEach((id) => next.add(id));
            return next;
        });
    }
    deselectAll() {
        this._selectedRowIds.set(new Set());
    }
    clearSelection() {
        this._selectedRowIds.set(new Set());
    }
    isRowSelected(id) {
        return this._selectedRowIds().has(id);
    }
    // ======================== Reset ========================
    resetAll() {
        this._sortModel.set([]);
        this._filterModel.set({});
        this._currentPage.set(1);
        this.refreshServerData();
    }
    // ======================== Build request params ========================
    buildRequestParams() {
        return {
            page: this._currentPage(),
            pageSize: this._pageSize(),
            sortModel: this._sortModel(),
            filterModel: this._filterModel(),
        };
    }
}

class DvDataGridPagination {
    currentPage = input.required(...(ngDevMode ? [{ debugName: "currentPage" }] : /* istanbul ignore next */ []));
    pageSize = input.required(...(ngDevMode ? [{ debugName: "pageSize" }] : /* istanbul ignore next */ []));
    totalRecords = input.required(...(ngDevMode ? [{ debugName: "totalRecords" }] : /* istanbul ignore next */ []));
    pageSizeOptions = input([10, 20, 50, 100], ...(ngDevMode ? [{ debugName: "pageSizeOptions" }] : /* istanbul ignore next */ []));
    locale = input(EN_LOCALE, ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    pageChanged = output();
    pageSizeChanged = output();
    totalPages = computed(() => {
        const size = this.pageSize();
        if (size <= 0)
            return 0;
        return Math.ceil(this.totalRecords() / size);
    }, ...(ngDevMode ? [{ debugName: "totalPages" }] : /* istanbul ignore next */ []));
    rangeStart = computed(() => {
        if (this.totalRecords() === 0)
            return 0;
        return (this.currentPage() - 1) * this.pageSize() + 1;
    }, ...(ngDevMode ? [{ debugName: "rangeStart" }] : /* istanbul ignore next */ []));
    rangeEnd = computed(() => {
        return Math.min(this.currentPage() * this.pageSize(), this.totalRecords());
    }, ...(ngDevMode ? [{ debugName: "rangeEnd" }] : /* istanbul ignore next */ []));
    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++)
                pages.push(i);
            return pages;
        }
        // Always show first page
        pages.push(1);
        if (current > 3) {
            pages.push('...');
        }
        // Pages around current
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        if (current < total - 2) {
            pages.push('...');
        }
        // Always show last page
        pages.push(total);
        return pages;
    }, ...(ngDevMode ? [{ debugName: "visiblePages" }] : /* istanbul ignore next */ []));
    goToPage(page) {
        if (page === '...' || page === this.currentPage())
            return;
        if (page < 1 || page > this.totalPages())
            return;
        this.pageChanged.emit(page);
    }
    goFirst() {
        this.goToPage(1);
    }
    goPrev() {
        this.goToPage(this.currentPage() - 1);
    }
    goNext() {
        this.goToPage(this.currentPage() + 1);
    }
    goLast() {
        this.goToPage(this.totalPages());
    }
    onPageSizeChange(event) {
        const value = +event.target.value;
        this.pageSizeChanged.emit(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.6", ngImport: i0, type: DvDataGridPagination, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.6", type: DvDataGridPagination, isStandalone: true, selector: "dv-datagrid-pagination", inputs: { currentPage: { classPropertyName: "currentPage", publicName: "currentPage", isSignal: true, isRequired: true, transformFunction: null }, pageSize: { classPropertyName: "pageSize", publicName: "pageSize", isSignal: true, isRequired: true, transformFunction: null }, totalRecords: { classPropertyName: "totalRecords", publicName: "totalRecords", isSignal: true, isRequired: true, transformFunction: null }, pageSizeOptions: { classPropertyName: "pageSizeOptions", publicName: "pageSizeOptions", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { pageChanged: "pageChanged", pageSizeChanged: "pageSizeChanged" }, ngImport: i0, template: "<div class=\"grid-pagination\">\r\n  <div class=\"pagination-info\">\r\n    @if (totalRecords() > 0) {\r\n      <span>{{ rangeStart() }}\u2013{{ rangeEnd() }} {{ locale().of }} {{ totalRecords() }}</span>\r\n    } @else {\r\n      <span>{{ locale().noRecords }}</span>\r\n    }\r\n  </div>\r\n\r\n  <div class=\"pagination-controls\">\r\n    <!-- Page size selector -->\r\n    <div class=\"page-size-selector\">\r\n      <label>{{ locale().rowsPerPage }}</label>\r\n      <select [value]=\"pageSize()\" (change)=\"onPageSizeChange($event)\">\r\n        @for (option of pageSizeOptions(); track option) {\r\n          <option [value]=\"option\" [selected]=\"option === pageSize()\">{{ option }}</option>\r\n        }\r\n      </select>\r\n    </div>\r\n\r\n    <!-- Navigation -->\r\n    <div class=\"page-nav\">\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() <= 1\"\r\n        (click)=\"goFirst()\"\r\n        [title]=\"locale().firstPage\"\r\n      >\r\n        &#171;\r\n      </button>\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() <= 1\"\r\n        (click)=\"goPrev()\"\r\n        [title]=\"locale().previousPage\"\r\n      >\r\n        &#8249;\r\n      </button>\r\n\r\n      @for (page of visiblePages(); track $index) {\r\n        @if (page === '...') {\r\n          <span class=\"page-ellipsis\">&#8230;</span>\r\n        } @else {\r\n          <button\r\n            class=\"page-btn page-number\"\r\n            [class.active]=\"page === currentPage()\"\r\n            (click)=\"goToPage(page)\"\r\n          >\r\n            {{ page }}\r\n          </button>\r\n        }\r\n      }\r\n\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() >= totalPages()\"\r\n        (click)=\"goNext()\"\r\n        [title]=\"locale().nextPage\"\r\n      >\r\n        &#8250;\r\n      </button>\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() >= totalPages()\"\r\n        (click)=\"goLast()\"\r\n        [title]=\"locale().lastPage\"\r\n      >\r\n        &#187;\r\n      </button>\r\n    </div>\r\n  </div>\r\n</div>\r\n", styles: [".grid-pagination{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid var(--pagination-border, #dee2e6);background-color:var(--pagination-bg, #ffffff);font-size:13px;color:var(--cell-text, #212529);gap:16px;flex-wrap:wrap}.grid-pagination .pagination-info{white-space:nowrap;color:var(--header-text, #6c757d)}.grid-pagination .pagination-controls{display:flex;align-items:center;gap:16px}.grid-pagination .page-size-selector{display:flex;align-items:center;gap:6px}.grid-pagination .page-size-selector label{color:var(--header-text, #6c757d);font-size:13px}.grid-pagination .page-size-selector select{padding:4px 8px;border:1px solid var(--cell-border, #dee2e6);border-radius:4px;background:var(--cell-bg, #fff);color:var(--cell-text, #212529);font-size:13px;cursor:pointer;outline:none}.grid-pagination .page-size-selector select:focus{border-color:var(--accent-color, #0d6efd)}.grid-pagination .page-nav{display:flex;align-items:center;gap:2px}.grid-pagination .page-btn{min-width:32px;height:32px;padding:0 6px;border:1px solid var(--cell-border, #dee2e6);border-radius:4px;background:var(--cell-bg, #fff);color:var(--cell-text, #212529);font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s ease}.grid-pagination .page-btn:hover:not(:disabled):not(.active){background-color:var(--row-hover, #f1f3f5);border-color:var(--accent-color, #0d6efd)}.grid-pagination .page-btn:disabled{opacity:.4;cursor:not-allowed}.grid-pagination .page-btn.active{background-color:var(--accent-color, #0d6efd);border-color:var(--accent-color, #0d6efd);color:#fff;font-weight:600}.grid-pagination .page-ellipsis{min-width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;color:var(--header-text, #6c757d)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.6", ngImport: i0, type: DvDataGridPagination, decorators: [{
            type: Component,
            args: [{ selector: 'dv-datagrid-pagination', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"grid-pagination\">\r\n  <div class=\"pagination-info\">\r\n    @if (totalRecords() > 0) {\r\n      <span>{{ rangeStart() }}\u2013{{ rangeEnd() }} {{ locale().of }} {{ totalRecords() }}</span>\r\n    } @else {\r\n      <span>{{ locale().noRecords }}</span>\r\n    }\r\n  </div>\r\n\r\n  <div class=\"pagination-controls\">\r\n    <!-- Page size selector -->\r\n    <div class=\"page-size-selector\">\r\n      <label>{{ locale().rowsPerPage }}</label>\r\n      <select [value]=\"pageSize()\" (change)=\"onPageSizeChange($event)\">\r\n        @for (option of pageSizeOptions(); track option) {\r\n          <option [value]=\"option\" [selected]=\"option === pageSize()\">{{ option }}</option>\r\n        }\r\n      </select>\r\n    </div>\r\n\r\n    <!-- Navigation -->\r\n    <div class=\"page-nav\">\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() <= 1\"\r\n        (click)=\"goFirst()\"\r\n        [title]=\"locale().firstPage\"\r\n      >\r\n        &#171;\r\n      </button>\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() <= 1\"\r\n        (click)=\"goPrev()\"\r\n        [title]=\"locale().previousPage\"\r\n      >\r\n        &#8249;\r\n      </button>\r\n\r\n      @for (page of visiblePages(); track $index) {\r\n        @if (page === '...') {\r\n          <span class=\"page-ellipsis\">&#8230;</span>\r\n        } @else {\r\n          <button\r\n            class=\"page-btn page-number\"\r\n            [class.active]=\"page === currentPage()\"\r\n            (click)=\"goToPage(page)\"\r\n          >\r\n            {{ page }}\r\n          </button>\r\n        }\r\n      }\r\n\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() >= totalPages()\"\r\n        (click)=\"goNext()\"\r\n        [title]=\"locale().nextPage\"\r\n      >\r\n        &#8250;\r\n      </button>\r\n      <button\r\n        class=\"page-btn\"\r\n        [disabled]=\"currentPage() >= totalPages()\"\r\n        (click)=\"goLast()\"\r\n        [title]=\"locale().lastPage\"\r\n      >\r\n        &#187;\r\n      </button>\r\n    </div>\r\n  </div>\r\n</div>\r\n", styles: [".grid-pagination{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid var(--pagination-border, #dee2e6);background-color:var(--pagination-bg, #ffffff);font-size:13px;color:var(--cell-text, #212529);gap:16px;flex-wrap:wrap}.grid-pagination .pagination-info{white-space:nowrap;color:var(--header-text, #6c757d)}.grid-pagination .pagination-controls{display:flex;align-items:center;gap:16px}.grid-pagination .page-size-selector{display:flex;align-items:center;gap:6px}.grid-pagination .page-size-selector label{color:var(--header-text, #6c757d);font-size:13px}.grid-pagination .page-size-selector select{padding:4px 8px;border:1px solid var(--cell-border, #dee2e6);border-radius:4px;background:var(--cell-bg, #fff);color:var(--cell-text, #212529);font-size:13px;cursor:pointer;outline:none}.grid-pagination .page-size-selector select:focus{border-color:var(--accent-color, #0d6efd)}.grid-pagination .page-nav{display:flex;align-items:center;gap:2px}.grid-pagination .page-btn{min-width:32px;height:32px;padding:0 6px;border:1px solid var(--cell-border, #dee2e6);border-radius:4px;background:var(--cell-bg, #fff);color:var(--cell-text, #212529);font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s ease}.grid-pagination .page-btn:hover:not(:disabled):not(.active){background-color:var(--row-hover, #f1f3f5);border-color:var(--accent-color, #0d6efd)}.grid-pagination .page-btn:disabled{opacity:.4;cursor:not-allowed}.grid-pagination .page-btn.active{background-color:var(--accent-color, #0d6efd);border-color:var(--accent-color, #0d6efd);color:#fff;font-weight:600}.grid-pagination .page-ellipsis{min-width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;color:var(--header-text, #6c757d)}\n"] }]
        }], propDecorators: { currentPage: [{ type: i0.Input, args: [{ isSignal: true, alias: "currentPage", required: true }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: true }] }], totalRecords: [{ type: i0.Input, args: [{ isSignal: true, alias: "totalRecords", required: true }] }], pageSizeOptions: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSizeOptions", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], pageChanged: [{ type: i0.Output, args: ["pageChanged"] }], pageSizeChanged: [{ type: i0.Output, args: ["pageSizeChanged"] }] } });

class DvDataGridFilterMenu {
    // Inputs
    filterType = input.required(...(ngDevMode ? [{ debugName: "filterType" }] : /* istanbul ignore next */ []));
    field = input.required(...(ngDevMode ? [{ debugName: "field" }] : /* istanbul ignore next */ []));
    currentFilter = input(null, ...(ngDevMode ? [{ debugName: "currentFilter" }] : /* istanbul ignore next */ []));
    setFilterValues = input([], ...(ngDevMode ? [{ debugName: "setFilterValues" }] : /* istanbul ignore next */ []));
    positionTop = input(0, ...(ngDevMode ? [{ debugName: "positionTop" }] : /* istanbul ignore next */ []));
    positionLeft = input(0, ...(ngDevMode ? [{ debugName: "positionLeft" }] : /* istanbul ignore next */ []));
    locale = input(EN_LOCALE, ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    // Outputs
    filterApplied = output();
    filterCleared = output();
    closed = output();
    // Text filter state
    textOperator = signal('ctns', ...(ngDevMode ? [{ debugName: "textOperator" }] : /* istanbul ignore next */ []));
    textValue = signal('', ...(ngDevMode ? [{ debugName: "textValue" }] : /* istanbul ignore next */ []));
    // Number filter state
    numberOperator = signal('eq', ...(ngDevMode ? [{ debugName: "numberOperator" }] : /* istanbul ignore next */ []));
    numberValue = signal('', ...(ngDevMode ? [{ debugName: "numberValue" }] : /* istanbul ignore next */ []));
    numberValueTo = signal('', ...(ngDevMode ? [{ debugName: "numberValueTo" }] : /* istanbul ignore next */ []));
    // Date filter state
    dateOperator = signal('eq', ...(ngDevMode ? [{ debugName: "dateOperator" }] : /* istanbul ignore next */ []));
    dateValue = signal('', ...(ngDevMode ? [{ debugName: "dateValue" }] : /* istanbul ignore next */ []));
    dateValueTo = signal('', ...(ngDevMode ? [{ debugName: "dateValueTo" }] : /* istanbul ignore next */ []));
    // Set filter state
    selectedSetValues = signal(new Set(), ...(ngDevMode ? [{ debugName: "selectedSetValues" }] : /* istanbul ignore next */ []));
    // Computed
    showNumberTo = computed(() => this.numberOperator() === 'btw', ...(ngDevMode ? [{ debugName: "showNumberTo" }] : /* istanbul ignore next */ []));
    showDateTo = computed(() => this.dateOperator() === 'btw', ...(ngDevMode ? [{ debugName: "showDateTo" }] : /* istanbul ignore next */ []));
    canApply = computed(() => {
        switch (this.filterType()) {
            case 'text':
                return this.textValue().trim().length > 0;
            case 'number':
                return (this.numberValue().trim().length > 0 &&
                    (!this.showNumberTo() || this.numberValueTo().trim().length > 0));
            case 'date':
                return this.dateValue().length > 0 && (!this.showDateTo() || this.dateValueTo().length > 0);
            case 'set':
                return this.selectedSetValues().size > 0;
            default:
                return false;
        }
    }, ...(ngDevMode ? [{ debugName: "canApply" }] : /* istanbul ignore next */ []));
    // Operator options (reactive to locale)
    textOperators = computed(() => {
        const l = this.locale();
        return [
            { value: 'ctns', label: l.textContains },
            { value: 'eq', label: l.textEquals },
            { value: 'sw', label: l.textStartsWith },
            { value: 'ew', label: l.textEndsWith },
        ];
    }, ...(ngDevMode ? [{ debugName: "textOperators" }] : /* istanbul ignore next */ []));
    numberOperators = computed(() => {
        const l = this.locale();
        return [
            { value: 'eq', label: l.numberEquals },
            { value: '>', label: l.numberGreaterThan },
            { value: '<', label: l.numberLessThan },
            { value: 'btw', label: l.numberBetween },
        ];
    }, ...(ngDevMode ? [{ debugName: "numberOperators" }] : /* istanbul ignore next */ []));
    dateOperators = computed(() => {
        const l = this.locale();
        return [
            { value: 'eq', label: l.dateEquals },
            { value: 'before', label: l.dateBefore },
            { value: 'after', label: l.dateAfter },
            { value: 'btw', label: l.dateBetween },
        ];
    }, ...(ngDevMode ? [{ debugName: "dateOperators" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        const current = this.currentFilter();
        if (!current)
            return;
        switch (current.type) {
            case 'text':
                this.textOperator.set(current.operator);
                this.textValue.set(current.value);
                break;
            case 'number':
                this.numberOperator.set(current.operator);
                this.numberValue.set(current.value?.toString() ?? '');
                this.numberValueTo.set(current.valueTo?.toString() ?? '');
                break;
            case 'date':
                this.dateOperator.set(current.operator);
                this.dateValue.set(current.value ?? '');
                this.dateValueTo.set(current.valueTo ?? '');
                break;
            case 'set':
                this.selectedSetValues.set(new Set(current.values));
                break;
        }
    }
    // Text handlers
    onTextOperatorChange(event) {
        this.textOperator.set(event.target.value);
    }
    onTextValueInput(event) {
        this.textValue.set(event.target.value);
    }
    // Number handlers
    onNumberOperatorChange(event) {
        this.numberOperator.set(event.target.value);
    }
    onNumberValueInput(event) {
        this.numberValue.set(event.target.value);
    }
    onNumberValueToInput(event) {
        this.numberValueTo.set(event.target.value);
    }
    // Date handlers
    onDateOperatorChange(event) {
        this.dateOperator.set(event.target.value);
    }
    onDateValueInput(event) {
        this.dateValue.set(event.target.value);
    }
    onDateValueToInput(event) {
        this.dateValueTo.set(event.target.value);
    }
    // Set handlers
    toggleSetValue(value) {
        this.selectedSetValues.update((current) => {
            const next = new Set(current);
            if (next.has(value)) {
                next.delete(value);
            }
            else {
                next.add(value);
            }
            return next;
        });
    }
    isSetValueSelected(value) {
        return this.selectedSetValues().has(value);
    }
    // Actions
    apply() {
        if (!this.canApply())
            return;
        let filter;
        switch (this.filterType()) {
            case 'text':
                filter = { type: 'text', operator: this.textOperator(), value: this.textValue().trim() };
                break;
            case 'number':
                filter = {
                    type: 'number',
                    operator: this.numberOperator(),
                    value: parseFloat(this.numberValue()),
                    ...(this.showNumberTo() ? { valueTo: parseFloat(this.numberValueTo()) } : {}),
                };
                break;
            case 'date':
                filter = {
                    type: 'date',
                    operator: this.dateOperator(),
                    value: this.dateValue(),
                    ...(this.showDateTo() ? { valueTo: this.dateValueTo() } : {}),
                };
                break;
            case 'set':
                filter = { type: 'set', values: [...this.selectedSetValues()] };
                break;
            default:
                return;
        }
        this.filterApplied.emit(filter);
    }
    clear() {
        this.filterCleared.emit();
    }
    onEscapeKey() {
        this.closed.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.6", ngImport: i0, type: DvDataGridFilterMenu, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.6", type: DvDataGridFilterMenu, isStandalone: true, selector: "dv-datagrid-filter-menu", inputs: { filterType: { classPropertyName: "filterType", publicName: "filterType", isSignal: true, isRequired: true, transformFunction: null }, field: { classPropertyName: "field", publicName: "field", isSignal: true, isRequired: true, transformFunction: null }, currentFilter: { classPropertyName: "currentFilter", publicName: "currentFilter", isSignal: true, isRequired: false, transformFunction: null }, setFilterValues: { classPropertyName: "setFilterValues", publicName: "setFilterValues", isSignal: true, isRequired: false, transformFunction: null }, positionTop: { classPropertyName: "positionTop", publicName: "positionTop", isSignal: true, isRequired: false, transformFunction: null }, positionLeft: { classPropertyName: "positionLeft", publicName: "positionLeft", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { filterApplied: "filterApplied", filterCleared: "filterCleared", closed: "closed" }, host: { listeners: { "document:keydown.escape": "onEscapeKey()" } }, ngImport: i0, template: "<div\r\n  class=\"filter-menu\"\r\n  [style.top.px]=\"positionTop()\"\r\n  [style.left.px]=\"positionLeft()\"\r\n  (click)=\"$event.stopPropagation()\"\r\n>\r\n  <div class=\"filter-menu-header\">\r\n    <span class=\"filter-menu-title\">{{ locale().filterMenuTitle }}</span>\r\n  </div>\r\n\r\n  <div class=\"filter-menu-body\">\r\n    @switch (filterType()) {\r\n      <!-- TEXT FILTER -->\r\n      @case ('text') {\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().operator }}</label>\r\n          <select [value]=\"textOperator()\" (change)=\"onTextOperatorChange($event)\">\r\n            @for (op of textOperators(); track op.value) {\r\n              <option [value]=\"op.value\" [selected]=\"op.value === textOperator()\">\r\n                {{ op.label }}\r\n              </option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().value }}</label>\r\n          <input\r\n            type=\"text\"\r\n            [value]=\"textValue()\"\r\n            (input)=\"onTextValueInput($event)\"\r\n            [placeholder]=\"locale().filterValuePlaceholder\"\r\n          />\r\n        </div>\r\n      }\r\n\r\n      <!-- NUMBER FILTER -->\r\n      @case ('number') {\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().operator }}</label>\r\n          <select [value]=\"numberOperator()\" (change)=\"onNumberOperatorChange($event)\">\r\n            @for (op of numberOperators(); track op.value) {\r\n              <option [value]=\"op.value\" [selected]=\"op.value === numberOperator()\">\r\n                {{ op.label }}\r\n              </option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().value }}</label>\r\n          <input\r\n            type=\"number\"\r\n            [value]=\"numberValue()\"\r\n            (input)=\"onNumberValueInput($event)\"\r\n            [placeholder]=\"locale().filterValuePlaceholder\"\r\n          />\r\n        </div>\r\n        @if (showNumberTo()) {\r\n          <div class=\"filter-field\">\r\n            <label>{{ locale().to }}</label>\r\n            <input\r\n              type=\"number\"\r\n              [value]=\"numberValueTo()\"\r\n              (input)=\"onNumberValueToInput($event)\"\r\n              [placeholder]=\"locale().toValuePlaceholder\"\r\n            />\r\n          </div>\r\n        }\r\n      }\r\n\r\n      <!-- DATE FILTER -->\r\n      @case ('date') {\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().operator }}</label>\r\n          <select [value]=\"dateOperator()\" (change)=\"onDateOperatorChange($event)\">\r\n            @for (op of dateOperators(); track op.value) {\r\n              <option [value]=\"op.value\" [selected]=\"op.value === dateOperator()\">\r\n                {{ op.label }}\r\n              </option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().value }}</label>\r\n          <input\r\n            type=\"date\"\r\n            [value]=\"dateValue()\"\r\n            (input)=\"onDateValueInput($event)\"\r\n          />\r\n        </div>\r\n        @if (showDateTo()) {\r\n          <div class=\"filter-field\">\r\n            <label>{{ locale().to }}</label>\r\n            <input\r\n              type=\"date\"\r\n              [value]=\"dateValueTo()\"\r\n              (input)=\"onDateValueToInput($event)\"\r\n            />\r\n          </div>\r\n        }\r\n      }\r\n\r\n      <!-- SET FILTER -->\r\n      @case ('set') {\r\n        <div class=\"filter-set-list\">\r\n          @for (val of setFilterValues(); track val) {\r\n            <label class=\"filter-set-item\">\r\n              <input\r\n                type=\"checkbox\"\r\n                [checked]=\"isSetValueSelected(val)\"\r\n                (change)=\"toggleSetValue(val)\"\r\n              />\r\n              <span>{{ val }}</span>\r\n            </label>\r\n          }\r\n          @if (setFilterValues().length === 0) {\r\n            <span class=\"filter-set-empty\">{{ locale().noValuesAvailable }}</span>\r\n          }\r\n        </div>\r\n      }\r\n    }\r\n  </div>\r\n\r\n  <div class=\"filter-menu-footer\">\r\n    <button class=\"filter-btn filter-btn-clear\" (click)=\"clear()\">{{ locale().clearFilter }}</button>\r\n    <button class=\"filter-btn filter-btn-apply\" [disabled]=\"!canApply()\" (click)=\"apply()\">\r\n      {{ locale().applyFilter }}\r\n    </button>\r\n  </div>\r\n</div>\r\n", styles: [".filter-menu{position:fixed;z-index:1000;min-width:220px;max-width:280px;background:var(--cell-bg, #ffffff);border:1px solid var(--cell-border, #dee2e6);border-radius:6px;box-shadow:0 4px 16px #0000001f;font-size:13px;color:var(--cell-text, #212529)}.filter-menu .filter-menu-header{padding:10px 12px 6px;font-weight:600;border-bottom:1px solid var(--cell-border, #dee2e6)}.filter-menu .filter-menu-body{padding:10px 12px;display:flex;flex-direction:column;gap:10px}.filter-menu .filter-field{display:flex;flex-direction:column;gap:4px}.filter-menu .filter-field label{font-size:11px;font-weight:600;color:var(--header-text, #6c757d);text-transform:uppercase;letter-spacing:.5px}.filter-menu .filter-field select,.filter-menu .filter-field input{padding:6px 8px;border:1px solid var(--cell-border, #dee2e6);border-radius:4px;background:var(--cell-bg, #fff);color:var(--cell-text, #212529);font-size:13px;outline:none;width:100%;box-sizing:border-box}.filter-menu .filter-field select:focus,.filter-menu .filter-field input:focus{border-color:var(--accent-color, #0d6efd);box-shadow:0 0 0 2px #0d6efd26}.filter-menu .filter-set-list{max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px}.filter-menu .filter-set-item{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:13px}.filter-menu .filter-set-item input[type=checkbox]{accent-color:var(--accent-color, #0d6efd)}.filter-menu .filter-set-empty{color:var(--header-text, #6c757d);font-style:italic;padding:8px 0}.filter-menu .filter-menu-footer{display:flex;justify-content:flex-end;gap:8px;padding:8px 12px;border-top:1px solid var(--cell-border, #dee2e6)}.filter-menu .filter-btn{padding:5px 14px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid var(--cell-border, #dee2e6);background:var(--cell-bg, #fff);color:var(--cell-text, #212529);transition:all .15s ease}.filter-menu .filter-btn:hover:not(:disabled){background-color:var(--row-hover, #f1f3f5)}.filter-menu .filter-btn:disabled{opacity:.5;cursor:not-allowed}.filter-menu .filter-btn-apply{background-color:var(--accent-color, #0d6efd);border-color:var(--accent-color, #0d6efd);color:#fff}.filter-menu .filter-btn-apply:hover:not(:disabled){opacity:.9;background-color:var(--accent-color, #0d6efd)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.6", ngImport: i0, type: DvDataGridFilterMenu, decorators: [{
            type: Component,
            args: [{ selector: 'dv-datagrid-filter-menu', changeDetection: ChangeDetectionStrategy.OnPush, template: "<div\r\n  class=\"filter-menu\"\r\n  [style.top.px]=\"positionTop()\"\r\n  [style.left.px]=\"positionLeft()\"\r\n  (click)=\"$event.stopPropagation()\"\r\n>\r\n  <div class=\"filter-menu-header\">\r\n    <span class=\"filter-menu-title\">{{ locale().filterMenuTitle }}</span>\r\n  </div>\r\n\r\n  <div class=\"filter-menu-body\">\r\n    @switch (filterType()) {\r\n      <!-- TEXT FILTER -->\r\n      @case ('text') {\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().operator }}</label>\r\n          <select [value]=\"textOperator()\" (change)=\"onTextOperatorChange($event)\">\r\n            @for (op of textOperators(); track op.value) {\r\n              <option [value]=\"op.value\" [selected]=\"op.value === textOperator()\">\r\n                {{ op.label }}\r\n              </option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().value }}</label>\r\n          <input\r\n            type=\"text\"\r\n            [value]=\"textValue()\"\r\n            (input)=\"onTextValueInput($event)\"\r\n            [placeholder]=\"locale().filterValuePlaceholder\"\r\n          />\r\n        </div>\r\n      }\r\n\r\n      <!-- NUMBER FILTER -->\r\n      @case ('number') {\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().operator }}</label>\r\n          <select [value]=\"numberOperator()\" (change)=\"onNumberOperatorChange($event)\">\r\n            @for (op of numberOperators(); track op.value) {\r\n              <option [value]=\"op.value\" [selected]=\"op.value === numberOperator()\">\r\n                {{ op.label }}\r\n              </option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().value }}</label>\r\n          <input\r\n            type=\"number\"\r\n            [value]=\"numberValue()\"\r\n            (input)=\"onNumberValueInput($event)\"\r\n            [placeholder]=\"locale().filterValuePlaceholder\"\r\n          />\r\n        </div>\r\n        @if (showNumberTo()) {\r\n          <div class=\"filter-field\">\r\n            <label>{{ locale().to }}</label>\r\n            <input\r\n              type=\"number\"\r\n              [value]=\"numberValueTo()\"\r\n              (input)=\"onNumberValueToInput($event)\"\r\n              [placeholder]=\"locale().toValuePlaceholder\"\r\n            />\r\n          </div>\r\n        }\r\n      }\r\n\r\n      <!-- DATE FILTER -->\r\n      @case ('date') {\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().operator }}</label>\r\n          <select [value]=\"dateOperator()\" (change)=\"onDateOperatorChange($event)\">\r\n            @for (op of dateOperators(); track op.value) {\r\n              <option [value]=\"op.value\" [selected]=\"op.value === dateOperator()\">\r\n                {{ op.label }}\r\n              </option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"filter-field\">\r\n          <label>{{ locale().value }}</label>\r\n          <input\r\n            type=\"date\"\r\n            [value]=\"dateValue()\"\r\n            (input)=\"onDateValueInput($event)\"\r\n          />\r\n        </div>\r\n        @if (showDateTo()) {\r\n          <div class=\"filter-field\">\r\n            <label>{{ locale().to }}</label>\r\n            <input\r\n              type=\"date\"\r\n              [value]=\"dateValueTo()\"\r\n              (input)=\"onDateValueToInput($event)\"\r\n            />\r\n          </div>\r\n        }\r\n      }\r\n\r\n      <!-- SET FILTER -->\r\n      @case ('set') {\r\n        <div class=\"filter-set-list\">\r\n          @for (val of setFilterValues(); track val) {\r\n            <label class=\"filter-set-item\">\r\n              <input\r\n                type=\"checkbox\"\r\n                [checked]=\"isSetValueSelected(val)\"\r\n                (change)=\"toggleSetValue(val)\"\r\n              />\r\n              <span>{{ val }}</span>\r\n            </label>\r\n          }\r\n          @if (setFilterValues().length === 0) {\r\n            <span class=\"filter-set-empty\">{{ locale().noValuesAvailable }}</span>\r\n          }\r\n        </div>\r\n      }\r\n    }\r\n  </div>\r\n\r\n  <div class=\"filter-menu-footer\">\r\n    <button class=\"filter-btn filter-btn-clear\" (click)=\"clear()\">{{ locale().clearFilter }}</button>\r\n    <button class=\"filter-btn filter-btn-apply\" [disabled]=\"!canApply()\" (click)=\"apply()\">\r\n      {{ locale().applyFilter }}\r\n    </button>\r\n  </div>\r\n</div>\r\n", styles: [".filter-menu{position:fixed;z-index:1000;min-width:220px;max-width:280px;background:var(--cell-bg, #ffffff);border:1px solid var(--cell-border, #dee2e6);border-radius:6px;box-shadow:0 4px 16px #0000001f;font-size:13px;color:var(--cell-text, #212529)}.filter-menu .filter-menu-header{padding:10px 12px 6px;font-weight:600;border-bottom:1px solid var(--cell-border, #dee2e6)}.filter-menu .filter-menu-body{padding:10px 12px;display:flex;flex-direction:column;gap:10px}.filter-menu .filter-field{display:flex;flex-direction:column;gap:4px}.filter-menu .filter-field label{font-size:11px;font-weight:600;color:var(--header-text, #6c757d);text-transform:uppercase;letter-spacing:.5px}.filter-menu .filter-field select,.filter-menu .filter-field input{padding:6px 8px;border:1px solid var(--cell-border, #dee2e6);border-radius:4px;background:var(--cell-bg, #fff);color:var(--cell-text, #212529);font-size:13px;outline:none;width:100%;box-sizing:border-box}.filter-menu .filter-field select:focus,.filter-menu .filter-field input:focus{border-color:var(--accent-color, #0d6efd);box-shadow:0 0 0 2px #0d6efd26}.filter-menu .filter-set-list{max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px}.filter-menu .filter-set-item{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:13px}.filter-menu .filter-set-item input[type=checkbox]{accent-color:var(--accent-color, #0d6efd)}.filter-menu .filter-set-empty{color:var(--header-text, #6c757d);font-style:italic;padding:8px 0}.filter-menu .filter-menu-footer{display:flex;justify-content:flex-end;gap:8px;padding:8px 12px;border-top:1px solid var(--cell-border, #dee2e6)}.filter-menu .filter-btn{padding:5px 14px;border-radius:4px;font-size:13px;cursor:pointer;border:1px solid var(--cell-border, #dee2e6);background:var(--cell-bg, #fff);color:var(--cell-text, #212529);transition:all .15s ease}.filter-menu .filter-btn:hover:not(:disabled){background-color:var(--row-hover, #f1f3f5)}.filter-menu .filter-btn:disabled{opacity:.5;cursor:not-allowed}.filter-menu .filter-btn-apply{background-color:var(--accent-color, #0d6efd);border-color:var(--accent-color, #0d6efd);color:#fff}.filter-menu .filter-btn-apply:hover:not(:disabled){opacity:.9;background-color:var(--accent-color, #0d6efd)}\n"] }]
        }], propDecorators: { filterType: [{ type: i0.Input, args: [{ isSignal: true, alias: "filterType", required: true }] }], field: [{ type: i0.Input, args: [{ isSignal: true, alias: "field", required: true }] }], currentFilter: [{ type: i0.Input, args: [{ isSignal: true, alias: "currentFilter", required: false }] }], setFilterValues: [{ type: i0.Input, args: [{ isSignal: true, alias: "setFilterValues", required: false }] }], positionTop: [{ type: i0.Input, args: [{ isSignal: true, alias: "positionTop", required: false }] }], positionLeft: [{ type: i0.Input, args: [{ isSignal: true, alias: "positionLeft", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], filterApplied: [{ type: i0.Output, args: ["filterApplied"] }], filterCleared: [{ type: i0.Output, args: ["filterCleared"] }], closed: [{ type: i0.Output, args: ["closed"] }], onEscapeKey: [{
                type: HostListener,
                args: ['document:keydown.escape']
            }] } });

class DvDataGrid {
    // Inputs
    columnDefs = input([], ...(ngDevMode ? [{ debugName: "columnDefs" }] : /* istanbul ignore next */ []));
    options = input({}, ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    detailTemplate = input(null, ...(ngDevMode ? [{ debugName: "detailTemplate" }] : /* istanbul ignore next */ []));
    // Outputs
    serverDataRequested = output();
    gridReady = output();
    selectionChanged = output();
    // Internal API
    gridApi = new DvGridApiImpl();
    // Expose signals from API for template binding
    rowData = this.gridApi.rowData;
    isLoading = this.gridApi.isLoading;
    sortModel = this.gridApi.sortModel;
    filterModel = this.gridApi.filterModel;
    currentPage = this.gridApi.currentPage;
    pageSize = this.gridApi.pageSize;
    totalRecords = this.gridApi.totalRecords;
    totalPages = this.gridApi.totalPages;
    selectedRowIds = this.gridApi.selectedRowIds;
    // Filter menu state
    openFilterField = signal(null, ...(ngDevMode ? [{ debugName: "openFilterField" }] : /* istanbul ignore next */ []));
    filterMenuPos = signal({ top: 0, left: 0 }, ...(ngDevMode ? [{ debugName: "filterMenuPos" }] : /* istanbul ignore next */ []));
    // Row expansion state
    expandedRowIds = signal(new Set(), ...(ngDevMode ? [{ debugName: "expandedRowIds" }] : /* istanbul ignore next */ []));
    // Tooltip state
    tooltipText = signal(null, ...(ngDevMode ? [{ debugName: "tooltipText" }] : /* istanbul ignore next */ []));
    tooltipPos = signal({ top: 0, left: 0 }, ...(ngDevMode ? [{ debugName: "tooltipPos" }] : /* istanbul ignore next */ []));
    tooltipTimer = null;
    // Computed
    themeClass = computed(() => {
        const theme = this.options().theme;
        return theme && theme !== 'custom' ? `my-data-grid-theme-${theme}` : '';
    }, ...(ngDevMode ? [{ debugName: "themeClass" }] : /* istanbul ignore next */ []));
    paginationEnabled = computed(() => this.options().pagination !== false, ...(ngDevMode ? [{ debugName: "paginationEnabled" }] : /* istanbul ignore next */ []));
    pageSizeOptions = computed(() => this.options().paginationPageSizeOptions ?? [10, 20, 50, 100], ...(ngDevMode ? [{ debugName: "pageSizeOptions" }] : /* istanbul ignore next */ []));
    selectionEnabled = computed(() => !!this.options().rowSelection, ...(ngDevMode ? [{ debugName: "selectionEnabled" }] : /* istanbul ignore next */ []));
    selectionMode = computed(() => this.options().rowSelection ?? null, ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    rowExpansionEnabled = computed(() => !!this.options().rowExpansion?.enabled, ...(ngDevMode ? [{ debugName: "rowExpansionEnabled" }] : /* istanbul ignore next */ []));
    totalColspan = computed(() => this.columnDefs().length +
        (this.selectionMode() === 'multi' ? 1 : 0) +
        (this.rowExpansionEnabled() ? 1 : 0), ...(ngDevMode ? [{ debugName: "totalColspan" }] : /* istanbul ignore next */ []));
    locale = computed(() => ({ ...EN_LOCALE, ...this.options().locale }), ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    headerCheckboxState = computed(() => {
        if (!this.selectionEnabled())
            return 'none';
        const rows = this.rowData();
        if (rows.length === 0)
            return 'none';
        const selected = this.selectedRowIds();
        const visibleIds = rows.map((row, i) => this.getRowId(row, i));
        const selectedCount = visibleIds.filter((id) => selected.has(id)).length;
        if (selectedCount === 0)
            return 'none';
        if (selectedCount === visibleIds.length)
            return 'all';
        return 'some';
    }, ...(ngDevMode ? [{ debugName: "headerCheckboxState" }] : /* istanbul ignore next */ []));
    constructor() {
        this.gridApi.registerGridComponent(this);
    }
    ngOnInit() {
        const opts = this.options();
        if (opts.paginationPageSize && opts.paginationPageSize > 0) {
            this.gridApi.setInitialPageSize(opts.paginationPageSize);
        }
        this.gridApi.setSelectionMode(opts.rowSelection ?? null);
        this.gridReady.emit(this.gridApi);
        this.loadServerData();
    }
    loadServerData() {
        this.gridApi.setLoading(true);
        this.serverDataRequested.emit(this.gridApi.buildRequestParams());
    }
    // ======================== Sort ========================
    onHeaderClick(col) {
        if (col.sortable === false)
            return;
        this.gridApi.toggleSort(col.field);
    }
    getSortDirection(field) {
        const item = this.sortModel().find((s) => s.colId === field);
        return item?.sort ?? null;
    }
    // ======================== Filter ========================
    getFilterType(col) {
        if (col.filter === true)
            return 'text';
        if (col.filter === false || col.filter == null)
            return null;
        return col.filter;
    }
    isFilterable(col) {
        return this.getFilterType(col) !== null;
    }
    hasActiveFilter(field) {
        return field in this.filterModel();
    }
    getColumnFilter(field) {
        return this.filterModel()[field] ?? null;
    }
    toggleFilterMenu(event, field) {
        event.stopPropagation();
        if (this.openFilterField() === field) {
            this.openFilterField.set(null);
            return;
        }
        // Position the dropdown below the trigger button
        const btn = event.currentTarget;
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
    onFilterApplied(field, filter) {
        this.gridApi.setColumnFilter(field, filter);
        this.openFilterField.set(null);
    }
    onFilterCleared(field) {
        this.gridApi.clearColumnFilter(field);
        this.openFilterField.set(null);
    }
    onFilterMenuClosed() {
        this.openFilterField.set(null);
    }
    onDocumentClick() {
        if (this.openFilterField() !== null) {
            this.openFilterField.set(null);
        }
    }
    // ======================== Pagination ========================
    onPageChanged(page) {
        this.gridApi.setPage(page);
    }
    onPageSizeChanged(size) {
        this.gridApi.setPageSize(size);
    }
    // ======================== Selection ========================
    getRowId(row, index) {
        return this.options().getRowId?.(row) ?? row['id'] ?? index;
    }
    isRowSelected(row, index) {
        return this.selectedRowIds().has(this.getRowId(row, index));
    }
    onHeaderCheckboxChange() {
        const rows = this.rowData();
        const visibleIds = rows.map((row, i) => this.getRowId(row, i));
        if (this.headerCheckboxState() === 'all') {
            visibleIds.forEach((id) => this.gridApi.deselectRow(id));
        }
        else {
            this.gridApi.selectAll(visibleIds);
        }
        this.emitSelectionChanged();
    }
    onRowCheckboxChange(event, row, index) {
        event.stopPropagation();
        this.gridApi.toggleRowSelection(this.getRowId(row, index));
        this.emitSelectionChanged();
    }
    onRowClick(event, row, index) {
        if (!this.selectionEnabled())
            return;
        const id = this.getRowId(row, index);
        if (this.selectionMode() === 'single') {
            if (this.gridApi.isRowSelected(id)) {
                this.gridApi.deselectRow(id);
            }
            else {
                this.gridApi.selectRow(id);
            }
            this.emitSelectionChanged();
        }
        else if (this.selectionMode() === 'multi') {
            this.gridApi.toggleRowSelection(id);
            this.emitSelectionChanged();
        }
    }
    emitSelectionChanged() {
        this.selectionChanged.emit(Array.from(this.selectedRowIds()));
    }
    // ======================== Value accessor ========================
    getValue(row, field) {
        return field.split('.').reduce((obj, key) => obj?.[key], row);
    }
    // ======================== Cell renderer ========================
    isTemplateRef(value) {
        return value instanceof TemplateRef;
    }
    getCellRendererInputs(col, row) {
        return {
            value: this.getValue(row, col.field),
            row,
            ...col.cellRendererParams,
        };
    }
    // ======================== Row expansion ========================
    isRowExpanded(row, index) {
        return this.expandedRowIds().has(this.getRowId(row, index));
    }
    onExpandToggle(event, row, index) {
        event.stopPropagation();
        const id = this.getRowId(row, index);
        this.expandedRowIds.update((ids) => {
            const next = new Set(ids);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }
    // ======================== Tooltip ========================
    getTooltipText(col, row, index) {
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
    onCellMouseEnter(event, col, row, index) {
        const text = this.getTooltipText(col, row, index);
        if (!text)
            return;
        const delay = this.options().tooltipShowDelay ?? 500;
        const el = event.currentTarget;
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
    onCellMouseLeave() {
        if (this.tooltipTimer !== null) {
            clearTimeout(this.tooltipTimer);
            this.tooltipTimer = null;
        }
        this.tooltipText.set(null);
    }
    ngOnDestroy() {
        if (this.tooltipTimer !== null) {
            clearTimeout(this.tooltipTimer);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.6", ngImport: i0, type: DvDataGrid, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.6", type: DvDataGrid, isStandalone: true, selector: "dv-datagrid", inputs: { columnDefs: { classPropertyName: "columnDefs", publicName: "columnDefs", isSignal: true, isRequired: false, transformFunction: null }, options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null }, detailTemplate: { classPropertyName: "detailTemplate", publicName: "detailTemplate", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { serverDataRequested: "serverDataRequested", gridReady: "gridReady", selectionChanged: "selectionChanged" }, host: { listeners: { "document:click": "onDocumentClick()" } }, ngImport: i0, template: "<div class=\"my-data-grid\" [class]=\"themeClass()\">\r\n  <!-- Table -->\r\n  <div class=\"grid-wrapper\">\r\n    <table class=\"grid-table\">\r\n      <!-- HEADER -->\r\n      <thead>\r\n        <tr class=\"grid-header-row\">\r\n          @if (rowExpansionEnabled()) {\r\n            <th class=\"grid-header-cell expansion-header\"></th>\r\n          }\r\n          @if (selectionMode() === 'multi') {\r\n            <th class=\"grid-header-cell selection-header\">\r\n              <input\r\n                type=\"checkbox\"\r\n                class=\"row-checkbox\"\r\n                [checked]=\"headerCheckboxState() === 'all'\"\r\n                [indeterminate]=\"headerCheckboxState() === 'some'\"\r\n                (change)=\"onHeaderCheckboxChange()\"\r\n                (click)=\"$event.stopPropagation()\"\r\n              />\r\n            </th>\r\n          }\r\n          @for (col of columnDefs(); track col.field) {\r\n            <th\r\n              class=\"grid-header-cell\"\r\n              [style.width.px]=\"col.width\"\r\n              [style.minWidth.px]=\"col.minWidth\"\r\n              [class.sortable]=\"col.sortable !== false\"\r\n              [class.sorted]=\"getSortDirection(col.field) !== null\"\r\n              [class.filtered]=\"hasActiveFilter(col.field)\"\r\n              (click)=\"onHeaderClick(col)\"\r\n            >\r\n              <div class=\"header-content\">\r\n                <span class=\"header-label\">{{ col.headerName || col.field }}</span>\r\n\r\n                <div class=\"header-actions\">\r\n                  <!-- Sort indicator -->\r\n                  @if (col.sortable !== false) {\r\n                    <span class=\"sort-indicator\">\r\n                      @switch (getSortDirection(col.field)) {\r\n                        @case ('asc') {\r\n                          <span class=\"sort-icon sort-asc\">\r\n                            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                              <path d=\"M12 4l-8 8h5v8h6v-8h5z\" />\r\n                            </svg>\r\n                          </span>\r\n                        }\r\n                        @case ('desc') {\r\n                          <span class=\"sort-icon sort-desc\">\r\n                            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                              <path d=\"M12 20l8-8h-5V4H9v8H4z\" />\r\n                            </svg>\r\n                          </span>\r\n                        }\r\n                        @default {\r\n                          <span class=\"sort-icon sort-none\">\r\n                            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                              <path d=\"M7 10l5-5 5 5z\" />\r\n                              <path d=\"M7 14l5 5 5-5z\" />\r\n                            </svg>\r\n                          </span>\r\n                        }\r\n                      }\r\n                    </span>\r\n                  }\r\n\r\n                  <!-- Filter icon -->\r\n                  @if (isFilterable(col)) {\r\n                    <button\r\n                      class=\"filter-trigger\"\r\n                      [class.filter-active]=\"hasActiveFilter(col.field)\"\r\n                      (click)=\"toggleFilterMenu($event, col.field)\"\r\n                      [title]=\"locale().filterButtonTitle\"\r\n                    >\r\n                      <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                        <path d=\"M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z\" />\r\n                      </svg>\r\n                    </button>\r\n                  }\r\n                </div>\r\n              </div>\r\n            </th>\r\n          }\r\n        </tr>\r\n      </thead>\r\n\r\n      <!-- BODY -->\r\n      <tbody>\r\n        @if (isLoading()) {\r\n          <tr class=\"loading-row\">\r\n            <td [attr.colspan]=\"totalColspan()\" class=\"loading-cell\">\r\n              <div class=\"loading-spinner\">\r\n                <div class=\"spinner\"></div>\r\n                <span>{{ locale().loading }}</span>\r\n              </div>\r\n            </td>\r\n          </tr>\r\n        } @else if (rowData().length === 0) {\r\n          <tr class=\"no-data-row\">\r\n            <td [attr.colspan]=\"totalColspan()\" class=\"no-data-cell\">{{ locale().noData }}</td>\r\n          </tr>\r\n        } @else {\r\n          @for (row of rowData(); track $index) {\r\n            <tr\r\n              class=\"grid-row\"\r\n              [class.selected]=\"isRowSelected(row, $index)\"\r\n              [class.expanded]=\"isRowExpanded(row, $index)\"\r\n              [class.selectable]=\"selectionEnabled()\"\r\n              (click)=\"onRowClick($event, row, $index)\"\r\n            >\r\n              @if (rowExpansionEnabled()) {\r\n                <td class=\"grid-cell expansion-cell\">\r\n                  <button\r\n                    class=\"expand-btn\"\r\n                    [class.expanded]=\"isRowExpanded(row, $index)\"\r\n                    (click)=\"onExpandToggle($event, row, $index)\"\r\n                  >\r\n                    <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                      <path d=\"M8 5l8 7-8 7z\"/>\r\n                    </svg>\r\n                  </button>\r\n                </td>\r\n              }\r\n              @if (selectionMode() === 'multi') {\r\n                <td class=\"grid-cell selection-cell\">\r\n                  <input\r\n                    type=\"checkbox\"\r\n                    class=\"row-checkbox\"\r\n                    [checked]=\"isRowSelected(row, $index)\"\r\n                    (change)=\"onRowCheckboxChange($event, row, $index)\"\r\n                    (click)=\"$event.stopPropagation()\"\r\n                  />\r\n                </td>\r\n              }\r\n              @for (col of columnDefs(); track col.field) {\r\n                <td\r\n                  class=\"grid-cell\"\r\n                  (mouseenter)=\"onCellMouseEnter($event, col, row, $index)\"\r\n                  (mouseleave)=\"onCellMouseLeave()\"\r\n                >\r\n                  @if (col.cellRenderer && isTemplateRef(col.cellRenderer)) {\r\n                    <ng-container\r\n                      *ngTemplateOutlet=\"\r\n                        col.cellRenderer;\r\n                        context: {\r\n                          $implicit: getValue(row, col.field),\r\n                          row: row,\r\n                          field: col.field,\r\n                          rowIndex: $index,\r\n                          params: col.cellRendererParams,\r\n                        }\r\n                      \"\r\n                    />\r\n                  } @else if (col.cellRenderer) {\r\n                    <ng-container\r\n                      *ngComponentOutlet=\"col.cellRenderer; inputs: getCellRendererInputs(col, row)\"\r\n                    />\r\n                  } @else if (col.valueFormatter) {\r\n                    {{ col.valueFormatter(row) }}\r\n                  } @else {\r\n                    {{ getValue(row, col.field) }}\r\n                  }\r\n                </td>\r\n              }\r\n            </tr>\r\n\r\n            @if (rowExpansionEnabled() && isRowExpanded(row, $index) && detailTemplate()) {\r\n              <tr class=\"detail-row\">\r\n                <td [attr.colspan]=\"totalColspan()\" class=\"detail-cell\">\r\n                  <ng-container\r\n                    *ngTemplateOutlet=\"detailTemplate()!; context: { $implicit: row, rowIndex: $index }\"\r\n                  />\r\n                </td>\r\n              </tr>\r\n            }\r\n          }\r\n        }\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n\r\n  <!-- PAGINATION -->\r\n  @if (paginationEnabled()) {\r\n    <dv-datagrid-pagination\r\n      [currentPage]=\"currentPage()\"\r\n      [pageSize]=\"pageSize()\"\r\n      [totalRecords]=\"totalRecords()\"\r\n      [pageSizeOptions]=\"pageSizeOptions()\"\r\n      [locale]=\"locale()\"\r\n      (pageChanged)=\"onPageChanged($event)\"\r\n      (pageSizeChanged)=\"onPageSizeChanged($event)\"\r\n    />\r\n  }\r\n</div>\r\n\r\n<!-- Tooltip rendered OUTSIDE the grid to avoid overflow clipping -->\r\n@if (tooltipText() !== null) {\r\n  <div\r\n    class=\"grid-tooltip\"\r\n    [style.top.px]=\"tooltipPos().top\"\r\n    [style.left.px]=\"tooltipPos().left\"\r\n  >{{ tooltipText() }}</div>\r\n}\r\n\r\n<!-- Filter dropdown rendered OUTSIDE the grid to avoid overflow clipping -->\r\n@if (openFilterField() !== null) {\r\n  @for (col of columnDefs(); track col.field) {\r\n    @if (openFilterField() === col.field) {\r\n      <dv-datagrid-filter-menu\r\n        [filterType]=\"getFilterType(col)!\"\r\n        [field]=\"col.field\"\r\n        [currentFilter]=\"getColumnFilter(col.field)\"\r\n        [setFilterValues]=\"col.filterValues ?? []\"\r\n        [positionTop]=\"filterMenuPos().top\"\r\n        [positionLeft]=\"filterMenuPos().left\"\r\n        [locale]=\"locale()\"\r\n        (filterApplied)=\"onFilterApplied(col.field, $event)\"\r\n        (filterCleared)=\"onFilterCleared(col.field)\"\r\n        (closed)=\"onFilterMenuClosed()\"\r\n      />\r\n    }\r\n  }\r\n}\r\n", styles: [".my-data-grid{--header-bg: #f8f9fa;--header-text: #212529;--header-border: #dee2e6;--cell-bg: #ffffff;--cell-text: #212529;--cell-border: #dee2e6;--row-hover: #f1f3f5;--row-selected: #e7f3ff;--accent-color: #0d6efd;--font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;--font-size: 14px;--header-font-weight: 600;--border-radius: 8px;--pagination-bg: #ffffff;--pagination-border: #dee2e6;font-family:var(--font-family);font-size:var(--font-size);color:var(--cell-text);width:100%;border:1px solid var(--header-border);border-radius:var(--border-radius);background-color:var(--cell-bg);position:relative;overflow:hidden}.my-data-grid .grid-wrapper{overflow:auto;max-height:560px}.my-data-grid .grid-table{width:100%;border-collapse:collapse;table-layout:fixed}.my-data-grid .grid-table .grid-header-row{background-color:var(--header-bg);position:sticky;top:0;z-index:10}.my-data-grid .grid-table .grid-header-row th.expansion-header{width:36px;min-width:36px;cursor:default}.my-data-grid .grid-table .grid-header-row th.selection-header{width:40px;min-width:40px;text-align:center;cursor:default}.my-data-grid .grid-table .grid-header-row th.grid-header-cell{padding:12px 10px;border-bottom:2px solid var(--header-border);border-right:1px solid var(--header-border);text-align:left;font-weight:var(--header-font-weight);color:var(--header-text);white-space:nowrap;overflow:visible;text-overflow:ellipsis;position:relative;-webkit-user-select:none;user-select:none}.my-data-grid .grid-table .grid-header-row th.grid-header-cell:last-child{border-right:none}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .header-content{display:flex;align-items:center;justify-content:space-between;gap:4px}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .header-label{overflow:hidden;text-overflow:ellipsis}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .header-actions{display:inline-flex;align-items:center;gap:2px;flex-shrink:0}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator,.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-icon{display:inline-flex;align-items:center}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-icon svg{display:block}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-none{opacity:.25}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-asc,.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-desc{color:var(--accent-color);opacity:1}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:3px;background:transparent;color:var(--header-text);opacity:.3;cursor:pointer;transition:all .15s ease}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger svg{display:block}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger:hover{opacity:.7;background-color:#0000000f}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger.filter-active{opacity:1;color:var(--accent-color)}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sortable{cursor:pointer}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sortable:hover{background-color:#0000000a}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sortable:hover .sort-none{opacity:.5}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sorted{background-color:#00000005}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.filtered{background-color:#0d6efd0a}.my-data-grid .grid-table tbody .grid-row{transition:background-color .1s ease}.my-data-grid .grid-table tbody .grid-row.selectable{cursor:pointer}.my-data-grid .grid-table tbody .grid-row.selected{background-color:var(--row-selected)}.my-data-grid .grid-table tbody .grid-row.selected:hover{background-color:color-mix(in srgb,var(--row-selected) 85%,#000 15%)}.my-data-grid .grid-table tbody .grid-row:hover{background-color:var(--row-hover)}.my-data-grid .grid-table tbody .grid-row td.expansion-cell{width:36px;min-width:36px;text-align:center;padding:0;border-bottom:1px solid var(--cell-border);border-right:1px solid var(--cell-border)}.my-data-grid .grid-table tbody .grid-row .expand-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:transparent;cursor:pointer;color:var(--header-text, #374151);border-radius:4px;transition:background-color .15s ease,transform .2s ease}.my-data-grid .grid-table tbody .grid-row .expand-btn svg{transition:transform .2s ease}.my-data-grid .grid-table tbody .grid-row .expand-btn:hover{background-color:#0000000f}.my-data-grid .grid-table tbody .grid-row .expand-btn.expanded svg{transform:rotate(90deg)}.my-data-grid .grid-table tbody .grid-row tr.detail-row td.detail-cell{padding:0;background-color:var(--detail-bg, #f8f9fb);border-bottom:2px solid var(--cell-border)}.my-data-grid .grid-table tbody .grid-row td.selection-cell{width:40px;min-width:40px;text-align:center;padding:0;border-bottom:1px solid var(--cell-border);border-right:1px solid var(--cell-border)}.my-data-grid .grid-table tbody .grid-row td.grid-cell{padding:10px;border-bottom:1px solid var(--cell-border);border-right:1px solid var(--cell-border);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.my-data-grid .grid-table tbody .grid-row td.grid-cell:last-child{border-right:none}.my-data-grid .grid-table tbody .loading-row td,.my-data-grid .grid-table tbody .no-data-row td{padding:40px 20px;text-align:center;color:#6c757d;font-style:italic}.my-data-grid .grid-table tbody .loading-spinner{display:flex;align-items:center;justify-content:center;gap:10px}.my-data-grid .grid-table tbody .loading-spinner .spinner{width:20px;height:20px;border:2px solid var(--cell-border);border-top-color:var(--accent-color);border-radius:50%;animation:spin .7s linear infinite}.my-data-grid .row-checkbox{width:15px;height:15px;cursor:pointer;accent-color:var(--accent-color);display:block;margin:0 auto}.my-data-grid.my-data-grid-theme-alpine{--header-bg: #f8f9fa;--header-border: #d0d7de;--accent-color: #1e40af}.my-data-grid.my-data-grid-theme-dark{--header-bg: #2d3748;--header-text: #e2e8f0;--cell-bg: #1a202c;--cell-text: #e2e8f0;--cell-border: #4a5568;--row-hover: #2d3748;--header-border: #4a5568;--pagination-bg: #1a202c;--pagination-border: #4a5568}.my-data-grid.my-data-grid-theme-material{--header-bg: #f5f5f5;--header-text: #424242;--accent-color: #1976d2;--cell-border: #e0e0e0;--border-radius: 4px}.my-data-grid .grid-wrapper::-webkit-scrollbar{height:8px;width:8px}.my-data-grid .grid-wrapper::-webkit-scrollbar-thumb{background-color:#0003;border-radius:4px}.my-data-grid .grid-wrapper::-webkit-scrollbar-thumb:hover{background-color:#0000004d}.grid-tooltip{position:fixed;z-index:9999;max-width:280px;padding:6px 10px;background-color:#1e2530;color:#fff;font-size:12px;line-height:1.4;border-radius:4px;pointer-events:none;white-space:pre-wrap;word-break:break-word;box-shadow:0 2px 8px #00000040;animation:tooltip-fade-in .1s ease}@keyframes tooltip-fade-in{0%{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}\n"], dependencies: [{ kind: "component", type: DvDataGridPagination, selector: "dv-datagrid-pagination", inputs: ["currentPage", "pageSize", "totalRecords", "pageSizeOptions", "locale"], outputs: ["pageChanged", "pageSizeChanged"] }, { kind: "component", type: DvDataGridFilterMenu, selector: "dv-datagrid-filter-menu", inputs: ["filterType", "field", "currentFilter", "setFilterValues", "positionTop", "positionLeft", "locale"], outputs: ["filterApplied", "filterCleared", "closed"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: NgComponentOutlet, selector: "[ngComponentOutlet]", inputs: ["ngComponentOutlet", "ngComponentOutletInputs", "ngComponentOutletInjector", "ngComponentOutletEnvironmentInjector", "ngComponentOutletContent", "ngComponentOutletNgModule"], exportAs: ["ngComponentOutlet"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.6", ngImport: i0, type: DvDataGrid, decorators: [{
            type: Component,
            args: [{ selector: 'dv-datagrid', imports: [DvDataGridPagination, DvDataGridFilterMenu, NgTemplateOutlet, NgComponentOutlet], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"my-data-grid\" [class]=\"themeClass()\">\r\n  <!-- Table -->\r\n  <div class=\"grid-wrapper\">\r\n    <table class=\"grid-table\">\r\n      <!-- HEADER -->\r\n      <thead>\r\n        <tr class=\"grid-header-row\">\r\n          @if (rowExpansionEnabled()) {\r\n            <th class=\"grid-header-cell expansion-header\"></th>\r\n          }\r\n          @if (selectionMode() === 'multi') {\r\n            <th class=\"grid-header-cell selection-header\">\r\n              <input\r\n                type=\"checkbox\"\r\n                class=\"row-checkbox\"\r\n                [checked]=\"headerCheckboxState() === 'all'\"\r\n                [indeterminate]=\"headerCheckboxState() === 'some'\"\r\n                (change)=\"onHeaderCheckboxChange()\"\r\n                (click)=\"$event.stopPropagation()\"\r\n              />\r\n            </th>\r\n          }\r\n          @for (col of columnDefs(); track col.field) {\r\n            <th\r\n              class=\"grid-header-cell\"\r\n              [style.width.px]=\"col.width\"\r\n              [style.minWidth.px]=\"col.minWidth\"\r\n              [class.sortable]=\"col.sortable !== false\"\r\n              [class.sorted]=\"getSortDirection(col.field) !== null\"\r\n              [class.filtered]=\"hasActiveFilter(col.field)\"\r\n              (click)=\"onHeaderClick(col)\"\r\n            >\r\n              <div class=\"header-content\">\r\n                <span class=\"header-label\">{{ col.headerName || col.field }}</span>\r\n\r\n                <div class=\"header-actions\">\r\n                  <!-- Sort indicator -->\r\n                  @if (col.sortable !== false) {\r\n                    <span class=\"sort-indicator\">\r\n                      @switch (getSortDirection(col.field)) {\r\n                        @case ('asc') {\r\n                          <span class=\"sort-icon sort-asc\">\r\n                            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                              <path d=\"M12 4l-8 8h5v8h6v-8h5z\" />\r\n                            </svg>\r\n                          </span>\r\n                        }\r\n                        @case ('desc') {\r\n                          <span class=\"sort-icon sort-desc\">\r\n                            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                              <path d=\"M12 20l8-8h-5V4H9v8H4z\" />\r\n                            </svg>\r\n                          </span>\r\n                        }\r\n                        @default {\r\n                          <span class=\"sort-icon sort-none\">\r\n                            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                              <path d=\"M7 10l5-5 5 5z\" />\r\n                              <path d=\"M7 14l5 5 5-5z\" />\r\n                            </svg>\r\n                          </span>\r\n                        }\r\n                      }\r\n                    </span>\r\n                  }\r\n\r\n                  <!-- Filter icon -->\r\n                  @if (isFilterable(col)) {\r\n                    <button\r\n                      class=\"filter-trigger\"\r\n                      [class.filter-active]=\"hasActiveFilter(col.field)\"\r\n                      (click)=\"toggleFilterMenu($event, col.field)\"\r\n                      [title]=\"locale().filterButtonTitle\"\r\n                    >\r\n                      <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                        <path d=\"M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z\" />\r\n                      </svg>\r\n                    </button>\r\n                  }\r\n                </div>\r\n              </div>\r\n            </th>\r\n          }\r\n        </tr>\r\n      </thead>\r\n\r\n      <!-- BODY -->\r\n      <tbody>\r\n        @if (isLoading()) {\r\n          <tr class=\"loading-row\">\r\n            <td [attr.colspan]=\"totalColspan()\" class=\"loading-cell\">\r\n              <div class=\"loading-spinner\">\r\n                <div class=\"spinner\"></div>\r\n                <span>{{ locale().loading }}</span>\r\n              </div>\r\n            </td>\r\n          </tr>\r\n        } @else if (rowData().length === 0) {\r\n          <tr class=\"no-data-row\">\r\n            <td [attr.colspan]=\"totalColspan()\" class=\"no-data-cell\">{{ locale().noData }}</td>\r\n          </tr>\r\n        } @else {\r\n          @for (row of rowData(); track $index) {\r\n            <tr\r\n              class=\"grid-row\"\r\n              [class.selected]=\"isRowSelected(row, $index)\"\r\n              [class.expanded]=\"isRowExpanded(row, $index)\"\r\n              [class.selectable]=\"selectionEnabled()\"\r\n              (click)=\"onRowClick($event, row, $index)\"\r\n            >\r\n              @if (rowExpansionEnabled()) {\r\n                <td class=\"grid-cell expansion-cell\">\r\n                  <button\r\n                    class=\"expand-btn\"\r\n                    [class.expanded]=\"isRowExpanded(row, $index)\"\r\n                    (click)=\"onExpandToggle($event, row, $index)\"\r\n                  >\r\n                    <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\r\n                      <path d=\"M8 5l8 7-8 7z\"/>\r\n                    </svg>\r\n                  </button>\r\n                </td>\r\n              }\r\n              @if (selectionMode() === 'multi') {\r\n                <td class=\"grid-cell selection-cell\">\r\n                  <input\r\n                    type=\"checkbox\"\r\n                    class=\"row-checkbox\"\r\n                    [checked]=\"isRowSelected(row, $index)\"\r\n                    (change)=\"onRowCheckboxChange($event, row, $index)\"\r\n                    (click)=\"$event.stopPropagation()\"\r\n                  />\r\n                </td>\r\n              }\r\n              @for (col of columnDefs(); track col.field) {\r\n                <td\r\n                  class=\"grid-cell\"\r\n                  (mouseenter)=\"onCellMouseEnter($event, col, row, $index)\"\r\n                  (mouseleave)=\"onCellMouseLeave()\"\r\n                >\r\n                  @if (col.cellRenderer && isTemplateRef(col.cellRenderer)) {\r\n                    <ng-container\r\n                      *ngTemplateOutlet=\"\r\n                        col.cellRenderer;\r\n                        context: {\r\n                          $implicit: getValue(row, col.field),\r\n                          row: row,\r\n                          field: col.field,\r\n                          rowIndex: $index,\r\n                          params: col.cellRendererParams,\r\n                        }\r\n                      \"\r\n                    />\r\n                  } @else if (col.cellRenderer) {\r\n                    <ng-container\r\n                      *ngComponentOutlet=\"col.cellRenderer; inputs: getCellRendererInputs(col, row)\"\r\n                    />\r\n                  } @else if (col.valueFormatter) {\r\n                    {{ col.valueFormatter(row) }}\r\n                  } @else {\r\n                    {{ getValue(row, col.field) }}\r\n                  }\r\n                </td>\r\n              }\r\n            </tr>\r\n\r\n            @if (rowExpansionEnabled() && isRowExpanded(row, $index) && detailTemplate()) {\r\n              <tr class=\"detail-row\">\r\n                <td [attr.colspan]=\"totalColspan()\" class=\"detail-cell\">\r\n                  <ng-container\r\n                    *ngTemplateOutlet=\"detailTemplate()!; context: { $implicit: row, rowIndex: $index }\"\r\n                  />\r\n                </td>\r\n              </tr>\r\n            }\r\n          }\r\n        }\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n\r\n  <!-- PAGINATION -->\r\n  @if (paginationEnabled()) {\r\n    <dv-datagrid-pagination\r\n      [currentPage]=\"currentPage()\"\r\n      [pageSize]=\"pageSize()\"\r\n      [totalRecords]=\"totalRecords()\"\r\n      [pageSizeOptions]=\"pageSizeOptions()\"\r\n      [locale]=\"locale()\"\r\n      (pageChanged)=\"onPageChanged($event)\"\r\n      (pageSizeChanged)=\"onPageSizeChanged($event)\"\r\n    />\r\n  }\r\n</div>\r\n\r\n<!-- Tooltip rendered OUTSIDE the grid to avoid overflow clipping -->\r\n@if (tooltipText() !== null) {\r\n  <div\r\n    class=\"grid-tooltip\"\r\n    [style.top.px]=\"tooltipPos().top\"\r\n    [style.left.px]=\"tooltipPos().left\"\r\n  >{{ tooltipText() }}</div>\r\n}\r\n\r\n<!-- Filter dropdown rendered OUTSIDE the grid to avoid overflow clipping -->\r\n@if (openFilterField() !== null) {\r\n  @for (col of columnDefs(); track col.field) {\r\n    @if (openFilterField() === col.field) {\r\n      <dv-datagrid-filter-menu\r\n        [filterType]=\"getFilterType(col)!\"\r\n        [field]=\"col.field\"\r\n        [currentFilter]=\"getColumnFilter(col.field)\"\r\n        [setFilterValues]=\"col.filterValues ?? []\"\r\n        [positionTop]=\"filterMenuPos().top\"\r\n        [positionLeft]=\"filterMenuPos().left\"\r\n        [locale]=\"locale()\"\r\n        (filterApplied)=\"onFilterApplied(col.field, $event)\"\r\n        (filterCleared)=\"onFilterCleared(col.field)\"\r\n        (closed)=\"onFilterMenuClosed()\"\r\n      />\r\n    }\r\n  }\r\n}\r\n", styles: [".my-data-grid{--header-bg: #f8f9fa;--header-text: #212529;--header-border: #dee2e6;--cell-bg: #ffffff;--cell-text: #212529;--cell-border: #dee2e6;--row-hover: #f1f3f5;--row-selected: #e7f3ff;--accent-color: #0d6efd;--font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;--font-size: 14px;--header-font-weight: 600;--border-radius: 8px;--pagination-bg: #ffffff;--pagination-border: #dee2e6;font-family:var(--font-family);font-size:var(--font-size);color:var(--cell-text);width:100%;border:1px solid var(--header-border);border-radius:var(--border-radius);background-color:var(--cell-bg);position:relative;overflow:hidden}.my-data-grid .grid-wrapper{overflow:auto;max-height:560px}.my-data-grid .grid-table{width:100%;border-collapse:collapse;table-layout:fixed}.my-data-grid .grid-table .grid-header-row{background-color:var(--header-bg);position:sticky;top:0;z-index:10}.my-data-grid .grid-table .grid-header-row th.expansion-header{width:36px;min-width:36px;cursor:default}.my-data-grid .grid-table .grid-header-row th.selection-header{width:40px;min-width:40px;text-align:center;cursor:default}.my-data-grid .grid-table .grid-header-row th.grid-header-cell{padding:12px 10px;border-bottom:2px solid var(--header-border);border-right:1px solid var(--header-border);text-align:left;font-weight:var(--header-font-weight);color:var(--header-text);white-space:nowrap;overflow:visible;text-overflow:ellipsis;position:relative;-webkit-user-select:none;user-select:none}.my-data-grid .grid-table .grid-header-row th.grid-header-cell:last-child{border-right:none}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .header-content{display:flex;align-items:center;justify-content:space-between;gap:4px}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .header-label{overflow:hidden;text-overflow:ellipsis}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .header-actions{display:inline-flex;align-items:center;gap:2px;flex-shrink:0}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator,.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-icon{display:inline-flex;align-items:center}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-icon svg{display:block}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-none{opacity:.25}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-asc,.my-data-grid .grid-table .grid-header-row th.grid-header-cell .sort-indicator .sort-desc{color:var(--accent-color);opacity:1}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:3px;background:transparent;color:var(--header-text);opacity:.3;cursor:pointer;transition:all .15s ease}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger svg{display:block}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger:hover{opacity:.7;background-color:#0000000f}.my-data-grid .grid-table .grid-header-row th.grid-header-cell .filter-trigger.filter-active{opacity:1;color:var(--accent-color)}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sortable{cursor:pointer}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sortable:hover{background-color:#0000000a}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sortable:hover .sort-none{opacity:.5}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.sorted{background-color:#00000005}.my-data-grid .grid-table .grid-header-row th.grid-header-cell.filtered{background-color:#0d6efd0a}.my-data-grid .grid-table tbody .grid-row{transition:background-color .1s ease}.my-data-grid .grid-table tbody .grid-row.selectable{cursor:pointer}.my-data-grid .grid-table tbody .grid-row.selected{background-color:var(--row-selected)}.my-data-grid .grid-table tbody .grid-row.selected:hover{background-color:color-mix(in srgb,var(--row-selected) 85%,#000 15%)}.my-data-grid .grid-table tbody .grid-row:hover{background-color:var(--row-hover)}.my-data-grid .grid-table tbody .grid-row td.expansion-cell{width:36px;min-width:36px;text-align:center;padding:0;border-bottom:1px solid var(--cell-border);border-right:1px solid var(--cell-border)}.my-data-grid .grid-table tbody .grid-row .expand-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:none;background:transparent;cursor:pointer;color:var(--header-text, #374151);border-radius:4px;transition:background-color .15s ease,transform .2s ease}.my-data-grid .grid-table tbody .grid-row .expand-btn svg{transition:transform .2s ease}.my-data-grid .grid-table tbody .grid-row .expand-btn:hover{background-color:#0000000f}.my-data-grid .grid-table tbody .grid-row .expand-btn.expanded svg{transform:rotate(90deg)}.my-data-grid .grid-table tbody .grid-row tr.detail-row td.detail-cell{padding:0;background-color:var(--detail-bg, #f8f9fb);border-bottom:2px solid var(--cell-border)}.my-data-grid .grid-table tbody .grid-row td.selection-cell{width:40px;min-width:40px;text-align:center;padding:0;border-bottom:1px solid var(--cell-border);border-right:1px solid var(--cell-border)}.my-data-grid .grid-table tbody .grid-row td.grid-cell{padding:10px;border-bottom:1px solid var(--cell-border);border-right:1px solid var(--cell-border);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.my-data-grid .grid-table tbody .grid-row td.grid-cell:last-child{border-right:none}.my-data-grid .grid-table tbody .loading-row td,.my-data-grid .grid-table tbody .no-data-row td{padding:40px 20px;text-align:center;color:#6c757d;font-style:italic}.my-data-grid .grid-table tbody .loading-spinner{display:flex;align-items:center;justify-content:center;gap:10px}.my-data-grid .grid-table tbody .loading-spinner .spinner{width:20px;height:20px;border:2px solid var(--cell-border);border-top-color:var(--accent-color);border-radius:50%;animation:spin .7s linear infinite}.my-data-grid .row-checkbox{width:15px;height:15px;cursor:pointer;accent-color:var(--accent-color);display:block;margin:0 auto}.my-data-grid.my-data-grid-theme-alpine{--header-bg: #f8f9fa;--header-border: #d0d7de;--accent-color: #1e40af}.my-data-grid.my-data-grid-theme-dark{--header-bg: #2d3748;--header-text: #e2e8f0;--cell-bg: #1a202c;--cell-text: #e2e8f0;--cell-border: #4a5568;--row-hover: #2d3748;--header-border: #4a5568;--pagination-bg: #1a202c;--pagination-border: #4a5568}.my-data-grid.my-data-grid-theme-material{--header-bg: #f5f5f5;--header-text: #424242;--accent-color: #1976d2;--cell-border: #e0e0e0;--border-radius: 4px}.my-data-grid .grid-wrapper::-webkit-scrollbar{height:8px;width:8px}.my-data-grid .grid-wrapper::-webkit-scrollbar-thumb{background-color:#0003;border-radius:4px}.my-data-grid .grid-wrapper::-webkit-scrollbar-thumb:hover{background-color:#0000004d}.grid-tooltip{position:fixed;z-index:9999;max-width:280px;padding:6px 10px;background-color:#1e2530;color:#fff;font-size:12px;line-height:1.4;border-radius:4px;pointer-events:none;white-space:pre-wrap;word-break:break-word;box-shadow:0 2px 8px #00000040;animation:tooltip-fade-in .1s ease}@keyframes tooltip-fade-in{0%{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { columnDefs: [{ type: i0.Input, args: [{ isSignal: true, alias: "columnDefs", required: false }] }], options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: false }] }], detailTemplate: [{ type: i0.Input, args: [{ isSignal: true, alias: "detailTemplate", required: false }] }], serverDataRequested: [{ type: i0.Output, args: ["serverDataRequested"] }], gridReady: [{ type: i0.Output, args: ["gridReady"] }], selectionChanged: [{ type: i0.Output, args: ["selectionChanged"] }], onDocumentClick: [{
                type: HostListener,
                args: ['document:click']
            }] } });

/*
 * Public API Surface of dv-datagrid
 */

/**
 * Generated bundle index. Do not edit.
 */

export { DvDataGrid, DvDataGridFilterMenu, DvDataGridPagination, EN_LOCALE, UK_LOCALE };
//# sourceMappingURL=dv-datagrid.mjs.map
