import { APIResource } from '../resource';
import type {
  GetSportsResponse,
  GetSportsTeamsParams,
  GetSportsTeamsResponse,
} from '../types';

export class Sports extends APIResource {
  async list(): Promise<GetSportsResponse> {
    return this.client.get('/v1/sports');
  }

  async teams(params?: GetSportsTeamsParams): Promise<GetSportsTeamsResponse> {
    return this.client.get('/v1/sports/teams/provider', { query: params });
  }
}
