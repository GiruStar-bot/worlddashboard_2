# World Dashboard v6.3 🌍

**Global Intelligence Nexus** - An interactive visualization platform for economic and political data of all countries and regions worldwide.

[![Deploy to GitHub Pages](https://github.com/GiruStar-bot/worlddashboard_2/actions/workflows/deploy.yml/badge.svg)](https://github.com/GiruStar-bot/worlddashboard_2/actions/workflows/deploy.yml)

## 🎯 Purpose

世界中の全ての国と地域の**経済**と**政治**を可視化するプラットフォーム

This project visualizes the economy and politics of all countries and regions through an interactive dashboard featuring:

- 📊 Economic indicators (GDP, growth rates)
- 🏛️ Political metrics (regime types, democracy scores)
- 🗺️ Interactive world map with risk visualization
- 📈 Comparative analytics across 198 countries
- 📰 Global news stream integration

## ✨ Features

### Interactive World Map
- Color-coded countries based on Fragile States Index (FSI)
- Click any country for detailed information
- Zoom and pan capabilities
- Hover tooltips with country names

### Country Details Panel
- Real-time economic metrics
- Political regime information
- Risk assessment scores
- Visual radar charts for quick comparison

### Deep Dive Reports
- Comprehensive country analysis by region
- Evidence-based key takeaways
- Historical context and trends
- Source citations from trusted institutions

### Analytics Dashboard
- Top 30 economies by GDP
- Regional groupings (8 regions)
- Sortable rankings
- Quick country comparison

### Global News Stream
- BBC World News
- New York Times World
- UN News
- Real-time updates

## 📊 Data Sources

| Category | Source | Version |
|----------|--------|---------|
| **Economy** | IMF World Economic Outlook | October 2025 |
| **Society** | UN World Population Prospects | 2024 |
| **Politics** | V-Dem Democracy Report | 2024 |
| **Risk** | Fragile States Index (FSI) | 2024 |

## 🗂️ Coverage

- **198 Countries** across 8 major regions
- **Regions**: East Asia & Pacific, Europe & Central Asia, Latin America & Caribbean, Middle East & North Africa, North America, South Asia, Sub-Saharan Africa, Oceania

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/GiruStar-bot/worlddashboard_2.git
cd worlddashboard_2

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/worlddashboard_2/`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.2.0
- **Styling**: TailwindCSS 3.4.3
- **Maps**: react-simple-maps 3.0.0
- **Charts**: recharts 2.12.7
- **Icons**: lucide-react 0.381.0

## 📁 Project Structure

```
worlddashboard_2/
├── public/                          # Static assets
│   ├── worlddash_global_master.json # Main data file (198 countries)
│   ├── reports_africa.json          # Regional reports
│   ├── reports_asia.json
│   ├── reports_europe.json
│   ├── reports_americas.json
│   └── reports_oceania.json
├── src/
│   ├── components/                  # React components
│   │   ├── WorldMap.jsx            # Interactive map
│   │   ├── CountryDetails.jsx      # Country info panel
│   │   ├── DeepReportPanel.jsx     # Detailed reports
│   │   ├── AnalyticsPanel.jsx      # Analytics dashboard
│   │   └── GlobalStreamPanel.jsx   # News feed
│   ├── constants/
│   │   └── isoMap.js               # ISO country codes
│   ├── utils/
│   │   └── colorUtils.js           # Color utilities
│   ├── App.jsx                      # Main application
│   └── main.jsx                     # Entry point
└── package.json
```

## 🎨 Design

The application features a **cyberpunk-inspired aesthetic** with:
- Dark slate background (#020617)
- Cyan accent colors (#22d3ee)
- Glassmorphism effects
- Smooth animations and transitions
- JetBrains Mono font for metrics

## 📖 Usage

1. **Explore the Map**: Click on any country to view detailed information
2. **Analytics Panel**: Click "OPEN_ANALYTICS" to compare countries
3. **Deep Reports**: When viewing a country, click "OPEN_DEEP_DIVE_REPORT" for comprehensive analysis
4. **Global Stream**: Click "OPEN_GLOBAL_STREAM" at the bottom for world news
5. **Fullscreen**: Use "FULL_DEEP" button for immersive experience

## 🔐 Security

- ✅ No security vulnerabilities detected (CodeQL verified)
- ✅ No sensitive data in source code
- ✅ All external resources properly handled

## 📝 License

This project is private. All rights reserved.

## 🤝 Contributing

This project is maintained by GiruStar-bot. For questions or issues, please open a GitHub issue.

## 📧 Contact

For more information, visit the [GitHub repository](https://github.com/GiruStar-bot/worlddashboard_2).

---

**World Dashboard v6.3** - Global Intelligence Nexus
