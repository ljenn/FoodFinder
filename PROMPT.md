# Food Finder — Project Prompt

## Overview

Build a React web app that serves as a live tool to connect families to nearby food distribution events, providing clear and timely details such as event location, hours, requirements, and types of food available.

## Data Sources

Populate the app with real data extracted from the following credible sources:

- **DC Open Data** — https://opendata.dc.gov/
- **Prince George's County Open Data** — https://data.princegeorgescountymd.gov/
- **ArcGIS Food Resource Map (DC/MD/VA)** — https://experience.arcgis.com/experience/fe4fdacfd20b46c08dac240ca8dd6192
- **UMD Extension Food Access Resources** — https://extension.umd.edu/resource/food-access-resources/
- **Maryland Department of Agriculture** — https://mda.maryland.gov/

## Features

- Search by zip code to find food events near a location
- "Within X miles" radius slider filter (5–50 miles) based on geocoded zip coordinates
- Display the active zip code and radius in the filter panel at all times, defaulting to Washington DC (ZIP 20001)
- Interactive map view (Leaflet/OpenStreetMap) with clickable pins showing full event details
- List view with expandable event cards showing:
  - Event name and organization
  - Date, hours, and recurrence schedule
  - Address
  - Food types (as chips/tags)
  - Requirements
  - Notes
  - Contact and website
  - Data source attribution
- Filter panel with:
  - Searching near (zip code display)
  - Within X miles radius slider
  - Date picker
  - Food type chips
  - No requirements toggle
  - Spots available toggle
- Live data refresh every 24 hours with localStorage caching to avoid redundant fetches
- Show last updated timestamp in the UI
- Data source attribution in the footer with license info

## Technical Stack

- **React 18** with Vite
- **react-leaflet** for the interactive map
- **Nominatim (OpenStreetMap)** for zip code geocoding (no API key required)
- **DC GIS ArcGIS REST API** for live Capital Area Food Bank emergency food provider data
- Curated static data for Prince George's County DSS pantries and Maryland resources
- Vanilla CSS, no UI framework

## Design Notes

- Default map center: Washington DC (38.9072, -77.0369)
- Map pins should be small (16×26px)
- Clicking a map pin shows a full popup with all event details matching the list card
- App loads curated data synchronously on mount to avoid blank screen flicker
- Live DC GIS data merges in the background after initial render
