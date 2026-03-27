import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { EN_LOCALE, DvGridLocale } from '../../models/locale.model';

@Component({
  selector: 'dv-datagrid-pagination',
  templateUrl: './dv-pagination.html',
  styleUrl: './dv-pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvDataGridPagination {
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalRecords = input.required<number>();
  readonly pageSizeOptions = input<number[]>([10, 20, 50, 100]);
  readonly locale = input<DvGridLocale>(EN_LOCALE);

  readonly pageChanged = output<number>();
  readonly pageSizeChanged = output<number>();

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (size <= 0) return 0;
    return Math.ceil(this.totalRecords() / size);
  });

  readonly rangeStart = computed(() => {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly rangeEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalRecords());
  });

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
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
  });

  goToPage(page: number | '...'): void {
    if (page === '...' || page === this.currentPage()) return;
    if (page < 1 || page > this.totalPages()) return;
    this.pageChanged.emit(page);
  }

  goFirst(): void {
    this.goToPage(1);
  }

  goPrev(): void {
    this.goToPage(this.currentPage() - 1);
  }

  goNext(): void {
    this.goToPage(this.currentPage() + 1);
  }

  goLast(): void {
    this.goToPage(this.totalPages());
  }

  onPageSizeChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.pageSizeChanged.emit(value);
  }
}
