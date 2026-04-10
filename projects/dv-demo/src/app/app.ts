import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  DvColDef,
  DvDataGrid,
  DvGridApi,
  DvGridOptions,
  DvRowClickEvent,
  EN_LOCALE,
  FilterInstance,
  ServerRequestParams,
  UK_LOCALE,
} from 'dv-datagrid';
import { AgeCellComponent } from './components/age-cell';
import { StatusCellComponent } from './components/status-cell';

// ─── Constants ───────────────────────────────────────────────

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Support'];
const ROLES = ['Engineer', 'Manager', 'Director', 'Analyst', 'Designer', 'Lead'];
const STATUSES = ['active', 'inactive', 'onLeave'] as const;
const PRODUCTS = ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Webcam', 'USB Hub', 'SSD'];
const ORDER_STATUSES = ['completed', 'pending', 'cancelled'] as const;

const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Carol',
  'David',
  'Emma',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack',
  'Kate',
  'Liam',
  'Mia',
  'Noah',
  'Olivia',
  'Paul',
  'Quinn',
  'Rachel',
  'Sam',
  'Tina',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Young',
  'Lee',
];

// ─── Interfaces ──────────────────────────────────────────────

interface Order {
  orderId: string;
  product: string;
  amount: number;
  orderStatus: (typeof ORDER_STATUSES)[number];
  date: string;
}

interface Employee {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  role: string;
  salary: number;
  status: (typeof STATUSES)[number];
  joinDate: string;
  phone: string;
  orders: Order[];
}

// ─── Component ───────────────────────────────────────────────

