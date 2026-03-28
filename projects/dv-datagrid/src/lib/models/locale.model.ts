export interface DvGridLocale {
  // data-grid
  loading: string;
  noData: string;
  filterButtonTitle: string;
  reload: string;
  exportExcel: string;

  // filter menu
  filterMenuTitle: string;
  operator: string;
  value: string;
  to: string;
  filterValuePlaceholder: string;
  toValuePlaceholder: string;
  noValuesAvailable: string;
  clearFilter: string;
  applyFilter: string;

  // filter operators – text
  textContains: string;
  textEquals: string;
  textStartsWith: string;
  textEndsWith: string;

  // filter operators – number
  numberEquals: string;
  numberGreaterThan: string;
  numberLessThan: string;
  numberBetween: string;

  // filter operators – date
  dateEquals: string;
  dateBefore: string;
  dateAfter: string;
  dateBetween: string;

  // pagination
  noRecords: string;
  rowsPerPage: string;
  of: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
}

export const EN_LOCALE: DvGridLocale = {
  loading: 'Loading...',
  noData: 'No data',
  filterButtonTitle: 'Filter',
  reload: 'Reload',
  exportExcel: 'Export to Excel',

  filterMenuTitle: 'Filter',
  operator: 'Operator',
  value: 'Value',
  to: 'To',
  filterValuePlaceholder: 'Filter value...',
  toValuePlaceholder: 'To value...',
  noValuesAvailable: 'No values available',
  clearFilter: 'Clear',
  applyFilter: 'Apply',

  textContains: 'Contains',
  textEquals: 'Equals',
  textStartsWith: 'Starts with',
  textEndsWith: 'Ends with',

  numberEquals: 'Equals',
  numberGreaterThan: 'Greater than',
  numberLessThan: 'Less than',
  numberBetween: 'Between',

  dateEquals: 'Equals',
  dateBefore: 'Before',
  dateAfter: 'After',
  dateBetween: 'Between',

  noRecords: '0 records',
  rowsPerPage: 'Rows:',
  of: 'of',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
};

export const UK_LOCALE: DvGridLocale = {
  loading: 'Завантаження...',
  noData: 'Немає даних',
  filterButtonTitle: 'Фільтр',
  reload: 'Оновити',
  exportExcel: 'Експорт в Excel',

  filterMenuTitle: 'Фільтр',
  operator: 'Оператор',
  value: 'Значення',
  to: 'До',
  filterValuePlaceholder: 'Значення фільтра...',
  toValuePlaceholder: 'Кінцеве значення...',
  noValuesAvailable: 'Немає доступних значень',
  clearFilter: 'Очистити',
  applyFilter: 'Застосувати',

  textContains: 'Містить',
  textEquals: 'Рівно',
  textStartsWith: 'Починається з',
  textEndsWith: 'Закінчується на',

  numberEquals: 'Рівно',
  numberGreaterThan: 'Більше ніж',
  numberLessThan: 'Менше ніж',
  numberBetween: 'Між',

  dateEquals: 'Рівно',
  dateBefore: 'До',
  dateAfter: 'Після',
  dateBetween: 'Між',

  noRecords: '0 записів',
  rowsPerPage: 'Рядків:',
  of: 'з',
  firstPage: 'Перша сторінка',
  previousPage: 'Попередня сторінка',
  nextPage: 'Наступна сторінка',
  lastPage: 'Остання сторінка',
};
