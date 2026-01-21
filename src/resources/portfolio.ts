import { APIResource } from '../resource';
import type {
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
}
