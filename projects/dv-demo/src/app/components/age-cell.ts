import { Component, input } from '@angular/core';

@Component({
  selector: 'app-age-cell',
  template: `
    <span class="age-badge" [class]="badgeClass()">{{ value() }}</span>
  `,
  styles: `
    .age-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .age-young { background: #d4edda; color: #155724; }
    .age-mid { background: #fff3cd; color: #856404; }
    .age-senior { background: #f8d7da; color: #721c24; }
  `,
})
export class AgeCellComponent {
  readonly value = input<number>(0);
  readonly row = input<any>();

  badgeClass() {
    const age = this.value();
    if (age < 30) return 'age-young';
    if (age < 50) return 'age-mid';
    return 'age-senior';
  }
}
