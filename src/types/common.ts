export interface Amount {
  value: string;
  currency: 'USD';
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
