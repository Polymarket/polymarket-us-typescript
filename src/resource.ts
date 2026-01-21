import type { PolymarketUS } from './client';

export abstract class APIResource {
  protected client: PolymarketUS;

  constructor(client: PolymarketUS) {
    this.client = client;
  }
}
