# Plots CLI Test / Demo

This is a standalone demo of the Plots CLI interface with **mock data** to preview the UI/UX before publishing.

## Features Demonstrated

- 📊 **Overview Dashboard** - Key metrics, charts, quick stats
- 📄 **Top Pages View** - Table of most visited pages
- 🌍 **Countries View** - Geographic visitor breakdown
- 🔴 **Live Activity** - Real-time event stream (simulated)
- 🎯 **Project Switching** - Toggle between multiple projects
- ⌨️ **Keyboard Navigation** - Full keyboard shortcuts

## Quick Start

```bash
# Install dependencies
bun install

# Run the demo
bun dev
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Switch to Overview view |
| `2` | Switch to Top Pages view |
| `3` | Switch to Countries view |
| `4` | Switch to Live Activity view |
| `p` | Switch between projects |
| `q` | Quit the dashboard |

## What to Test

1. **Visual Layout** - Check if spacing, borders, and alignment look good
2. **Data Display** - Verify numbers, charts, and tables are readable
3. **Navigation** - Test keyboard shortcuts and view switching
4. **Colors** - Ensure color scheme is consistent and accessible
5. **Responsiveness** - Resize terminal to test different sizes

## Making Improvements

After testing, note any issues or improvements:

- Layout adjustments
- Color scheme changes
- Additional data to display
- Better chart visualizations
- More keyboard shortcuts
- Performance optimizations

Then apply those changes to the actual CLI at `apps/cli/src/`

## Mock Data

All data is defined in `src/mock-data.ts`:
- 2 sample projects
- 8 days of chart data
- Top pages, countries, browsers
- Simulated live events