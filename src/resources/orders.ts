import { APIResource } from '../resource';
import type {
  CancelAllOrdersParams,
  CancelAllOrdersResponse,
  CancelOrderParams,
  ClosePositionParams,
  ClosePositionResponse,
  CreateOrderParams,
  CreateOrderResponse,
  GetOpenOrdersParams,
  GetOpenOrdersResponse,
  GetOrderResponse,
  ModifyOrderParams,
  PreviewOrderParams,
  PreviewOrderResponse,
} from '../types';

export class Orders extends APIResource {
  async create(params: CreateOrderParams): Promise<CreateOrderResponse> {
    return this.client.post('/v1/orders', {
      body: params,
      authenticated: true,
    });
  }

  async list(params?: GetOpenOrdersParams): Promise<GetOpenOrdersResponse> {
    return this.client.get('/v1/orders/open', {
      query: params,
      authenticated: true,
    });
  }

  async retrieve(orderId: string): Promise<GetOrderResponse> {
    return this.client.get(`/v1/order/${orderId}`, { authenticated: true });
  }

  async cancel(orderId: string, params: CancelOrderParams): Promise<void> {
    await this.client.post(`/v1/order/${orderId}/cancel`, {
      body: params,
      authenticated: true,
    });
  }

  async modify(orderId: string, params: ModifyOrderParams): Promise<void> {
    await this.client.post(`/v1/order/${orderId}/modify`, {
      body: params,
      authenticated: true,
    });
  }

  async cancelAll(
    params?: CancelAllOrdersParams,
  ): Promise<CancelAllOrdersResponse> {
    return this.client.post('/v1/orders/open/cancel', {
      body: params || {},
      authenticated: true,
    });
  }

  async preview(params: PreviewOrderParams): Promise<PreviewOrderResponse> {
    return this.client.post('/v1/order/preview', {
      body: params,
      authenticated: true,
    });
  }

  async closePosition(
    params: ClosePositionParams,
  ): Promise<ClosePositionResponse> {
    return this.client.post('/v1/order/close-position', {
      body: params,
      authenticated: true,
    });
  }
}
