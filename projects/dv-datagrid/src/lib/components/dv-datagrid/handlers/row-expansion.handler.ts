import { signal } from '@angular/core';

export class GridRowExpansionHandler {
  readonly expandedRowIds = signal<Set<any>>(new Set<any>());

  isExpanded(id: any): boolean {
    return this.expandedRowIds().has(id);
  }

  toggle(id: any): void {
    this.expandedRowIds.update(ids => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
