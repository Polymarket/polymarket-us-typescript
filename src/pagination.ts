/**
 * Auto-pagination helpers for list endpoints.
 *
 * The API uses two pagination styles:
 *
 * - cursor-based (`nextCursor` / `eof`) for activities and positions, and
 * - offset-based (bare array responses) for events, markets, series, and tags.
 *
 * These helpers transparently walk all pages and yield individual items.
 */

export const DEFAULT_PAGE_SIZE = 100;

export async function* paginateOffset<T>(
  fetchPage: (
    offset: number,
    limit: number,
  ) => Promise<Record<string, unknown>>,
  itemsKey: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
): AsyncGenerator<T> {
  let offset = 0;
  for (;;) {
    const page = await fetchPage(offset, pageSize);
    const items = (page[itemsKey] as T[] | undefined) ?? [];
    for (const item of items) {
      yield item;
    }
    if (items.length < pageSize) {
      return;
    }
    offset += pageSize;
  }
}

export async function* paginateCursor<T>(
  fetchPage: (cursor?: string) => Promise<Record<string, unknown>>,
  itemsKey: string,
): AsyncGenerator<T> {
  let cursor: string | undefined;
  for (;;) {
    const page = await fetchPage(cursor);
    const items = (page[itemsKey] as T[] | undefined) ?? [];
    for (const item of items) {
      yield item;
    }
    if (page.eof) {
      return;
    }
    cursor = page.nextCursor as string | undefined;
    if (!cursor) {
      return;
    }
  }
}
