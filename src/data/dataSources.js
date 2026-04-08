/**
 * Data source configurations for the DC/MD food distribution finder.
 *
 * Sources:
 * 1. DC GIS - Capital Area Food Bank Emergency Food Providers (live ArcGIS REST API)
 *    https://opendata.dc.gov/datasets/DCGIS::capital-area-food-bank-emergency-food-provider
 *    License: CC BY 4.0 | Publisher: DC Office of Planning
 *
 * 2. Prince George's County DSS Food Pantries (curated from official county pages)
 *    https://www.princegeorgescountymd.gov/departments-offices/food-pantry-services
 *
 * 3. Maryland food access resources (curated from UMD Extension & MDA)
 *    https://extension.umd.edu/resource/food-access-resources/
 *    https://mda.maryland.gov/
 *
 * 4. ArcGIS Experience food resource map (DC/MD/VA)
 *    https://experience.arcgis.com/experience/fe4fdacfd20b46c08dac240ca8dd6192
 */

// DC GIS ArcGIS REST endpoint — Capital Area Food Bank Emergency Food Providers
// Public dataset, no auth required, CC BY 4.0
export const DC_GIS_CAFB_URL =
  'https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Safety_WebMercator/MapServer/26/query'

export const DC_GIS_PARAMS = {
  where: '1=1',
  outFields: 'AGENCY_NAM,AGENCY_N_1,ADDRESS,CITY,STATE,ZIPCODE,PROGRAM,LATITUDE,LONGITUDE,KIDS_CAFE,COMMUNITY,WEEKEND_BA,FAMILY_MAR,GROCERY_PL',
  f: 'json',
  resultRecordCount: 1000,
  outSR: '4326',
}
