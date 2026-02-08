# @plots/tracking

Privacy-first analytics tracking SDK for Plots Analytics.

## Installation

```bash
npm install @plots/tracking
# or
bun add @plots/tracking
# or
yarn add @plots/tracking
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { PlotsAnalytics } from '@plots/tracking';

const plots = new PlotsAnalytics('proj_your_project_id');

// Track pageviews
plots.pageview();

// Track custom events
plots.track('button_click', { button: 'cta', location: 'hero' });

// Track signups
plots.signup({ plan: 'pro', source: 'landing' });

// Track purchases
plots.purchase(29.99, { product: 'subscription', interval: 'monthly' });

// Identify users
plots.identify('user_123', { email: 'user@example.com', plan: 'pro' });
```

### React

```tsx
import { PlotsProvider, usePlots } from '@plots/tracking/react';

// Wrap your app
function App() {
  return (
    <PlotsProvider projectId="proj_your_project_id">
      <YourApp />
    </PlotsProvider>
  );
}

// Use in components
function Button() {
  const plots = usePlots();
  
  const handleClick = () => {
    plots.track('button_click', { button: 'cta' });
    // Your logic here
  };
  
  return <button onClick={handleClick}>Click Me</button>;
}

// Or use hooks
function PurchaseButton() {
  const onClick = usePlotsClick('purchase_button', { location: 'pricing' });
  
  return <button onClick={onClick}>Buy Now</button>;
}
```

### Next.js (App Router)

```tsx
// app/providers.tsx
'use client';

import { PlotsProvider } from '@plots/tracking/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlotsProvider 
      projectId={process.env.NEXT_PUBLIC_PLOTS_PROJECT_ID!}
      autoPageview={true}
    >
      {children}
    </PlotsProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## API Reference

### Constructor

```typescript
new PlotsAnalytics(projectId, options?)
```

**Parameters:**
- `projectId` (string): Your Plots project ID
- `options` (optional):
  - `apiUrl` (string): Custom API URL (default: 'https://plots.sh')
  - `debug` (boolean): Enable debug logging (default: false)

### Methods

#### `track(event, properties?)`

Track a custom event.

```typescript
plots.track('feature_used', {
  feature: 'export',
  format: 'csv',
  count: 100
});
```

#### `pageview(path?)`

Track a pageview. Automatically captures current path if not specified.

```typescript
plots.pageview();
plots.pageview('/custom/path');
```

#### `signup(properties?)`

Convenience method for tracking signups.

```typescript
plots.signup({
  plan: 'pro',
  source: 'referral',
  campaign: 'summer2024'
});
```

#### `purchase(value, properties?)`

Track a purchase with revenue value.

```typescript
plots.purchase(29.99, {
  product: 'subscription',
  interval: 'monthly',
  currency: 'USD'
});
```

#### `identify(userId, traits?)`

Identify a user for session tracking.

```typescript
plots.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'pro'
});
```

#### `click(label, properties?)`

Track button/link clicks.

```typescript
plots.click('cta_button', {
  location: 'hero',
  text: 'Get Started'
});
```

#### `submit(formName, properties?)`

Track form submissions.

```typescript
plots.submit('contact_form', {
  fields: 5,
  time_to_complete: 30
});
```

## React Hooks

### `usePlots()`

Access Plots instance in any component.

```tsx
const plots = usePlots();
plots.track('event');
```

### `usePlotsPageviews()`

Automatically track pageviews on route changes.

```tsx
function App() {
  usePlotsPageviews();
  return <YourApp />;
}
```

### `usePlotsMount(eventName, properties?)`

Track when a component mounts.

```tsx
function Modal() {
  usePlotsMount('modal_opened', { modal: 'pricing' });
  return <div>...</div>;
}
```

### `usePlotsClick(label, properties?)`

Get a click handler function.

```tsx
const handleClick = usePlotsClick('button', { location: 'header' });
return <button onClick={handleClick}>Click</button>;
```

## Configuration

### Self-Hosted API

If you're self-hosting Plots:

```typescript
const plots = new PlotsAnalytics('proj_xxx', {
  apiUrl: 'https://your-plots-instance.com'
});

// React
<PlotsProvider 
  projectId="proj_xxx"
  apiUrl="https://your-plots-instance.com"
>
```

### Debug Mode

Enable debug logging:

```typescript
const plots = new PlotsAnalytics('proj_xxx', {
  debug: true
});
```

## Privacy

Plots is privacy-first by design:

- ✅ No cookies
- ✅ No persistent identifiers without user consent
- ✅ Respects Do Not Track
- ✅ GDPR & CCPA compliant
- ✅ IP addresses hashed before storage
- ✅ No cross-site tracking

## Examples

### E-commerce

```typescript
// Product view
plots.track('product_viewed', {
  product_id: 'prod_123',
  name: 'Premium T-Shirt',
  price: 29.99
});

// Add to cart
plots.track('add_to_cart', {
  product_id: 'prod_123',
  quantity: 2
});

// Purchase
plots.purchase(59.98, {
  order_id: 'order_456',
  items: 2,
  shipping: 5.00
});
```

### SaaS

```typescript
// Feature usage
plots.track('feature_used', {
  feature: 'export_data',
  format: 'csv',
  rows: 1000
});

// Trial started
plots.signup({
  plan: 'trial',
  duration: 14
});

// Upgraded
plots.purchase(49.00, {
  plan: 'business',
  billing: 'annual'
});
```

### Content Site

```typescript
// Article read
plots.track('article_read', {
  article_id: 'post_789',
  category: 'tutorials',
  read_time: 240
});

// Newsletter signup
plots.signup({
  source: 'article_footer',
  interests: ['tutorials', 'tips']
});
```

## TypeScript

Full TypeScript support included. Types are automatically inferred:

```typescript
import { PlotsAnalytics, EventProperties } from '@plots/tracking';

interface CustomEvent extends EventProperties {
  action: 'click' | 'view' | 'submit';
  value: number;
}

const plots = new PlotsAnalytics('proj_xxx');
plots.track<CustomEvent>('custom_event', {
  action: 'click',
  value: 100
});
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

Uses `sendBeacon` when available, with `fetch` fallback.

## License

MIT

## Links

- [Documentation](https://plots.sh/docs)
- [GitHub](https://github.com/canguden/plots)
- [Dashboard](https://plots.sh)
