import { signal } from '@angular/core';
import { DvColDef } from '../../../models/grid.model';

export class GridTooltipHandler {
  readonly tooltipText = signal<string | null>(null);
  readonly tooltipPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  private timer: ReturnType<typeof setTimeout> | null = null;

  private getTooltipText<T>(
    col: DvColDef<T>,
    row: T,
    index: number,
    getValue: (row: T, field: string) => any
  ): string | null {
    if (col.tooltipValueGetter) {
      return col.tooltipValueGetter({ value: getValue(row, col.field), row, field: col.field, rowIndex: index });
    }
    if (col.tooltipField) {
      const val = getValue(row, col.tooltipField);
      return val != null ? String(val) : null;
    }
    return null;
  }

  onCellMouseEnter<T>(
    event: MouseEvent,
    col: DvColDef<T>,
    row: T,
    index: number,
    delay: number,
    getValue: (row: T, field: string) => any
  ): void {
    const text = this.getTooltipText(col, row, index, getValue);
    if (!text) return;
    const el = event.currentTarget as HTMLElement;
    this.timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const tooltipWidth = 280;
      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth) left = rect.right - tooltipWidth;
      this.tooltipPos.set({ top: rect.bottom + 6, left });
      this.tooltipText.set(text);
    }, delay);
  }

  onHeaderMouseEnter(event: MouseEvent, text: string, delay: number): void {
    if (!text) return;
    const el = event.currentTarget as HTMLElement;
    this.timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const tooltipWidth = 280;
      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth) left = rect.right - tooltipWidth;
      this.tooltipPos.set({ top: rect.bottom + 6, left });
      this.tooltipText.set(text);
    }, delay);
  }

  onCellMouseLeave(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.tooltipText.set(null);
  }

  destroy(): void {
    if (this.timer !== null) clearTimeout(this.timer);
  }
}
