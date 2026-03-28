import { signal } from '@angular/core';

export class GridFilterMenuHandler {
  readonly openField = signal<string | null>(null);
  readonly menuPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  toggle(event: MouseEvent, field: string): void {
    event.stopPropagation();
    if (this.openField() === field) { this.openField.set(null); return; }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 240;
    let left = rect.left;
    if (left + menuWidth > window.innerWidth) left = rect.right - menuWidth;
    this.menuPos.set({ top: rect.bottom + 4, left });
    this.openField.set(field);
  }

  close(): void {
    this.openField.set(null);
  }
}
