import { APIResource } from '../resource';
import type { GetAccountBalancesResponse } from '../types';

export class Account extends APIResource {
  async balances(): Promise<GetAccountBalancesResponse> {
    return this.client.get('/v1/account/balances', { authenticated: true });
  }
}
