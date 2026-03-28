# dv-datagrid

A feature-rich Angular data grid library built with signals and standalone components.

**[Live Demo →](https://maxpe3447.github.io/dv-workspace/)**

## Features

- Server-side data model (sorting, filtering, pagination driven by your API)
- Column sorting (single column)
- Column filtering — text, number, date, set
- Pagination with configurable page sizes
- Row selection — single and multi mode with checkboxes
- Expandable rows with custom detail templates
- Cell tooltips — field-based or computed
- Custom cell renderers — Angular components or `TemplateRef`
- Cell value formatters and CSS class callbacks
- Localization — built-in English and Ukrainian, fully customizable
- Themes — alpine, material, dark, custom
- Generic row typing — `DvDataGrid<T>` for type-safe column definitions

---

## Installation

```bash
npm install dv-datagrid
```

Build the library locally if working in the monorepo:

```bash
ng build dv-datagrid
```

---

## Quick start

**app.ts**
```ts
import { Component } from '@angular/core';
import { DvColDef, DvDataGrid, DvGridApi, DvGridOptions, ServerRequestParams } from 'dv-datagrid';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-root',
  imports: [DvDataGrid],
  template: `
    <dv-datagrid
      [columnDefs]="columnDefs"
      [options]="options"
      (gridReady)="onGridReady($event)"
      (serverDataRequested)="onServerDataRequested($event)"
    />
  `,
})
export class AppComponent {
  columnDefs: DvColDef<User>[] = [
    { field: 'id',    headerName: 'ID',    sortable: true, width: 80 },
    { field: 'name',  headerName: 'Name',  sortable: true, filter: 'text' },
    { field: 'email', headerName: 'Email', sortable: false, filter: 'text' },
  ];

  options: DvGridOptions = {
    pagination: true,
    paginationPageSize: 20,
  };

  private api!: DvGridApi;

  onGridReady(api: DvGridApi) {
    this.api = api;
  }

  onServerDataRequested(params: ServerRequestParams) {
    // fetch from your API and call:
    this.api.setServerData(rows, totalCount);
  }
}
```

---

## Component inputs & outputs

```html
<dv-datagrid
  [columnDefs]="columnDefs"
  [options]="options"
  [detailTemplate]="myDetailTpl"
  (gridReady)="onGridReady($event)"
  (serverDataRequested)="onServerDataRequested($event)"
  (selectionChanged)="onSelectionChanged($event)"
/>
```

| Input / Output | Type | Description |
|---|---|---|
| `[columnDefs]` | `DvColDef<T>[]` | Column definitions |
| `[options]` | `DvGridOptions` | Grid configuration |
| `[detailTemplate]` | `TemplateRef<{ $implicit: T; rowIndex: number }>` | Template for expandable row detail |
| `(gridReady)` | `DvGridApi` | Fires once on init; provides the API handle |
| `(serverDataRequested)` | `ServerRequestParams` | Fires on every sort / filter / page change |
| `(selectionChanged)` | `any[]` | Selected row IDs when selection changes |

---

## DvGridOptions

```ts
interface DvGridOptions {
  // Pagination
  pagination?: boolean;               // default true
  paginationPageSize?: number;        // default 20
  paginationPageSizeOptions?: number[]; // default [10, 20, 50, 100]

  // Theme
  theme?: 'alpine' | 'material' | 'dark' | 'custom';

  // Selection
  rowSelection?: 'single' | 'multi';
  getRowId?: (row: any) => any;       // defaults to row.id then index

  // Row expansion
  rowExpansion?: { enabled: boolean };

  // Tooltip
  tooltipShowDelay?: number;          // ms, default 500

  // Localization
  locale?: Partial<GridLocale>;

  // Other
  rowModelType?: 'serverSide';
  enableColumnResize?: boolean;
}
```

### Example

```ts
options: DvGridOptions = {
  pagination: true,
  paginationPageSize: 25,
  paginationPageSizeOptions: [10, 25, 100],
  theme: 'alpine',
  rowSelection: 'multi',
  getRowId: (row) => row.id,
  rowExpansion: { enabled: true },
  tooltipShowDelay: 300,
  locale: UK_LOCALE,
};
```

---

## DvColDef

```ts
interface DvColDef<T = any> {
  field: string;                      // dot-notation supported: 'address.city'
  headerName?: string;                // column header label
  sortable?: boolean;                 // default true
  width?: number;                     // fixed column width in px

  // Filtering
  filter?: boolean | 'text' | 'number' | 'date' | 'set';
  filterValues?: any[];               // required for 'set' filter

  // Cell content
  valueFormatter?: (row: T) => any;
  cellRenderer?: Type<any> | TemplateRef<any>;
  cellRendererParams?: Record<string, any>;

  // Cell styling
  cellClass?: string | ((params: CellClassParams<T>) => string);

  // Tooltip
  tooltipField?: string;
  tooltipValueGetter?: (params: CellClassParams<T>) => string;
}

interface CellClassParams<T> {
  value: any;   // cell value
  row: T;       // full row object
  field: string;
  rowIndex: number;
}
```

---

## Sorting

Enable sorting per column with `sortable: true` (the default). Clicking a header cycles through `asc → desc → unsorted`. Only one column can be sorted at a time.

```ts
columnDefs: DvColDef<Product>[] = [
  { field: 'name',  sortable: true },
  { field: 'price', sortable: true },
  { field: 'sku',   sortable: false }, // not sortable
];
```

The current sort state arrives in `ServerRequestParams`:

```ts
onServerDataRequested(params: ServerRequestParams) {
  const { colId, sort } = params.sortModel[0] ?? {};
  // sort === 'asc' | 'desc'
}
```

---

## Filtering

Set `filter` on a column to enable filtering. A filter icon appears in the header and opens a dropdown.

### Filter types

| Value | UI |
|---|---|
| `'text'` | Operator (contains / equals / starts with / ends with) + text input |
| `'number'` | Operator (equals / greater than / less than / between) + number input |
| `'date'` | Operator (equals / before / after / between) + date picker |
| `'set'` | Checkbox list of values supplied via `filterValues` |
| `true` | Shorthand for `'text'` |

```ts
columnDefs: DvColDef<Order>[] = [
  { field: 'reference', filter: 'text' },
  { field: 'amount',    filter: 'number' },
  { field: 'createdAt', filter: 'date' },
  {
    field: 'status',
    filter: 'set',
    filterValues: ['pending', 'completed', 'cancelled'],
  },
];
```

The active filters arrive in `ServerRequestParams.filterModel`:

```ts
onServerDataRequested(params: ServerRequestParams) {
  for (const [field, filter] of Object.entries(params.filterModel)) {
    switch (filter.type) {
      case 'text':
        // filter.operator: 'ctns' | 'eq' | 'sw' | 'ew'
        // filter.value: string
        break;
      case 'number':
        // filter.operator: 'eq' | '>' | '<' | 'btw'
        // filter.value: number
        // filter.valueTo?: number  (for 'btw')
        break;
      case 'date':
        // filter.operator: 'eq' | 'before' | 'after' | 'btw'
        // filter.value: string  (ISO date)
        // filter.valueTo?: string  (for 'btw')
        break;
      case 'set':
        // filter.values: any[]
        break;
    }
  }
}
```

---

## Pagination

Pagination is enabled by default. The grid emits `serverDataRequested` with the current `page` and `pageSize` whenever the user navigates.

```ts
options: DvGridOptions = {
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeOptions: [10, 20, 50, 100],
};
```

Apply it server-side:

```ts
onServerDataRequested(params: ServerRequestParams) {
  const { page, pageSize } = params;
  const start = (page - 1) * pageSize;
  const slice = allData.slice(start, start + pageSize);
  this.api.setServerData(slice, allData.length);
}
```

Programmatic navigation via the API:

```ts
this.api.setPage(3);
this.api.setPageSize(50);
```

---

## Row selection

### Single

Click a row to select it; click again to deselect.

```ts
options: DvGridOptions = {
  rowSelection: 'single',
  getRowId: (row) => row.id,
};
```

### Multi

A checkbox column is added automatically. Click a row or its checkbox to toggle it. The header checkbox selects / deselects the current page.

```ts
options: DvGridOptions = {
  rowSelection: 'multi',
  getRowId: (row) => row.id,
};
```

### Selection output

```html
<dv-datagrid (selectionChanged)="onSelectionChanged($event)" />
```

```ts
onSelectionChanged(ids: any[]) {
  console.log('Selected IDs:', ids);
}
```

### Selection API

```ts
this.api.selectRow(id);
this.api.deselectRow(id);
this.api.toggleRowSelection(id);
this.api.selectAll([id1, id2, id3]);
this.api.clearSelection();
this.api.isRowSelected(id); // boolean
// reactive
this.api.selectedRowIds(); // Signal<Set<any>>
```

---

## Expandable rows

Enable row expansion to let users expand a row and reveal a custom detail panel below it.

### Setup

```ts
options: DvGridOptions = {
  rowExpansion: { enabled: true },
  getRowId: (row) => row.id,
};
```

```html
<dv-datagrid
  [options]="options"
  [columnDefs]="columnDefs"
  [detailTemplate]="detailTpl"
/>

<ng-template #detailTpl let-row let-rowIndex="rowIndex">
  <div style="padding: 16px">
    <p>Details for {{ row.name }}</p>
    <p>Row index: {{ rowIndex }}</p>
  </div>
</ng-template>
```

In the component, expose the template ref:

```ts
import { viewChild, TemplateRef } from '@angular/core';

readonly detailTpl = viewChild.required<TemplateRef<any>>('detailTpl');
```

### Detail template context

| Variable | Type | Description |
|---|---|---|
| `let-row` (`$implicit`) | `T` | The full row object |
| `let-rowIndex="rowIndex"` | `number` | Zero-based index of the row on the current page |

### Nested grid example

```html
<ng-template #detailTpl let-row>
  <div style="padding: 12px 16px">
    <dv-datagrid
      [columnDefs]="orderColumns"
      [options]="orderOptions"
      (serverDataRequested)="loadOrders(row.id, $event)"
      (gridReady)="onOrderGridReady(row.id, $event)"
    />
  </div>
</ng-template>
```

---

## Column resizing

Enable interactive column resizing by dragging the handle on the right edge of any header cell.

```ts
options: DvGridOptions = {
  enableColumnResize: true,
};
```

Columns are resizable by default when the option is enabled. Opt individual columns out with `resizable: false`:

```ts
columnDefs: DvColDef<Order>[] = [
  { field: 'id',    width: 60,  resizable: false }, // fixed width, no handle
  { field: 'email' },                               // resizable (default)
];
```

| Property | Type | Description |
|---|---|---|
| `enableColumnResize` (options) | `boolean` | Enable resize handles on all columns (default: `false`) |
| `resizable` (colDef) | `boolean` | Per-column override — opt in/out regardless of global option |

---

## Cell renderers

### Component renderer

Create a standalone Angular component with `value` and `row` inputs:

```ts
@Component({
  selector: 'app-status-cell',
  standalone: true,
  template: `
    <span [class]="'badge badge-' + value">{{ value }}</span>
  `,
})
export class StatusCellComponent {
  readonly value = input<string>('');
  readonly row   = input<any>(null);
}
```

Register it on the column:

```ts
{ field: 'status', cellRenderer: StatusCellComponent }
```

Pass extra data with `cellRendererParams`:

```ts
{
  field: 'price',
  cellRenderer: PriceCellComponent,
  cellRendererParams: { currency: 'USD' },
}
```

Inside the component, access params via the `input`:

```ts
readonly currency = input<string>('USD');  // from cellRendererParams
```

### TemplateRef renderer

Declare a template in the same component and pass it via `viewChild`:

```ts
readonly statusTpl = viewChild.required<TemplateRef<any>>('statusTpl');

ngOnInit() {
  this.columnDefs = [
    { field: 'status', cellRenderer: this.statusTpl() },
  ];
}
```

```html
<ng-template #statusTpl let-value let-row="row" let-rowIndex="rowIndex">
  <span [style.color]="value === 'active' ? 'green' : 'red'">
    {{ value }}
  </span>
</ng-template>
```

Template context variables:

| Variable | Description |
|---|---|
| `let-value` (`$implicit`) | Formatted cell value |
| `let-row="row"` | Full row object |
| `let-field="field"` | Column field name |
| `let-rowIndex="rowIndex"` | Row index on the current page |
| `let-params="params"` | Value of `cellRendererParams` |

### Value formatter

For simple display-only transformations:

```ts
{ field: 'amount', valueFormatter: (row) => `$${row.amount.toFixed(2)}` }
```

---

## Tooltips

Add a tooltip to any column via `tooltipField` or `tooltipValueGetter`.

### Field-based tooltip

Displays the value of another field as the tooltip:

```ts
{ field: 'name', tooltipField: 'fullName' }
```

### Computed tooltip

Full control over the tooltip string:

```ts
{
  field: 'status',
  tooltipValueGetter: (p) => `Last updated: ${p.row.updatedAt}`,
}
```

`p` is a `CellClassParams<T>` with `value`, `row`, `field`, and `rowIndex`.

### Delay

```ts
options: DvGridOptions = {
  tooltipShowDelay: 300, // ms, default 500
};
```

---

## Cell classes

Apply a static or dynamic CSS class to cells:

```ts
// static
{ field: 'amount', cellClass: 'text-right' }

// dynamic
{
  field: 'balance',
  cellClass: (p) => p.value < 0 ? 'negative' : 'positive',
}
```

---

## DvGridApi reference

Obtain the API handle from the `gridReady` output:

```ts
private api!: DvGridApi;

onGridReady(api: DvGridApi) {
  this.api = api;
}
```

### Data

| Method | Description |
|---|---|
| `setServerData(rows, total)` | Feed a page of rows and the total record count |
| `refreshServerData()` | Re-emit `serverDataRequested` with current params |

### Reactive state (signals)

| Signal | Type | Description |
|---|---|---|
| `rowData` | `Signal<any[]>` | Current page rows |
| `isLoading` | `Signal<boolean>` | True while waiting for data |
| `sortModel` | `Signal<SortItem[]>` | Active sort |
| `filterModel` | `Signal<FilterModel>` | Active filters |
| `currentPage` | `Signal<number>` | Current page number |
| `pageSize` | `Signal<number>` | Rows per page |
| `totalRecords` | `Signal<number>` | Total records across all pages |
| `totalPages` | `Signal<number>` | Computed total pages |
| `selectedRowIds` | `Signal<Set<any>>` | Currently selected row IDs |

### Pagination

| Method | Description |
|---|---|
| `setPage(page)` | Navigate to a specific page |
| `setPageSize(size)` | Change rows per page (resets to page 1) |

### Filtering

| Method | Description |
|---|---|
| `setColumnFilter(field, filter)` | Apply a filter programmatically |
| `clearColumnFilter(field)` | Remove a specific column filter |
| `resetFilters()` | Clear all filters |

### Sorting

| Method | Description |
|---|---|
| `resetSort()` | Clear active sort |

### Selection

| Method | Description |
|---|---|
| `selectRow(id)` | Select a row by ID |
| `deselectRow(id)` | Deselect a row by ID |
| `toggleRowSelection(id)` | Toggle selection |
| `selectAll(ids)` | Select multiple rows |
| `clearSelection()` | Clear all selections |
| `isRowSelected(id)` | Returns `boolean` |

### Reset

| Method | Description |
|---|---|
| `resetAll()` | Clear sort, filters, go to page 1, reload |

---

## ServerRequestParams

Emitted by `serverDataRequested` on every sort / filter / page change.

```ts
interface ServerRequestParams {
  page: number;
  pageSize: number;
  sortModel: SortItem[];      // max 1 item currently
  filterModel: FilterModel;   // Record<field, FilterInstance>
}
```

Typical handler:

```ts
onServerDataRequested(params: ServerRequestParams) {
  this.myService
    .getUsers(params)
    .subscribe(({ rows, total }) => {
      this.api.setServerData(rows, total);
    });
}
```

---

## Localization

Two built-in locales are provided: `EN_LOCALE` (default) and `UK_LOCALE`.

```ts
import { EN_LOCALE, UK_LOCALE } from 'dv-datagrid';

options: DvGridOptions = { locale: UK_LOCALE };
```

Override individual keys:

```ts
options: DvGridOptions = {
  locale: {
    ...EN_LOCALE,
    noData: 'Nothing here yet',
    applyFilter: 'Search',
  },
};
```

### Custom locale

Implement the full `GridLocale` interface:

```ts
import { GridLocale } from 'dv-datagrid';

const MY_LOCALE: GridLocale = {
  loading: 'Chargement...',
  noData: 'Aucune donnée',
  filterButtonTitle: 'Filtrer',
  reload: 'Recharger',
  filterMenuTitle: 'Filtrer',
  operator: 'Opérateur',
  value: 'Valeur',
  to: 'À',
  filterValuePlaceholder: 'Valeur...',
  toValuePlaceholder: 'Valeur de fin...',
  noValuesAvailable: 'Aucune valeur disponible',
  clearFilter: 'Effacer',
  applyFilter: 'Appliquer',
  textContains: 'Contient',
  textEquals: 'Égal à',
  textStartsWith: 'Commence par',
  textEndsWith: 'Se termine par',
  numberEquals: 'Égal à',
  numberGreaterThan: 'Supérieur à',
  numberLessThan: 'Inférieur à',
  numberBetween: 'Entre',
  dateEquals: 'Égal à',
  dateBefore: 'Avant',
  dateAfter: 'Après',
  dateBetween: 'Entre',
  noRecords: '0 enregistrement',
  rowsPerPage: 'Lignes :',
  of: 'sur',
  firstPage: 'Première page',
  previousPage: 'Page précédente',
  nextPage: 'Page suivante',
  lastPage: 'Dernière page',
};
```

---

## Themes

```ts
options: DvGridOptions = {
  theme: 'alpine',   // 'alpine' | 'material' | 'dark' | 'custom'
};
```

| Theme | Description |
|---|---|
| _(none)_ | Default — clean light theme |
| `alpine` | Slightly bolder borders, blue accent |
| `material` | Flat design, smaller radius |
| `dark` | Dark background, light text |
| `custom` | No overrides; style everything via CSS variables |

### CSS variables

Override any design token on the host element:

```css
dv-datagrid {
  --accent-color:      #7c3aed;
  --header-bg:         #1e1b4b;
  --header-text:       #e0e7ff;
  --header-border:     #3730a3;
  --cell-bg:           #f5f3ff;
  --cell-text:         #1e1b4b;
  --cell-border:       #ddd6fe;
  --row-hover:         #ede9fe;
  --row-selected:      #ddd6fe;
  --detail-bg:         #f5f3ff;
  --font-family:       'Inter', sans-serif;
  --font-size:         13px;
  --border-radius:     6px;
}
```

---

## Generic typing

`DvDataGrid` is generic over the row type `T`:

```ts
// Typed column definitions
columnDefs: DvColDef<User>[] = [
  {
    field: 'name',
    cellClass: (p) => p.row.isActive ? 'active' : 'inactive', // p.row is User ✓
  },
  {
    field: 'role',
    tooltipValueGetter: (p) => p.row.roleDescription,          // p.row is User ✓
  },
];
```

The component itself infers `T` from the `columnDefs` input — no explicit annotation needed in the template.

---

## Public API exports

```ts
// Components
export { DvDataGrid }         from 'dv-datagrid';
export { GridPagination }   from 'dv-datagrid';
export { GridFilterMenu }   from 'dv-datagrid';

// Models
export type {
  DvColDef, CellClassParams,
  DvGridOptions, DvGridApi,
  ServerRequestParams,
  SortItem, SortDirection,
  FilterType, FilterInstance,
  FilterModel,
  TextFilter, TextFilterOperator,
  NumberFilter, NumberFilterOperator,
  DateFilter, DateFilterOperator,
  SetFilter,
} from 'dv-datagrid';

// Localization
export type { GridLocale } from 'dv-datagrid';
export { EN_LOCALE, UK_LOCALE } from 'dv-datagrid';
```

---

## Full example

```ts
// app.ts
import { Component, TemplateRef, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  DvColDef, DvDataGrid, FilterInstance,
  DvGridApi, DvGridOptions, ServerRequestParams,
  UK_LOCALE,
} from 'dv-datagrid';
import { StatusCellComponent } from './status-cell.component';

interface Order {
  id: number;
  reference: string;
  customer: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  items: { name: string; qty: number; price: number }[];
}

@Component({
  selector: 'app-orders',
  imports: [DvDataGrid, DecimalPipe],
  templateUrl: './app.html',
})
export class OrdersComponent {
  readonly detailTpl = viewChild.required<TemplateRef<any>>('detailTpl');
  readonly refTpl    = viewChild.required<TemplateRef<any>>('refTpl');

  columnDefs: DvColDef<Order>[] = [];

  options: DvGridOptions = {
    pagination: true,
    paginationPageSize: 20,
    theme: 'alpine',
    rowSelection: 'multi',
    getRowId: (row) => row.id,
    rowExpansion: { enabled: true },
    tooltipShowDelay: 400,
    locale: UK_LOCALE,
  };

  private api!: DvGridApi;

  ngOnInit() {
    this.columnDefs = [
      {
        field: 'reference',
        headerName: 'Reference',
        sortable: true,
        filter: 'text',
        cellRenderer: this.refTpl(),
      },
      {
        field: 'customer',
        headerName: 'Customer',
        sortable: true,
        filter: 'text',
        tooltipField: 'customer',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        sortable: true,
        filter: 'number',
        valueFormatter: (row) => `$${row.amount.toFixed(2)}`,
        cellClass: (p) => p.value < 0 ? 'negative' : '',
      },
      {
        field: 'status',
        headerName: 'Status',
        filter: 'set',
        filterValues: ['pending', 'completed', 'cancelled'],
        cellRenderer: StatusCellComponent,
      },
      {
        field: 'createdAt',
        headerName: 'Date',
        sortable: true,
        filter: 'date',
      },
    ];
  }

  onGridReady(api: DvGridApi) {
    this.api = api;
  }

  onServerDataRequested(params: ServerRequestParams) {
    this.ordersService.getOrders(params).subscribe(({ rows, total }) => {
      this.api.setServerData(rows, total);
    });
  }

  onSelectionChanged(ids: any[]) {
    console.log('Selected order IDs:', ids);
  }

  itemsTotal(items: Order['items']): number {
    return items.reduce((s, i) => s + i.qty * i.price, 0);
  }
}
```

```html
<!-- app.html -->
<dv-datagrid
  [columnDefs]="columnDefs"
  [options]="options"
  [detailTemplate]="detailTpl"
  (gridReady)="onGridReady($event)"
  (serverDataRequested)="onServerDataRequested($event)"
  (selectionChanged)="onSelectionChanged($event)"
/>

<!-- Reference cell -->
<ng-template #refTpl let-value>
  <a [routerLink]="['/orders', value]">{{ value }}</a>
</ng-template>

<!-- Expandable row detail -->
<ng-template #detailTpl let-row>
  <div class="order-detail">
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      </thead>
      <tbody>
        @for (item of row.items; track item.name) {
          <tr>
            <td>{{ item.name }}</td>
            <td>{{ item.qty }}</td>
            <td>{{ item.price | number:'1.2-2' }} $</td>
            <td>{{ item.qty * item.price | number:'1.2-2' }} $</td>
          </tr>
        }
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Total</td>
          <td>{{ itemsTotal(row.items) | number:'1.2-2' }} $</td>
        </tr>
      </tfoot>
    </table>
  </div>
</ng-template>
```

---

## Development

```bash
# Build the library
ng build dv-datagrid

# Run the demo app
ng serve dv-demo

# Run tests
ng test dv-datagrid
```

---

## License

MIT © [deepvyne](https://deepvyne.com)
