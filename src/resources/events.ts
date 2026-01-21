import { APIResource } from '../resource';
import type {
  EventsListParams,
  GetEventResponse,
  GetEventsResponse,
} from '../types';

export class Events extends APIResource {
  async list(params?: EventsListParams): Promise<GetEventsResponse> {
    return this.client.get('/v1/events', { query: params });
  }

  async retrieve(id: number): Promise<GetEventResponse> {
    return this.client.get(`/v1/events/${id}`);
  }

  async retrieveBySlug(slug: string): Promise<GetEventResponse> {
    return this.client.get(`/v1/events/slug/${slug}`);
  }
}
