import { DEFAULT_PAGE_SIZE, paginateOffset } from '../pagination';
import { APIResource } from '../resource';
import type {
  Event,
  EventsListParams,
  GetEventResponse,
  GetEventsResponse,
} from '../types';

export class Events extends APIResource {
  async list(params?: EventsListParams): Promise<GetEventsResponse> {
    return this.client.get('/v1/events', { query: params });
  }

  /** Iterate over all events across pages, fetching them lazily. */
  iterate(
    params?: EventsListParams,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ): AsyncGenerator<Event> {
    return paginateOffset<Event>(
      (offset, limit) =>
        this.client.get<Record<string, unknown>>('/v1/events', {
          query: { ...params, limit, offset },
        }),
      'events',
      pageSize,
    );
  }

  async retrieve(id: number): Promise<GetEventResponse> {
    return this.client.get(`/v1/events/${id}`);
  }

  async retrieveBySlug(slug: string): Promise<GetEventResponse> {
    return this.client.get(`/v1/events/slug/${slug}`);
  }
}
