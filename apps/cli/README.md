# 📊 Plots CLI

> Terminal dashboard for [Plots](https://plots.sh) - Privacy-first web analytics

[![npm version](https://img.shields.io/npm/v/@imagininn/plots.svg)](https://www.npmjs.com/package/@imagininn/plots)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

View your website analytics directly from your terminal with real-time insights, beautiful charts, and lightning-fast performance.

## 🌐 Website

Visit [plots.sh](https://plots.sh) for the full web dashboard and documentation.

## ✨ Features

- 📈 Real-time analytics dashboard in your terminal
- 🎨 Beautiful, minimal UI with syntax highlighting
- ⚡ Lightning-fast performance powered by Bun
- 🔐 Privacy-first analytics (GDPR compliant)
- 🌍 Geographic insights and traffic sources
- 📱 Device and browser breakdowns
- 🔄 Live data updates

## 📦 Installation

Install globally using your preferred package manager:

### npm
\`\`\`bash
npm install -g @imagininn/plots
\`\`\`

### pnpm
\`\`\`bash
pnpm add -g @imagininn/plots
\`\`\`

### Yarn
\`\`\`bash
yarn global add @imagininn/plots
\`\`\`

### Bun
\`\`\`bash
bun install -g @imagininn/plots
\`\`\`

## 🚀 Usage

After installation, run the CLI:

\`\`\`bash
plots
\`\`\`

### First Time Setup

1. **Login to your account:**
   \`\`\`bash
   plots login
   \`\`\`
   This will open your browser to authenticate with Plots.

2. **View your dashboard:**
   \`\`\`bash
   plots
   \`\`\`

### Commands

\`\`\`bash
plots                # Open the analytics dashboard
plots login          # Authenticate with your Plots account
plots logout         # Sign out from your account
plots init           # Initialize tracking for a new project
plots --version      # Show CLI version
plots --help         # Display help information
\`\`\`

### Dashboard Navigation

Once in the dashboard:

- **Tab** / **Arrow Keys** - Navigate between sections
- **1-4** - Switch between views (Overview, Pages, Countries, Devices)
- **7/30/90** - Change date range (7 days, 30 days, 90 days)
- **r** - Refresh data
- **q** - Quit

## 🔧 Configuration

The CLI stores your authentication token securely in:
- **Linux/macOS**: \`~/.config/plots/credentials\`
- **Windows**: \`%APPDATA%\plots\credentials\`

## 📊 What You'll See

- **📈 Overview**: Total pageviews, unique visitors, bounce rate, avg. session duration
- **📄 Pages**: Top performing pages with traffic breakdown
- **🌍 Countries**: Geographic distribution of your visitors
- **📱 Devices**: Browser and device statistics

## 🛠️ Requirements

- **Node.js** 20+ or **Bun** 1.0+
- Active internet connection
- A [Plots](https://plots.sh) account

## 🌟 Why Plots?

- ✅ **Privacy-First**: No cookies, GDPR compliant, visitor IP anonymization
- ✅ **Lightweight**: < 1KB tracking script, doesn't slow down your site
- ✅ **Beautiful**: Clean, minimal interface in terminal and web
- ✅ **Open Source**: Transparent, community-driven development
- ✅ **Fast**: Built on ClickHouse for real-time analytics

## 📖 Documentation

Full documentation available at [plots.sh/docs](https://plots.sh/docs)

## 🐛 Issues & Feedback

Found a bug or have a feature request? 

- **GitHub**: [github.com/canguden/plots/issues](https://github.com/canguden/plots/issues)
- **Email**: support@plots.sh
- **Twitter**: [@plotsanalytics](https://twitter.com/plotsanalytics)

## 📄 License

MIT © [Imagininn](https://imagininn.com)

---

**Made with ❤️ by [Imagininn](https://imagininn.com)**

Visit [plots.sh](https://plots.sh) to get started with privacy-first analytics.
