// ---- Operator types ----
export type TextFilterOperator = 'ctns' | 'eq' | 'sw' | 'ew'; //'contains' | 'equals' | 'startsWith' | 'endsWith';
export type NumberFilterOperator = 'eq' | '>' | '<' | 'btw'; 
export type DateFilterOperator = 'eq' | 'before' | 'after' | 'btw';

// ---- Individual filter interfaces ----
export interface TextFilter {
  type: 'text';
  operator: TextFilterOperator;
  value: string;
}

export interface NumberFilter {
  type: 'number';
  operator: NumberFilterOperator;
  value: number | null;
  valueTo?: number | null;
}

export interface DateFilter {
  type: 'date';
  operator: DateFilterOperator;
  value: string | null;
  valueTo?: string | null;
}

export interface SetFilter {
  type: 'set';
  values: any[];
}

// ---- Discriminated union ----
export type FilterInstance = TextFilter | NumberFilter | DateFilter | SetFilter;

// ---- Full filter model: field → filter ----
export type FilterModel = Record<string, FilterInstance>;
