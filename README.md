# Food Finder

A React web app that connects families to nearby food distribution events in the Washington DC, Maryland, and Virginia region. Data is pulled live from DC Open Data, Prince George's County DSS, UMD Extension, and the Maryland Department of Agriculture.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

### 3. Build for production

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy to any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

### 4. Preview the production build locally

```bash
npm run preview
```

## Usage

- **Search by zip code** — enter a DC/MD/VA zip code in the search bar to filter events near that location
- **Radius slider** — adjust the "Within X miles" slider in the left panel to widen or narrow results
- **List / Map toggle** — switch between a card list and an interactive map; click any pin for full event details
- **Filters** — narrow results by date, food type, requirements, and spot availability
- **Data refreshes automatically** every 24 hours; the last updated time is shown in the results toolbar

## Data Sources

| Source | URL | License |
|--------|-----|---------|
| DC Open Data — Capital Area Food Bank | https://opendata.dc.gov/datasets/DCGIS::capital-area-food-bank-emergency-food-provider | CC BY 4.0 |
| Prince George's County DSS | https://www.princegeorgescountymd.gov/departments-offices/food-pantry-services | Public |
| UMD Extension Food Access Resources | https://extension.umd.edu/resource/food-access-resources/ | Public |
| Maryland Department of Agriculture | https://mda.maryland.gov/ | Public |

## Project Structure

```
src/
  components/
    SearchBar.jsx       # Zip code search input
    FilterPanel.jsx     # Left sidebar filters
    EventCard.jsx       # List view event card
    EventMap.jsx        # Leaflet map with popups
  data/
    fetchEvents.js      # Live DC GIS fetch + 24hr cache logic
    dataSources.js      # API endpoint config
    pgCountyData.js     # Curated PG County pantry data
    marylandData.js     # Curated Maryland resource data
    mockEvents.js       # Food type options
  utils/
    distance.js         # Haversine distance formula
  App.jsx
  main.jsx
  index.css
```

## Emergency Food Resources

For immediate assistance, call **211** or visit the [Capital Area Food Bank](https://www.capitalareafoodbank.org/find-food-assistance/).
