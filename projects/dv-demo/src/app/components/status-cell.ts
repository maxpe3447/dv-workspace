import { Component, computed, input } from '@angular/core';

const LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  onLeave: 'On Leave',
};

@Component({
  selector: 'app-status-cell',
  template: `<span class="status-chip" [class]="cls()">{{ label() }}</span>`,
  styles: [`
    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-active   { background: #dcfce7; color: #15803d; }
    .status-inactive { background: #f1f5f9; color: #64748b; }
    .status-onLeave  { background: #fef3c7; color: #b45309; }
  `],
})
export class StatusCellComponent {
  readonly value = input<string>('');
  readonly row = input<any>();
  readonly label = computed(() => LABELS[this.value()] ?? this.value());
  readonly cls = computed(() => 'status-' + this.value());
}
