import { paginateCursor } from '../pagination';
import { APIResource } from '../resource';
import type {
  Activity,
  GetActivitiesParams,
  GetActivitiesResponse,
  GetUserPositionsParams,
  GetUserPositionsResponse,
} from '../types';

export class Portfolio extends APIResource {
  async positions(
    params?: GetUserPositionsParams,
  ): Promise<GetUserPositionsResponse> {
    return this.client.get('/v1/portfolio/positions', {
      query: params,
      authenticated: true,
    });
  }

  async activities(
    params?: GetActivitiesParams,
  ): Promise<GetActivitiesResponse> {
    return this.client.get('/v1/portfolio/activities', {
      query: params,
      authenticated: true,
    });
  }

  /** Iterate over all activities, following the cursor across pages. */
  iterateActivities(params?: GetActivitiesParams): AsyncGenerator<Activity> {
    return paginateCursor<Activity>(
      (cursor) =>
        this.client.get<Record<string, unknown>>('/v1/portfolio/activities', {
          query: { ...params, ...(cursor ? { cursor } : {}) },
          authenticated: true,
        }),
      'activities',
    );
  }
}
