// Mock data for testing CLI UI/UX

export const mockProjects = [
  {
    id: "proj_demo1",
    name: "My Website",
    domain: "example.com",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "proj_demo2",
    name: "E-commerce Store",
    domain: "shop.example.com",
    created_at: "2026-01-15T08:30:00Z",
  },
];

export const mockStats = {
  totalPageviews: 12547,
  uniqueVisitors: 3421,
  totalEvents: 8932,
  avgSessionDuration: 245, // seconds
  bounceRate: 42.5,
};

export const mockChartData = [
  { date: "2026-02-01", pageviews: 423, visitors: 156 },
  { date: "2026-02-02", pageviews: 512, visitors: 189 },
  { date: "2026-02-03", pageviews: 389, visitors: 142 },
  { date: "2026-02-04", pageviews: 678, visitors: 234 },
  { date: "2026-02-05", pageviews: 891, visitors: 312 },
  { date: "2026-02-06", pageviews: 756, visitors: 287 },
  { date: "2026-02-07", pageviews: 634, visitors: 221 },
  { date: "2026-02-08", pageviews: 582, visitors: 203 },
];

export const mockTopPages = [
  { path: "/", views: 3421, unique: 1234 },
  { path: "/about", views: 1567, unique: 892 },
  { path: "/products", views: 2341, unique: 1045 },
  { path: "/blog", views: 987, unique: 543 },
  { path: "/contact", views: 756, unique: 421 },
];

export const mockTopCountries = [
  { country: "United States", visitors: 1234, percentage: 36 },
  { country: "United Kingdom", visitors: 567, percentage: 17 },
  { country: "Germany", visitors: 432, percentage: 13 },
  { country: "Canada", visitors: 321, percentage: 9 },
  { country: "France", visitors: 289, percentage: 8 },
];

export const mockTopBrowsers = [
  { browser: "Chrome", visitors: 1876, percentage: 55 },
  { browser: "Safari", visitors: 892, percentage: 26 },
  { browser: "Firefox", visitors: 445, percentage: 13 },
  { browser: "Edge", visitors: 208, percentage: 6 },
];

export const mockRecentEvents = [
  {
    event: "purchase",
    timestamp: "2026-02-08T11:05:32Z",
    properties: { value: 129.99, product: "Premium Plan" },
  },
  {
    event: "signup",
    timestamp: "2026-02-08T11:03:15Z",
    properties: { plan: "free" },
  },
  {
    event: "button_click",
    timestamp: "2026-02-08T11:01:42Z",
    properties: { button: "get_started" },
  },
  {
    event: "purchase",
    timestamp: "2026-02-08T10:58:21Z",
    properties: { value: 49.99, product: "Starter Plan" },
  },
  {
    event: "page_view",
    timestamp: "2026-02-08T10:55:03Z",
    properties: { path: "/pricing" },
  },
];

export const mockLiveActivity = [
  { time: "11:08:45", event: "pageview", path: "/products", country: "US" },
  { time: "11:08:32", event: "signup", path: "/register", country: "GB" },
  { time: "11:08:18", event: "pageview", path: "/", country: "DE" },
  { time: "11:07:56", event: "purchase", path: "/checkout", country: "CA" },
  { time: "11:07:42", event: "pageview", path: "/blog", country: "FR" },
];
