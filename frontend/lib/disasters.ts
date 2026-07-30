export interface SocialMentions {
  twitter: number
  facebook: number
  instagram: number
}

export interface DisasterEvent {
  id: string
  title: string
  type: string
  country: string
  location: string
  continent: string
  lat: number
  lng: number
  date: string
  url: string
  severity: number
  source: string
  social?: SocialMentions
}

export interface DisasterData {
  total: number
  updatedAt: string
  events: DisasterEvent[]
  byCountry: Record<string, number>
  byType: Record<string, number>
  byContinent: Record<string, number>
}

export const typeColors: Record<string, string> = {
  Flood: "oklch(58% 0.06 240)",
  Earthquake: "oklch(55% 0.10 25)",
  Storm: "oklch(58% 0.08 75)",
  Drought: "oklch(55% 0.08 80)",
  Wildfire: "oklch(52% 0.10 30)",
  Volcano: "oklch(48% 0.12 20)",
  "Tropical Cyclone": "oklch(56% 0.08 50)",
  Pandemic: "oklch(58% 0.08 320)",
  Heatwave: "oklch(58% 0.10 50)",
  "Civil Unrest": "oklch(52% 0.06 260)",
  War: "oklch(45% 0.12 20)",
  Terrorism: "oklch(50% 0.08 30)",
}

export const typeOptions = ["All", "Earthquake", "Flood", "Storm", "Drought", "Wildfire", "Volcano", "Tropical Cyclone", "Pandemic", "Heatwave", "Civil Unrest", "War", "Terrorism", "Other"]

export const continentOptions = ["All", "Africa", "Asia", "Europe", "Americas", "Oceania"]

export const globalRegions = [
  { value: "north-america", label: "North America", mult: 1.3 },
  { value: "central-america", label: "Central America", mult: 1.5 },
  { value: "caribbean", label: "Caribbean", mult: 2.0 },
  { value: "south-america", label: "South America", mult: 1.4 },
  { value: "western-europe", label: "Western Europe", mult: 1.1 },
  { value: "eastern-europe", label: "Eastern Europe", mult: 1.2 },
  { value: "scandinavia", label: "Scandinavia", mult: 1.0 },
  { value: "middle-east", label: "Middle East", mult: 1.6 },
  { value: "west-africa", label: "West Africa", mult: 1.7 },
  { value: "east-africa", label: "East Africa", mult: 1.8 },
  { value: "southern-africa", label: "Southern Africa", mult: 1.5 },
  { value: "north-africa", label: "North Africa", mult: 1.4 },
  { value: "south-asia", label: "South Asia", mult: 1.6 },
  { value: "southeast-asia", label: "Southeast Asia", mult: 1.7 },
  { value: "east-asia", label: "East Asia", mult: 1.5 },
  { value: "oceania", label: "Oceania", mult: 1.3 },
]

export function getTypeColor(type: string): string {
  return typeColors[type] || "var(--color-neutral)"
}

export function formatSocial(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}

const sourceMap: Record<string, string[]> = {
  Earthquake: ["https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"],
  Hurricane: ["https://www.nhc.noaa.gov/gtwo.php?basin=atl"],
  Storm: ["https://www.nhc.noaa.gov/gtwo.php?basin=atl"],
  "Tropical Cyclone": ["https://www.nhc.noaa.gov/gtwo.php?basin=atl"],
  Flood: ["https://waterdata.usgs.gov/nwis/rt"],
  Drought: ["https://droughtmonitor.unl.edu/data/json/current/"],
  Wildfire: ["https://firms.modaps.eosdis.nasa.gov/api/area/csv/"],
  Volcano: ["https://volcanoes.usgs.gov/vsc/feed/"],
  Pandemic: ["https://www.who.int/emergencies", "https://coronavirus.jhu.edu/", "https://en.wikipedia.org/wiki/Pandemic", "https://pubmed.ncbi.nlm.nih.gov/"],
  Heatwave: ["https://www.noaa.gov/climate", "https://climate.copernicus.eu/", "https://en.wikipedia.org/wiki/Heat_wave"],
  "Civil Unrest": ["https://acleddata.com/", "https://en.wikipedia.org/wiki/Civil_unrest", "https://news.google.com/"],
  War: ["https://ucdp.uu.se/", "https://acleddata.com/", "https://en.wikipedia.org/wiki/War", "https://reliefweb.int/"],
  Terrorism: ["https://www.start.umd.edu/gtd/", "https://en.wikipedia.org/wiki/Terrorism", "https://news.google.com/"],
}

const continentSources: Record<string, string[]> = {
  Africa: ["https://fews.net/data/remote"],
  Asia: ["https://www.adrc.asia/"],
  Europe: ["https://www.emergency.copernicus.eu/"],
}

export function getDataSources(type: string, continent?: string): string[] {
  const sources = [...(sourceMap[type] || [])]
  if (continent && continentSources[continent]) {
    sources.push(...continentSources[continent])
  }
  return sources
}

export const defaultRegion = "south-america"
