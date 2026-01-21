# Polymarket US TypeScript SDK

Official TypeScript SDK for the Polymarket US API.

## Installation

```bash
npm install polymarket-us
```

## Usage

### Public Endpoints (No Authentication)

```typescript
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS();

// Get events with pagination
const events = await client.events.list({ limit: 10, offset: 0, active: true });
const nextPage = await client.events.list({ limit: 10, offset: 10, active: true });

// Get a specific event
const event = await client.events.retrieve(123);
const eventBySlug = await client.events.retrieveBySlug('super-bowl-2025');

// Get markets
const markets = await client.markets.list();
const market = await client.markets.retrieveBySlug('btc-100k');

// Get order book
const book = await client.markets.book('btc-100k');

// Get best bid/offer
const bbo = await client.markets.bbo('btc-100k');

// Search
const results = await client.search.query({ query: 'bitcoin' });

// Series and sports
const series = await client.series.list();
const sports = await client.sports.list();
```

### Authenticated Endpoints (Trading)

```typescript
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS({
  keyId: process.env.POLYMARKET_KEY_ID,
  secretKey: process.env.POLYMARKET_SECRET_KEY,
});

// Create an order
const order = await client.orders.create({
  marketSlug: 'btc-100k-2025',
  intent: 'ORDER_INTENT_BUY_LONG',
  type: 'ORDER_TYPE_LIMIT',
  price: { value: '0.55', currency: 'USD' },
  quantity: 100,
  tif: 'TIME_IN_FORCE_GOOD_TILL_CANCEL',
});

// Get open orders
const openOrders = await client.orders.list();

// Cancel an order
await client.orders.cancel(order.id, { marketSlug: 'btc-100k-2025' });

// Cancel all orders
await client.orders.cancelAll();

// Get positions
const positions = await client.portfolio.positions();

// Get activity history
const activities = await client.portfolio.activities();

// Get account balances
const balances = await client.account.balances();
```

## Authentication

Polymarket US uses Ed25519 signature authentication. Generate API keys at [polymarket.us/developer](https://polymarket.us/developer).

The SDK automatically signs requests with your credentials:

```typescript
const client = new PolymarketUS({
  keyId: 'your-api-key-id',      // UUID
  secretKey: 'your-secret-key',  // Base64-encoded Ed25519 private key
});
```

## Error Handling

```typescript
import {
  PolymarketUS,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
} from 'polymarket-us';

try {
  await client.orders.create({ ... });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid credentials');
  } else if (error instanceof BadRequestError) {
    console.error('Invalid order parameters');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded, retry later');
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  }
}
```

## Configuration

```typescript
const client = new PolymarketUS({
  keyId: 'your-key-id',
  secretKey: 'your-secret-key',
  timeout: 30000,  // Request timeout in ms (default: 30000)
});
```

### WebSocket (Real-Time Data)

```typescript
import { PolymarketUS } from 'polymarket-us';

const client = new PolymarketUS({
  keyId: process.env.POLYMARKET_KEY_ID,
  secretKey: process.env.POLYMARKET_SECRET_KEY,
});

// Private WebSocket (orders, positions, balances)
const privateWs = client.ws.private();

privateWs.on('orderSnapshot', (data) => {
  console.log('Open orders:', data.orderSubscriptionSnapshot.orders);
});

privateWs.on('orderUpdate', (data) => {
  console.log('Order execution:', data.orderSubscriptionUpdate.execution);
});

privateWs.on('positionUpdate', (data) => {
  console.log('Position changed:', data.positionSubscriptionUpdate);
});

privateWs.on('error', (error) => {
  console.error('WebSocket error:', error);
});

await privateWs.connect();
privateWs.subscribeOrders('order-sub-1');
privateWs.subscribePositions('pos-sub-1');
privateWs.subscribeAccountBalance('balance-sub-1');

// Markets WebSocket (order book, trades)
const marketsWs = client.ws.markets();

marketsWs.on('marketData', (data) => {
  console.log('Order book:', data.marketData.bids, data.marketData.offers);
});

marketsWs.on('trade', (data) => {
  console.log('Trade:', data.trade);
});

await marketsWs.connect();
marketsWs.subscribeMarketData('md-sub-1', ['btc-100k-2025']);
marketsWs.subscribeTrades('trade-sub-1', ['btc-100k-2025']);

// Unsubscribe and close
marketsWs.unsubscribe('md-sub-1');
marketsWs.close();
```

## API Reference

### Events

| Method | Description |
|--------|-------------|
| `events.list(params?)` | List events with filtering |
| `events.retrieve(id)` | Get event by ID |
| `events.retrieveBySlug(slug)` | Get event by slug |

### Markets

| Method | Description |
|--------|-------------|
| `markets.list(params?)` | List markets with filtering |
| `markets.retrieve(id)` | Get market by ID |
| `markets.retrieveBySlug(slug)` | Get market by slug |
| `markets.book(slug)` | Get order book |
| `markets.bbo(slug)` | Get best bid/offer |
| `markets.settlement(slug)` | Get settlement price |

### Orders (Authenticated)

| Method | Description |
|--------|-------------|
| `orders.create(params)` | Create a new order |
| `orders.list(params?)` | Get open orders |
| `orders.retrieve(orderId)` | Get order by ID |
| `orders.cancel(orderId, params)` | Cancel an order |
| `orders.modify(orderId, params)` | Modify an order |
| `orders.cancelAll(params?)` | Cancel all open orders |
| `orders.preview(params)` | Preview an order |
| `orders.closePosition(params)` | Close a position |

### Portfolio (Authenticated)

| Method | Description |
|--------|-------------|
| `portfolio.positions(params?)` | Get trading positions |
| `portfolio.activities(params?)` | Get activity history |

### Account (Authenticated)

| Method | Description |
|--------|-------------|
| `account.balances()` | Get account balances |

### Series

| Method | Description |
|--------|-------------|
| `series.list(params?)` | List series |
| `series.retrieve(id)` | Get series by ID |

### Sports

| Method | Description |
|--------|-------------|
| `sports.list()` | List sports |
| `sports.teams(params?)` | Get teams for provider |

### Search

| Method | Description |
|--------|-------------|
| `search.query(params?)` | Search events (includes nested markets) |

### WebSocket (Authenticated)

| Method | Description |
|--------|-------------|
| `ws.private()` | Create private WebSocket connection |
| `ws.markets()` | Create markets WebSocket connection |

**Private WebSocket Events:**
- `orderSnapshot` - Initial orders snapshot
- `orderUpdate` - Order execution updates
- `positionSnapshot` - Initial positions snapshot
- `positionUpdate` - Position changes
- `accountBalanceSnapshot` - Initial balance
- `accountBalanceUpdate` - Balance changes
- `heartbeat` - Connection keepalive
- `error` - Error events
- `close` - Connection closed

**Markets WebSocket Events:**
- `marketData` - Full order book updates
- `marketDataLite` - Lightweight price data
- `trade` - Trade notifications
- `heartbeat` - Connection keepalive
- `error` - Error events
- `close` - Connection closed

## Requirements

- Node.js 18+
- For WebSocket support on Node.js < 22, install the `ws` package:

```bash
npm install ws
```

## License

MIT
