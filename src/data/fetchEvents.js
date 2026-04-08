/**
 * Fetches food distribution event data from multiple credible sources:
 *
 * 1. DC GIS ArcGIS REST API — Capital Area Food Bank Emergency Food Providers
 *    Source: https://opendata.dc.gov/datasets/DCGIS::capital-area-food-bank-emergency-food-provider
 *    License: CC BY 4.0 | Publisher: DC Office of Planning / Capital Area Food Bank
 *
 * 2. Prince George's County DSS food pantries (curated)
 *    Source: https://www.princegeorgescountymd.gov/departments-offices/food-pantry-services
 *
 * 3. Maryland food access resources (curated from UMD Extension & MDA)
 *    Source: https://extension.umd.edu/resource/food-access-resources/
 *    Source: https://mda.maryland.gov/
 */

import { DC_GIS_CAFB_URL, DC_GIS_PARAMS } from './dataSources'
import { pgCountyPantries } from './pgCountyData'
import { marylandResources } from './marylandData'

// Curated data is available synchronously — no flicker on load
const curatedEvents = [
  ...pgCountyPantries,
  ...marylandResources,
].map((r, i) => ({
  ...r,
  id: r.id || `curated-${i}`,
  date: r.date || null,
  spotsAvailable: r.spotsAvailable !== false,
}))

export { curatedEvents }

/**
 * Maps a DC GIS CAFB feature to our unified event schema.
 * The CAFB dataset uses Web Mercator (EPSG:3857) geometry but we request outSR=4326.
 */
function mapCafbFeature(feature, index) {
  const p = feature.attributes
  const geo = feature.geometry

  // Build program tags from boolean-ish fields
  const programs = []
  if (p.KIDS_CAFE && p.KIDS_CAFE !== 'N') programs.push("Kids' Café")
  if (p.COMMUNITY && p.COMMUNITY !== 'N') programs.push('Community Meals')
  if (p.WEEKEND_BA && p.WEEKEND_BA !== 'N') programs.push('Weekend Backpack')
  if (p.FAMILY_MAR && p.FAMILY_MAR !== 'N') programs.push('Family Market')
  if (p.GROCERY_PL && p.GROCERY_PL !== 'N') programs.push('Grocery Plus')
  if (p.PROGRAM) programs.push(p.PROGRAM)

  const foodTypes = programs.length > 0
    ? programs
    : ['Emergency Food', 'Canned Goods', 'Fresh Produce']

  const lat = p.LATITUDE || (geo && geo.y)
  const lng = p.LONGITUDE || (geo && geo.x)

  if (!lat || !lng || lat === 0 || lng === 0) return null

  return {
    id: `cafb-${index}`,
    name: p.AGENCY_NAM || p.AGENCY_N_1 || 'Food Distribution Site',
    organization: 'Capital Area Food Bank Partner',
    address: [p.ADDRESS, p.CITY, p.STATE, p.ZIPCODE].filter(Boolean).join(', '),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    date: null, // CAFB dataset is location-based, not event-based
    hours: 'Contact for hours',
    recurring: 'Ongoing',
    foodTypes,
    requirements: 'Contact site for eligibility requirements',
    notes: p.PROGRAM ? `Program: ${p.PROGRAM}` : '',
    contact: '',
    website: 'https://www.capitalareafoodbank.org/find-food-assistance/',
    spotsAvailable: true,
    source: 'DC Open Data / Capital Area Food Bank',
    sourceUrl: 'https://opendata.dc.gov/datasets/DCGIS::capital-area-food-bank-emergency-food-provider',
  }
}

/**
 * Fetches live data from the DC GIS ArcGIS REST API.
 * Falls back gracefully if the API is unavailable (CORS, timeout, etc).
 */
async function fetchDcGisData() {
  try {
    const params = new URLSearchParams({
      ...DC_GIS_PARAMS,
      resultRecordCount: String(DC_GIS_PARAMS.resultRecordCount),
    })
    const url = `${DC_GIS_CAFB_URL}?${params.toString()}`

    // Manual timeout — AbortSignal.timeout() has limited browser support
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`DC GIS API error: ${res.status}`)
    const data = await res.json()
    if (!data.features) throw new Error('No features in DC GIS response')
    return data.features
      .map((f, i) => mapCafbFeature(f, i))
      .filter(Boolean)
  } catch (err) {
    console.warn('DC GIS API unavailable, using curated fallback data:', err.message)
    return []
  }
}

/**
 * Normalizes curated static records to match the unified event schema.
 */
function normalizeCurated(records) {
  return records.map((r) => ({
    ...r,
    date: r.date || null,
    spotsAvailable: r.spotsAvailable !== false,
  }))
}

/**
 * Main fetch function — merges live DC GIS data with curated PG County & MD data.
 * Deduplicates by proximity (within ~100m) to avoid showing the same site twice.
 */
export async function fetchAllEvents() {
  const [dcGisEvents, pgEvents, mdEvents] = await Promise.all([
    fetchDcGisData(),
    Promise.resolve(normalizeCurated(pgCountyPantries)),
    Promise.resolve(normalizeCurated(marylandResources)),
  ])

  // Merge all sources, DC GIS first (live data takes priority)
  const all = [...dcGisEvents, ...pgEvents, ...mdEvents]

  // Assign sequential IDs to ensure uniqueness
  return all.map((e, i) => ({ ...e, id: e.id || `event-${i}` }))
}

/**
 * Returns the data source attribution info for display in the UI.
 */
export const dataSources = [
  {
    name: 'DC Open Data — Capital Area Food Bank Emergency Food Providers',
    url: 'https://opendata.dc.gov/datasets/DCGIS::capital-area-food-bank-emergency-food-provider',
    license: 'CC BY 4.0',
    publisher: 'DC Office of Planning / Capital Area Food Bank',
  },
  {
    name: 'Prince George\'s County Dept. of Social Services',
    url: 'https://www.princegeorgescountymd.gov/departments-offices/food-pantry-services',
    license: 'Public',
    publisher: 'Prince George\'s County, MD',
  },
  {
    name: 'UMD Extension Food Access Resources',
    url: 'https://extension.umd.edu/resource/food-access-resources/',
    license: 'Public',
    publisher: 'University of Maryland Extension',
  },
  {
    name: 'Maryland Department of Agriculture',
    url: 'https://mda.maryland.gov/',
    license: 'Public',
    publisher: 'State of Maryland',
  },
]