@Component({
  selector: 'app-root',
  imports: [DvDataGrid, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // ── View children
  readonly emailTpl = viewChild.required<TemplateRef<any>>('emailTpl');
  readonly detailTpl = viewChild.required<TemplateRef<any>>('detailTpl');
  readonly headerTpl = viewChild.required<TemplateRef<any>>('headerTpl');

  // ── Grid config state
  readonly activeTheme = signal<'alpine' | 'material' | 'dark'>('alpine');
  readonly activeLocale = signal<'en' | 'uk'>('en');
  readonly expansionEnabled = signal(true);
  readonly paginationEnabled = signal(true);
  readonly columnResizeEnabled = signal(true);

  // ── Code example state
  readonly activeExample = signal('basicSetup');
  readonly activeLang = signal<'ts' | 'html'>('ts');
  readonly copiedCode = signal(false);

  // ── Toolbar search
  readonly nameSearch = signal('');

  // ── Grid API (stored as signal so template computeds track it)
  private readonly _gridApi = signal<DvGridApi | null>(null);

  // ── Reactive status from API signals
  readonly totalRecords = computed(() => this._gridApi()?.totalRecords() ?? 0);
  readonly currentPage = computed(() => this._gridApi()?.currentPage() ?? 1);
  readonly totalPages = computed(() => this._gridApi()?.totalPages() ?? 1);
  readonly selectedCount = computed(() => this._gridApi()?.selectedRowIds()?.size ?? 0);
  readonly lastClickedRow = signal<string | null>(null);
  readonly filterCount = computed(() => Object.keys(this._gridApi()?.filterModel() ?? {}).length);

  // ── Reactive grid options
  readonly gridOptions = computed<DvGridOptions>(() => ({
    pagination: this.paginationEnabled(),
    paginationPageSize: 10,
    paginationPageSizeOptions: [5, 10, 25, 50],
    theme: this.activeTheme(),
    rowSelection: 'multi',
    rowExpansion: { enabled: this.expansionEnabled() },
    enableColumnResize: this.columnResizeEnabled(),
    getRowId: (row: Employee) => row.id,
    locale: this.activeLocale() === 'en' ? EN_LOCALE : UK_LOCALE,
    exportFileName: 'example-export-file'
  }));

  // ── Column definitions (assigned in ngOnInit after templates are available)
  columnDefs: DvColDef<Employee>[] = [];

  // ── Mock dataset (200 employees)
  private readonly allData: Employee[] = Array.from({ length: 200 }, (_, i) => {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    return {
      id: i + 1,
      name: `${fn} ${ln}`,
      age: 22 + (i % 40),
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 0 ? i : ''}@company.com`,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      role: ROLES[i % ROLES.length],
      salary: 50000 + ((i * 1237 + 11) % 100000),
      status: STATUSES[i % STATUSES.length],
      joinDate: new Date(2018 + (i % 6), (i * 3) % 12, 1 + (i % 28)).toISOString().split('T')[0],
      phone: `+1 (${String(200 + (i % 800)).padStart(3, '0')}) ${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
      orders: Array.from({ length: 1 + (i % 4) }, (_, j) => ({
        orderId: `ORD-${(i + 1) * 100 + j + 1}`,
        product: PRODUCTS[(i + j) % PRODUCTS.length],
        amount: Math.round((50 + ((i * 7 + j * 13) % 950)) * 100) / 100,
        orderStatus: ORDER_STATUSES[(i + j) % ORDER_STATUSES.length],
        date: new Date(2023 + Math.floor((i + j) / 12), (i + j) % 12, 1 + ((i * j + 1) % 28))
          .toISOString()
          .split('T')[0],
      })),
    };
  });

  // ── Theme options for sidebar
  readonly themes: { value: 'alpine' | 'material' | 'dark'; label: string }[] = [
    { value: 'alpine', label: 'Alpine' },
    { value: 'material', label: 'Material' },
    { value: 'dark', label: 'Dark' },
  ];

  // ── Example tabs list
  readonly exampleList = [
    { key: 'installation', label: 'Installation', hasHtml: false },
    { key: 'basicSetup', label: 'Basic Setup', hasHtml: true },
    { key: 'columnDefs', label: 'Column Defs', hasHtml: false },
    { key: 'filterTypes', label: 'Filters', hasHtml: false },
    { key: 'cellRenderers', label: 'Cell Renderers', hasHtml: true },
    { key: 'rowExpansion', label: 'Row Expansion', hasHtml: true },
    { key: 'columnResize', label: 'Col Resize', hasHtml: false },
    { key: 'gridApi', label: 'Grid API', hasHtml: false },
    { key: 'themes', label: 'Themes & Locale', hasHtml: false },
    { key: 'headerTemplate', label: 'Header Toolbar', hasHtml: true },
  ];

  readonly currentExample = computed(
    () => this.exampleList.find((e) => e.key === this.activeExample()) ?? null,
  );
  click(id: number) {
    console.log('id: ' + id);
  }
  readonly currentCode = computed(() => {
    const ex = this.examples[this.activeExample()];
    if (!ex) return '';
    if (this.activeLang() === 'html' && ex.html) return ex.html;
    return ex.ts;
  });

  // ── Code examples
  readonly examples: Record<string, { ts: string; html?: string }> = {
    installation: {
      ts: `# Install via npm
npm install dv-datagrid

# The library ships as a standalone Angular component —
# no NgModule required. Import DvDataGrid directly.

# Peer dependencies: @angular/core ^17 | ^18 | ^19 | ^20 | ^21

# ── Required styles ────────────────────────────────────────────
# In angular.json → projects → architect → build → styles:
{
  "styles": [
    "node_modules/dv-datagrid/styles.css",
    "src/styles.scss"
  ]
}`,
    },

    basicSetup: {
      ts: `import { Component } from '@angular/core';
import {
  DvDataGrid,
  DvColDef,
  DvGridOptions,
  DvGridApi,
  ServerRequestParams,
} from 'dv-datagrid';

@Component({
  standalone: true,
  imports: [DvDataGrid],
  templateUrl: './employees.html',
})
export class EmployeesComponent {
  columnDefs: DvColDef<Employee>[] = [
    { field: 'id',         headerName: 'ID',         width: 60, filter: 'number' },
    { field: 'name',       headerName: 'Name',        sortable: true, filter: 'text' },
    { field: 'department', headerName: 'Department',  filter: 'set', filterValues: DEPARTMENTS },
    { field: 'salary',     headerName: 'Salary',      filter: 'number',
      valueFormatter: (row) => '$' + Number(row.salary).toLocaleString() },
  ];

  gridOptions: DvGridOptions = {
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeOptions: [10, 20, 50, 100],
    rowSelection: 'multi',
    rowExpansion: { enabled: true },
    getRowId: (row) => row.id,
  };

  private api!: DvGridApi;

  onGridReady(api: DvGridApi): void {
    this.api = api;
  }

  onServerDataRequested(params: ServerRequestParams): void {
    let data = [...allEmployees];

    // 1. Filter
    for (const [field, filter] of Object.entries(params.filterModel)) {
      data = data.filter(row => applyFilter(row[field], filter));
    }

    // 2. Sort
    if (params.sortModel.length) {
      const { colId, sort } = params.sortModel[0];
      data.sort((a, b) => {
        if (a[colId] < b[colId]) return sort === 'asc' ? -1 : 1;
        if (a[colId] > b[colId]) return sort === 'asc' ?  1 : -1;
        return 0;
      });
    }

    // 3. Paginate
    const start = (params.page - 1) * params.pageSize;
    this.api.setServerData(data.slice(start, start + params.pageSize), data.length);
  }
}`,
      html: `<dv-datagrid
  [columnDefs]="columnDefs"
  [options]="gridOptions"
  [detailTemplate]="detailTpl"
  (serverDataRequested)="onServerDataRequested($event)"
  (gridReady)="onGridReady($event)"
  (selectionChanged)="onSelectionChanged($event)"
/>

<!-- Row expansion detail panel -->
<ng-template #detailTpl let-row>
  <div class="detail">
    <p>Email: {{ row.email }}</p>
    <p>Phone: {{ row.phone }}</p>
  </div>
</ng-template>`,
    },

    columnDefs: {
      ts: `import { DvColDef } from 'dv-datagrid';
import { AgeBadgeComponent } from './age-badge.component';

columnDefs: DvColDef<Employee>[] = [
  // ── Sortable column with text filter
  { field: 'name', headerName: 'Name', sortable: true, filter: 'text' },

  // ── Number filter with fixed width
  { field: 'age', headerName: 'Age', filter: 'number', width: 80 },

  // ── Set filter — user picks any combination
  {
    field: 'department',
    headerName: 'Department',
    filter: 'set',
    filterValues: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
  },

  // ── Date filter (values expected as YYYY-MM-DD)
  { field: 'joinDate', headerName: 'Joined', filter: 'date' },

  // ── Value formatter — receives the full row object
  {
    field: 'salary',
    headerName: 'Salary',
    filter: 'number',
    valueFormatter: (row) => '$' + Number(row.salary).toLocaleString(),
  },

  // ── Static CSS class on all cells in the column
  { field: 'score', cellClass: 'text-center font-bold' },

  // ── Dynamic CSS class based on cell context
  {
    field: 'status',
    cellClass: (p) => 'status-' + p.value,
    // p: { value, row, field, rowIndex }
  },

  // ── Header tooltip: static text shown on column header hover
  { field: 'department', headerName: 'Dept', headerTooltip: 'Filter by department' },

  // ── Tooltip: shows value of another field on hover
  { field: 'name', tooltipField: 'email' },

  // ── Tooltip: computed from row data
  { field: 'age', tooltipValueGetter: (p) => 'Email: ' + p.row.email },

  // ── Component cell renderer
  {
    field: 'age',
    cellRenderer: AgeBadgeComponent,
    // Component receives: value = input(), row = input()
  },

  // ── Template cell renderer (capture ref in ngOnInit, after view is ready)
  { field: 'email', cellRenderer: this.emailTpl() },
];`,
    },

    filterTypes: {
      ts: `// ━━ Filter Type Configuration ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TEXT filter — operators: 'ctns' | 'eq' | 'sw' | 'ew'
{ field: 'name', filter: 'text' }

// NUMBER filter — operators: 'eq' | '>' | '<' | 'btw'
{ field: 'salary', filter: 'number' }

// DATE filter  — operators: 'eq' | 'before' | 'after' | 'btw'
//                           values in YYYY-MM-DD format
{ field: 'joinDate', filter: 'date' }

// SET filter   — user checks any combination from the list
{ field: 'department', filter: 'set', filterValues: ['Eng', 'HR', 'Sales'] }


// ━━ Programmatic API ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

api.setColumnFilter('name',       { type: 'text',   operator: 'ctns', value: 'alice' });
api.setColumnFilter('salary',     { type: 'number', operator: '>',    value: 80000 });
api.setColumnFilter('joinDate',   { type: 'date',   operator: 'after', value: '2022-01-01' });
api.setColumnFilter('department', { type: 'set',    values: ['Engineering', 'HR'] });
api.clearColumnFilter('salary');
api.resetFilters();


// ━━ Server-side Filter Handling ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onServerDataRequested(params: ServerRequestParams): void {
  let data = [...allData];

  for (const [field, filter] of Object.entries(params.filterModel)) {
    data = data.filter(row => {
      const val = row[field];
      switch (filter.type) {
        case 'text': {
          const v = String(val).toLowerCase();
          const f = String(filter.value).toLowerCase();
          if (filter.operator === 'ctns') return v.includes(f);
          if (filter.operator === 'eq')   return v === f;
          if (filter.operator === 'sw')   return v.startsWith(f);
          if (filter.operator === 'ew')   return v.endsWith(f);
          break;
        }
        case 'number': {
          const n = Number(val);
          if (filter.operator === 'eq')  return n === filter.value;
          if (filter.operator === '>')   return n > filter.value;
          if (filter.operator === '<')   return n < filter.value;
          if (filter.operator === 'btw') return n >= filter.value && n <= filter.valueTo;
          break;
        }
        case 'date': {
          // YYYY-MM-DD strings compare lexicographically — works correctly
          const d = String(val);
          if (filter.operator === 'eq')     return d === filter.value;
          if (filter.operator === 'before') return d <  filter.value;
          if (filter.operator === 'after')  return d >  filter.value;
          if (filter.operator === 'btw')    return d >= filter.value && d <= filter.valueTo;
          break;
        }
        case 'set': return filter.values.includes(val);
      }
      return true;
    });
  }

  const start = (params.page - 1) * params.pageSize;
  this.api.setServerData(data.slice(start, start + params.pageSize), data.length);
}`,
    },

    cellRenderers: {
      ts: `// ━━ Component Cell Renderer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Component, computed, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-age-badge',
  template: '<span class="badge" [class]="cls()">{{ value() }}</span>',
  styles: ['.badge { padding: 2px 10px; border-radius: 12px; font-weight: 600; }'],
})
export class AgeBadgeComponent {
  readonly value = input<number>(0);  // receives the cell value
  readonly row   = input<any>();      // receives the full row object

  readonly cls = computed(() => {
    const age = this.value();
    if (age < 30) return 'badge-green';
    if (age < 50) return 'badge-yellow';
    return 'badge-red';
  });
}

// Attach to column:
{ field: 'age', cellRenderer: AgeBadgeComponent }

// Pass extra params (available via cellRendererParams on the component):
{
  field: 'score',
  cellRenderer: ScoreBarComponent,
  cellRendererParams: { max: 100, color: '#3b82f6' },
}


// ━━ Template Cell Renderer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Capture template ref in ngOnInit (view children are ready):
readonly emailTpl = viewChild.required<TemplateRef<any>>('emailTpl');

ngOnInit(): void {
  this.columnDefs = [
    { field: 'email', cellRenderer: this.emailTpl() },
  ];
}`,
      html: `<!-- Declare template anywhere in the component's template -->
<ng-template #emailTpl
  let-value
  let-row="row"
  let-rowIndex="rowIndex">

  <a [href]="'mailto:' + value" class="email-link">
    {{ value }}
  </a>
</ng-template>

<!-- The grid picks it up via the column def -->
<dv-datagrid [columnDefs]="columnDefs" [options]="opts" ... />`,
    },

    rowExpansion: {
      ts: `// 1. Enable in grid options
gridOptions: DvGridOptions = {
  rowExpansion: { enabled: true },
};

// 2. Capture the detail template ref
readonly detailTpl = viewChild.required<TemplateRef<any>>('detailTpl');

// 3. Bind to [detailTemplate] on the grid (see HTML tab)

// ── Context available in the template ─────────────────────────
// let-row        → the full row object
// let-rowIndex   → row index on the current page`,
      html: `<dv-datagrid
  [columnDefs]="columnDefs"
  [options]="gridOptions"
  [detailTemplate]="detailTpl"
  (serverDataRequested)="onData($event)"
  (gridReady)="onReady($event)"
/>

<!-- Expansion panel template -->
<ng-template #detailTpl let-row let-rowIndex="rowIndex">
  <div class="detail-panel">

    <!-- Simple field display -->
    <div class="info-row">
      <span>Phone</span>
      <strong>{{ row.phone }}</strong>
    </div>

    <!-- Nested collection -->
    <h4>Orders ({{ row.orders.length }})</h4>
    <table>
      <thead>
        <tr><th>Product</th><th>Amount</th><th>Status</th></tr>
      </thead>
      <tbody>
        @for (order of row.orders; track order.orderId) {
          <tr>
            <td>{{ order.product }}</td>
            <td>{{ order.amount | number:'1.2-2' }}</td>
            <td>
              <span class="badge" [class]="'badge-' + order.status">
                {{ order.status }}
              </span>
            </td>
          </tr>
        }
      </tbody>
    </table>

  </div>
</ng-template>`,
    },

    gridApi: {
      ts: `// ━━ Obtain API reference ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

private api!: DvGridApi;

onGridReady(api: DvGridApi): void {
  this.api = api;  // emitted once on grid initialization
}


// ━━ Read-only reactive signals ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.rowData();          // Signal<T[]>        current page rows
this.api.totalRecords();     // Signal<number>      total rows across all pages
this.api.currentPage();      // Signal<number>      current page (1-indexed)
this.api.totalPages();       // Signal<number>
this.api.pageSize();         // Signal<number>
this.api.isLoading();        // Signal<boolean>
this.api.sortModel();        // Signal<SortItem[]>
this.api.filterModel();      // Signal<FilterModel> Record<field, FilterInstance>
this.api.selectedRowIds();   // Signal<Set<any>>


// ━━ Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.setServerData(pageRows, totalCount);  // push fetched data
this.api.refreshServerData();                  // re-emit serverDataRequested


// ━━ Pagination ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.setPage(3);
this.api.setPageSize(50);


// ━━ Filtering ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.setColumnFilter('name',   { type: 'text',   operator: 'ctns', value: 'alice' });
this.api.setColumnFilter('salary', { type: 'number', operator: '>',    value: 75000 });
this.api.clearColumnFilter('name');
this.api.resetFilters();


// ━━ Sorting ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.resetSort();


// ━━ Selection ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.selectAll([1, 2, 3]);         // select rows by their ID
this.api.selectRow(5);
this.api.deselectRow(5);
this.api.toggleRowSelection(5);
this.api.deselectAll();                // same as: clearSelection()
this.api.isRowSelected(5);             // → boolean
this.api.selectedRowIds();             // → Signal<Set<any>>


// ━━ Reset ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

this.api.resetAll();   // clears filters + sort, navigates to page 1`,
    },

    columnResize: {
      ts: `// ── Enable globally via DvGridOptions ──────────────────────
gridOptions: DvGridOptions = {
  enableColumnResize: true,
};

// ── Opt individual columns out with resizable: false ───────
columnDefs: DvColDef<Employee>[] = [
  { field: 'id',   width: 60, resizable: false }, // fixed — no handle
  { field: 'name', sortable: true, filter: 'text' }, // resizable (default)
  { field: 'email', minWidth: 120 },  // resizable, but never narrower than 120px
];

// ── Per-column resizable flag summary ──────────────────────
// resizable: undefined  → follows enableColumnResize option
// resizable: true       → always resizable (even if option is false)
// resizable: false      → never resizable`,
    },

    themes: {
      ts: `import { EN_LOCALE, UK_LOCALE, DvGridLocale } from 'dv-datagrid';

// ━━ Built-in themes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gridOptions: DvGridOptions = {
  theme: 'alpine',    // 'alpine' | 'material' | 'dark' | 'custom'
};


// ━━ Locale (i18n) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gridOptions: DvGridOptions = {
  locale: EN_LOCALE,   // English (default when omitted)
  // locale: UK_LOCALE, // Ukrainian
};

// Partial override — only change specific strings:
gridOptions: DvGridOptions = {
  locale: { ...EN_LOCALE, loading: 'Fetching...', noData: 'No results found' },
};


// ━━ Custom theme via CSS variables ━━━━━━━━━━━━━━━━━━━━━━━━━━

// Set theme: 'custom' and override CSS variables on the component host:

/* In your stylesheet: */
dv-datagrid {
  --header-bg:          #1e293b;
  --header-color:       #f1f5f9;
  --accent-color:       #7c3aed;
  --row-hover-bg:       #f8f5ff;
  --selected-row-bg:    #ede9fe;
  --selected-row-color: #1e0553;
  --border-color:       #ddd6fe;
}


// ━━ Tooltip delay ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gridOptions: DvGridOptions = {
  tooltipShowDelay: 300,  // milliseconds — default: 500
};


// ━━ Locale interface (DvGridLocale) ━━━━━━━━━━━━━━━━━━━━━━━━━

interface DvGridLocale {
  // Grid
  loading: string;          noData: string;    filterButtonTitle: string;
  // Filter menu
  filterMenuTitle: string;  operator: string;  value: string;
  to: string;               clearFilter: string; applyFilter: string;
  // Text operators
  textContains: string;     textEquals: string;
  textStartsWith: string;   textEndsWith: string;
  // Number operators
  numberEquals: string;     numberGreaterThan: string;
  numberLessThan: string;   numberBetween: string;
  // Date operators
  dateEquals: string;       dateBefore: string;
  dateAfter: string;        dateBetween: string;
  // Pagination
  rowsPerPage: string;      of: string;        noRecords: string;
  firstPage: string;        previousPage: string;
  nextPage: string;         lastPage: string;
}`,
    },
    headerTemplate: {
      ts: `// Capture the template ref after view init
readonly headerTpl = viewChild.required<TemplateRef<any>>('headerTpl');

// Optional: drive a search input from the toolbar
readonly nameSearch = signal('');

onNameSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.nameSearch.set(value);
  if (value) {
    this.api.setColumnFilter('name', { type: 'text', operator: 'ctns', value });
  } else {
    this.api.clearColumnFilter('name');
  }
}`,
      html: `<!-- Pass the template to the grid -->
<dv-datagrid
  [columnDefs]="columnDefs"
  [options]="gridOptions"
  [headerTemplate]="headerTpl"
  (serverDataRequested)="onData($event)"
  (gridReady)="onReady($event)"
/>

<!-- Toolbar template — rendered above the table -->
<ng-template #headerTpl>
  <span class="toolbar-title">Employees</span>

  <!-- Search input wired to a text filter via the Grid API -->
  <input
    class="toolbar-search"
    type="text"
    placeholder="Search by name…"
    [value]="nameSearch()"
    (input)="onNameSearch($event)"
  />

  <div style="flex:1"></div>

  <button (click)="api.selectAll(pageIds)">Select Page</button>
  <button (click)="api.clearSelection()">Clear Selection</button>
  <button (click)="api.resetAll()">Reset All</button>
</ng-template>`,
    },
  };

  // ─── Lifecycle ───────────────────────────────────────────────

  ngOnInit(): void {
    this.columnDefs = [
      {
        field: 'id',
        headerName: '#',
        sortable: true,
        width: 60,
        filter: 'number',
      },
      {
        field: 'name',
        headerName: 'Name',
        sortable: true,
        filter: 'text',
        tooltipField: 'email'
      },
      {
        field: 'department',
        headerName: 'Department',
        sortable: true,
        filter: 'set',
        filterValues: DEPARTMENTS,
        width: 130,
        headerTooltip: 'Filter by department',
      },
      {
        field: 'role',
        headerName: 'Role',
        sortable: true,
        filter: 'text',
        width: 110,
        headerTooltip: 'Job title / position',
      },
      {
        field: 'age',
        headerName: 'Age',
        sortable: true,
        width: 80,
        filter: 'number',
        cellRenderer: AgeCellComponent,
        tooltipValueGetter: (p) => `${p.row.name} · ${p.row.email}`,
      },
      {
        field: 'salary',
        headerName: 'Salary',
        sortable: true,
        filter: 'number',
        width: 120,
        valueFormatter: (row:Employee) => '$' + Number(row.salary).toLocaleString(),
      },
      {
        field: 'status',
        headerName: 'Status',
        sortable: false,
        filter: 'set',
        filterValues: ['active', 'inactive', 'onLeave'],
        width: 110,
        cellRenderer: StatusCellComponent,
      },
      {
        field: 'joinDate',
        headerName: 'Join Date',
        sortable: true,
        filter: 'date',
        width: 110,
        valueFormatter: (row:Employee) =>
          new Date(row.joinDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
      },
      {
        field: 'email',
        headerName: 'Email',
        sortable: false,
        filter: 'text',
        cellRenderer: this.emailTpl(),
      },
    ];
  }

  // ─── Event handlers ──────────────────────────────────────────

  onGridReady(api: DvGridApi): void {
    this._gridApi.set(api);
  }

  onRowClick(event: DvRowClickEvent<Employee>): void {
    this.lastClickedRow.set(event.row.name);
  }

  onSelectionChanged(_ids: any[]): void {
    // selectedCount is derived reactively from _gridApi signal
  }

  onServerDataRequested(params: ServerRequestParams): void {
    setTimeout(() => {
      let data = [...this.allData];
            // Apply filters
      for (const field of Object.keys(params.filterModel)) {
        const filter = params.filterModel[field] as FilterInstance;
        data = data.filter((row: any) => {
          const value = row[field];
          switch (filter.type) {
            case 'text': {
              const v = String(value).toLowerCase();
              const f = String(filter.value).toLowerCase();
              switch (filter.operator) {
                case 'ctns':
                  return v.includes(f);
                case 'eq':
                  return v === f;
                case 'sw':
                  return v.startsWith(f);
                case 'ew':
                  return v.endsWith(f);
              }
              return true;
            }
            case 'number': {
              const n = Number(value);
              switch (filter.operator) {
                case 'eq':
                  return n === filter.value;
                case '>':
                  return n > (filter.value ?? 0);
                case '<':
                  return n < (filter.value ?? 0);
                case 'btw':
                  return n >= (filter.value ?? 0) && n <= (filter.valueTo ?? 0);
              }
              return true;
            }
            case 'date': {
              const d = String(value);
              const from = filter.value ?? '';
              const to = filter.valueTo ?? '';
              switch (filter.operator) {
                case 'eq':
                  return d === from;
                case 'before':
                  return from ? d < from : true;
                case 'after':
                  return from ? d > from : true;
                case 'btw':
                  return from && to ? d >= from && d <= to : true;
              }
              return true;
            }
            case 'set':
              return filter.values.includes(value);
            default:
              return true;
          }
        });
      }

      // Apply sort
      if (params.sortModel.length > 0) {
        const { colId, sort } = params.sortModel[0];
        data.sort((a: any, b: any) => {
          const aVal = a[colId];
          const bVal = b[colId];
          if (aVal < bVal) return sort === 'asc' ? -1 : 1;
          if (aVal > bVal) return sort === 'asc' ? 1 : -1;
          return 0;
        });
      }

      const start = (params.page - 1) * params.pageSize;
      this._gridApi()?.setServerData(data.slice(start, start + params.pageSize), data.length);
    }, 180);
  }

  // ─── API action helpers ───────────────────────────────────────

  onNameSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.nameSearch.set(value);
    const api = this._gridApi();
    if (!api) return;
    if (value) {
      api.setColumnFilter('name', { type: 'text', operator: 'ctns', value });
    } else {
      api.clearColumnFilter('name');
    }
  }

  selectAllOnPage(): void {
    const api = this._gridApi();
    if (!api) return;
    const rows = api.rowData() as Employee[];
    api.selectAll(rows.map((r) => r.id));
  }

  clearSelection(): void {
    this._gridApi()?.clearSelection();
  }

  resetAll(): void {
    this._gridApi()?.resetAll();
  }

  refreshData(): void {
    this._gridApi()?.refreshServerData();
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.currentCode()).then(() => {
      this.copiedCode.set(true);
      setTimeout(() => this.copiedCode.set(false), 2000);
    });
  }

  setExample(key: string): void {
    this.activeExample.set(key);
    this.activeLang.set('ts');
  }

  // ─── Detail panel helper ─────────────────────────────────────

  orderTotal(orders: Order[]): number {
    return Math.round(orders.reduce((sum, o) => sum + o.amount, 0) * 100) / 100;
  }
}
