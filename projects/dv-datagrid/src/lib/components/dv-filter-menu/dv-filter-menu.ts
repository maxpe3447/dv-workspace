import {
  Component,
  input,
  output,
  computed,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { FilterType } from '../../models/grid.model';
import {
  FilterInstance,
  TextFilterOperator,
  NumberFilterOperator,
  DateFilterOperator,
} from '../../models/filter.model';
import { EN_LOCALE, DvGridLocale } from '../../models/locale.model';

@Component({
  selector: 'dv-datagrid-filter-menu',
  templateUrl: './dv-filter-menu.html',
  styleUrl: './dv-filter-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvDataGridFilterMenu implements OnInit {
  // Inputs
  readonly filterType = input.required<FilterType>();
  readonly field = input.required<string>();
  readonly currentFilter = input<FilterInstance | null>(null);
  readonly setFilterValues = input<any[]>([]);
  readonly positionTop = input<number>(0);
  readonly positionLeft = input<number>(0);
  readonly locale = input<DvGridLocale>(EN_LOCALE);

  // Outputs
  readonly filterApplied = output<FilterInstance>();
  readonly filterCleared = output<void>();
  readonly closed = output<void>();

  // Text filter state
  readonly textOperator = signal<TextFilterOperator>('ctns');
  readonly textValue = signal<string>('');

  // Number filter state
  readonly numberOperator = signal<NumberFilterOperator>('eq');
  readonly numberValue = signal<string>('');
  readonly numberValueTo = signal<string>('');

  // Date filter state
  readonly dateOperator = signal<DateFilterOperator>('eq');
  readonly dateValue = signal<string>('');
  readonly dateValueTo = signal<string>('');

  // Set filter state
  readonly selectedSetValues = signal<Set<any>>(new Set());

  // Computed
  readonly showNumberTo = computed(() => this.numberOperator() === 'btw');
  readonly showDateTo = computed(() => this.dateOperator() === 'btw');

  readonly canApply = computed(() => {
    switch (this.filterType()) {
      case 'text':
        return this.textValue().trim().length > 0;
      case 'number':
        return (
          this.numberValue().trim().length > 0 &&
          (!this.showNumberTo() || this.numberValueTo().trim().length > 0)
        );
      case 'date':
        return this.dateValue().length > 0 && (!this.showDateTo() || this.dateValueTo().length > 0);
      case 'set':
        return this.selectedSetValues().size > 0;
      default:
        return false;
    }
  });

  // Operator options (reactive to locale)
  readonly textOperators = computed<{ value: TextFilterOperator; label: string }[]>(() => {
    const l = this.locale();
    return [
      { value: 'ctns', label: l.textContains },
      { value: 'eq', label: l.textEquals },
      { value: 'sw', label: l.textStartsWith },
      { value: 'ew', label: l.textEndsWith },
    ];
  });

  readonly numberOperators = computed<{ value: NumberFilterOperator; label: string }[]>(() => {
    const l = this.locale();
    return [
      { value: 'eq', label: l.numberEquals },
      { value: '>', label: l.numberGreaterThan },
      { value: '<', label: l.numberLessThan },
      { value: 'btw', label: l.numberBetween },
    ];
  });

  readonly dateOperators = computed<{ value: DateFilterOperator; label: string }[]>(() => {
    const l = this.locale();
    return [
      { value: 'eq', label: l.dateEquals },
      { value: 'before', label: l.dateBefore },
      { value: 'after', label: l.dateAfter },
      { value: 'btw', label: l.dateBetween },
    ];
  });

  ngOnInit(): void {
    const current = this.currentFilter();
    if (!current) return;

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
  onTextOperatorChange(event: Event): void {
    this.textOperator.set((event.target as HTMLSelectElement).value as TextFilterOperator);
  }

  onTextValueInput(event: Event): void {
    this.textValue.set((event.target as HTMLInputElement).value);
  }

  // Number handlers
  onNumberOperatorChange(event: Event): void {
    this.numberOperator.set((event.target as HTMLSelectElement).value as NumberFilterOperator);
  }

  onNumberValueInput(event: Event): void {
    this.numberValue.set((event.target as HTMLInputElement).value);
  }

  onNumberValueToInput(event: Event): void {
    this.numberValueTo.set((event.target as HTMLInputElement).value);
  }

  // Date handlers
  onDateOperatorChange(event: Event): void {
    this.dateOperator.set((event.target as HTMLSelectElement).value as DateFilterOperator);
  }

  onDateValueInput(event: Event): void {
    this.dateValue.set((event.target as HTMLInputElement).value);
  }

  onDateValueToInput(event: Event): void {
    this.dateValueTo.set((event.target as HTMLInputElement).value);
  }

  // Set handlers
  toggleSetValue(value: any): void {
    this.selectedSetValues.update((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  isSetValueSelected(value: any): boolean {
    return this.selectedSetValues().has(value);
  }

  // Actions
  apply(): void {
    if (!this.canApply()) return;

    let filter: FilterInstance;
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

  clear(): void {
    this.filterCleared.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closed.emit();
  }
}
