import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface SocialMentions {
  twitter: number
  facebook: number
  instagram: number
}

interface DisasterEvent {
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

async function fetchReliefWeb(url: string, sourceLabel: string, limit = 20): Promise<DisasterEvent[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    const json = await res.json()
    return (json.data || []).slice(0, limit).map((item: any) => ({
      id: `rw-${item.id}`,
      title: item.fields?.title || "Untitled Report",
      type: item.fields?.disaster_type?.name || "Other",
      country: item.fields?.primary_country?.name || "Unknown",
      location: item.fields?.primary_country?.name || "",
      continent: item.fields?.primary_country?.continent?.name || "",
      lat: item.fields?.primary_country?.location?.lat || 0,
      lng: item.fields?.primary_country?.location?.lon || 0,
      date: item.fields?.date?.created || "",
      url: item.fields?.url || "#",
      severity: 0.5,
      source: sourceLabel,
    }))
  } catch {
    return []
  }
}

async function fetchUSGS(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
      { next: { revalidate: 60 } }
    )
    const json = await res.json()
    return (json.features || []).slice(0, 20).map((feat: any) => {
      const props = feat.properties
      const coords = feat.geometry.coordinates
      return {
        id: `usgs-${props.code || props.net}`,
        title: props.title || "Earthquake",
        type: "Earthquake",
        country: props.place?.split(",").pop()?.trim() || "Unknown",
        location: props.place || "",
        continent: "",
        lat: coords[1],
        lng: coords[0],
        date: new Date(props.time).toISOString(),
        url: props.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${props.code}`,
        severity: Math.min(props.mag / 9, 1),
        source: "USGS",
      }
    })
  } catch {
    return []
  }
}

async function fetchGDACS(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch("https://www.gdacs.org/xml/rss_24h.xml", {
      next: { revalidate: 120 },
    })
    const text = await res.text()
    const items = text.match(/<item>[\s\S]*?<\/item>/g) || []
    return items.slice(0, 20).map((itemStr: string, i: number) => {
      const extract = (tag: string) => {
        const m = itemStr.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))
        return m ? m[1].trim() : ""
      }
      const latMatch = itemStr.match(/<geo:lat>([^<]+)</)
      const lngMatch = itemStr.match(/<geo:long>([^<]+)</)
      return {
        id: `gdacs-${i}-${Date.now()}`,
        title: extract("title").replace(/<!\[CDATA\[|\]\]>/g, ""),
        type: extract("gdacs:eventtype") || "Other",
        country: extract("gdacs:country") || "Unknown",
        location: extract("gdacs:country") || "",
        continent: "",
        lat: latMatch ? Number(latMatch[1]) : 0,
        lng: lngMatch ? Number(lngMatch[1]) : 0,
        date: extract("pubDate"),
        url: extract("link"),
        severity: 0.6,
        source: "GDACS",
      }
    })
  } catch {
    return []
  }
}

async function fetchGDELT(): Promise<DisasterEvent[]> {
  try {
    const query = encodeURIComponent(
      "earthquake OR flood OR storm OR wildfire OR drought OR cyclone OR volcano OR pandemic OR heatwave OR civil unrest OR war OR terrorism"
    )
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&format=json&maxrecords=20&timespan=7d`,
      { next: { revalidate: 120 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.articles || []).map((a: any) => ({
      id: `gdelt-${a.url || a.title}`,
      title: a.title || "Untitled",
      type: "Other",
      country: a.country || "Unknown",
      location: a.sourcecountry || "",
      continent: "",
      lat: a.lat || 0,
      lng: a.lon || 0,
      date: a.seendate
        ? `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}`
        : "",
      url: a.url || "#",
      severity: 0.4,
      source: "GDELT",
      social: {
        twitter: a.shares?.twitter || 0,
        facebook: a.shares?.facebook || 0,
        instagram: a.shares?.instagram || 0,
      },
    }))
  } catch {
    return []
  }
}

function toContinent(country: string): string {
  const mapping: Record<string, string> = {
    africa: "Africa",
    nigeria: "Africa", kenya: "Africa", ethiopia: "Africa", somalia: "Africa", sudan: "Africa",
    "south africa": "Africa", ghana: "Africa", "côte d'ivoire": "Africa", "dr congo": "Africa",
    tanzania: "Africa", uganda: "Africa", mozambique: "Africa", madagascar: "Africa", angola: "Africa",
    china: "Asia", india: "Asia", indonesia: "Asia", japan: "Asia", philippines: "Asia", pakistan: "Asia",
    bangladesh: "Asia", vietnam: "Asia", thailand: "Asia", myanmar: "Asia", nepal: "Asia", afghanistan: "Asia",
    iran: "Asia", iraq: "Asia", turkey: "Asia", "sri lanka": "Asia", malaysia: "Asia",
    germany: "Europe", france: "Europe", uk: "Europe", italy: "Europe", spain: "Europe", portugal: "Europe",
    netherlands: "Europe", belgium: "Europe", switzerland: "Europe", austria: "Europe", poland: "Europe",
    sweden: "Europe", norway: "Europe", denmark: "Europe", finland: "Europe", greece: "Europe",
    russia: "Europe", ukraine: "Europe", romania: "Europe", "united kingdom": "Europe",
    australia: "Oceania", "new zealand": "Oceania", fiji: "Oceania", "papua new guinea": "Oceania",
    "united states": "Americas", "united states of america": "Americas", canada: "Americas",
    mexico: "Americas", brazil: "Americas", argentina: "Americas", colombia: "Americas", chile: "Americas",
    peru: "Americas", venezuela: "Americas", ecuador: "Americas", guatemala: "Americas", cuba: "Americas",
    haiti: "Americas", "dominican republic": "Americas", bolivia: "Americas", paraguay: "Americas",
    uruguay: "Americas", "costa rica": "Americas", panama: "Americas", honduras: "Americas",
    "el salvador": "Americas", nicaragua: "Americas",
  }
  return mapping[country.toLowerCase()] || ""
}

export async function GET() {
  const [reliefweb, reliefwebAfrica, usgs, gdacs, gdelt] = await Promise.all([
    fetchReliefWeb(
      "https://api.reliefweb.int/v1/reports?appname=brevita&limit=15&sort[]=date.created:desc",
      "ReliefWeb"
    ),
    fetchReliefWeb(
      "https://api.reliefweb.int/v1/reports?appname=brevita&limit=10&sort[]=date.created:desc&filter[field]=primary_country.continent&filter[value]=Africa",
      "ReliefWeb"
    ),
    fetchUSGS(),
    fetchGDACS(),
    fetchGDELT(),
  ])

  let events = [...reliefweb, ...reliefwebAfrica, ...usgs, ...gdacs, ...gdelt]

  events = events.map((e) => ({
    ...e,
    continent: e.continent || toContinent(e.country),
  }))

  const byCountry: Record<string, number> = {}
  const byType: Record<string, number> = {}
  const byContinent: Record<string, number> = {}
  for (const e of events) {
    byCountry[e.country] = (byCountry[e.country] || 0) + 1
    byType[e.type] = (byType[e.type] || 0) + 1
    if (e.continent) byContinent[e.continent] = (byContinent[e.continent] || 0) + 1
  }

  return NextResponse.json({
    total: events.length,
    updatedAt: new Date().toISOString(),
    events,
    byCountry,
    byType,
    byContinent,
  })
}
