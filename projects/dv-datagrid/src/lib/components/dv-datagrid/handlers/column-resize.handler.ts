import { signal } from '@angular/core';
import { DvColDef } from '../../../models/grid.model';

export class GridColumnResizeHandler {
  private resizingField: string | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private resizeDelta = 0;
  private _wasResized = false;

  readonly isResizing = signal(false);
  readonly columnWidths = signal<Map<string, number>>(new Map());

  get wasResized(): boolean { return this._wasResized; }
  clearWasResized(): void { this._wasResized = false; }

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
    this._wasResized = false;
    this.isResizing.set(true);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.resizingField) return;
    this.resizeDelta = event.clientX - this.resizeStartX;
    const newWidth = Math.max(50, this.resizeStartWidth + this.resizeDelta);
    this.columnWidths.update(map => new Map(map).set(this.resizingField!, newWidth));
  }

  onMouseUp(): void {
    if (this.resizingField) {
      this._wasResized = Math.abs(this.resizeDelta) > 3;
      this.resizingField = null;
      this.isResizing.set(false);
    }
  }

  onResizeFit(event: MouseEvent, col: DvColDef): void {
    event.stopPropagation();
    const th = (event.currentTarget as HTMLElement).closest('th') as HTMLElement;
    const table = th.closest('table') as HTMLTableElement;
    const colIndex = Array.from(th.parentElement!.children).indexOf(th);

    const probe = document.createElement('span');
    probe.style.cssText = 'position:fixed;top:0;left:0;visibility:hidden;white-space:nowrap;pointer-events:none';
    document.body.appendChild(probe);

    const measureCell = (el: HTMLElement): number => {
      const s = window.getComputedStyle(el);
      probe.style.fontFamily = s.fontFamily;
      probe.style.fontSize = s.fontSize;
      probe.style.fontWeight = s.fontWeight;
      probe.style.letterSpacing = s.letterSpacing;
      probe.textContent = el.textContent?.trim() ?? '';
      return probe.offsetWidth + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
    };

    const thStyle = window.getComputedStyle(th);
    const headerLabel = th.querySelector('.header-label') as HTMLElement | null;
    const headerActions = th.querySelector('.header-actions') as HTMLElement | null;
    const headerWidth = (headerLabel?.scrollWidth ?? 0)
      + (headerActions?.offsetWidth ?? 0)
      + 4   // flex gap
      + parseFloat(thStyle.paddingLeft)
      + parseFloat(thStyle.paddingRight)
      + 10; // extra buffer for full label visibility

    let maxWidth = headerWidth;
    table.querySelectorAll<HTMLElement>('tbody tr').forEach(row => {
      const cell = row.children[colIndex] as HTMLElement | undefined;
      if (cell) maxWidth = Math.max(maxWidth, measureCell(cell));
    });

    document.body.removeChild(probe);
    this.columnWidths.update(map => new Map(map).set(col.field, Math.ceil(maxWidth)));
  }
}
