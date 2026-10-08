import {
  type PolymarketUSError,
  WebSocketError,
  type WebSocketErrorMessage,
} from 'polymarket-us';

export function subscriptionError(
  frame: WebSocketErrorMessage,
): WebSocketError {
  return new WebSocketError(
    frame.error,
    frame.requestId,
    frame.subscriptionType,
  );
}

export function subscriptionType(error: PolymarketUSError): string | undefined {
  return error instanceof WebSocketError ? error.subscriptionType : undefined;
}
