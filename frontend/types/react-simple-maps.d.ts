declare module "react-simple-maps" {
  import { ComponentProps, FC } from "react"

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, any>
    style?: React.CSSProperties
    children?: React.ReactNode
  }
  export const ComposableMap: FC<ComposableMapProps>

  interface GeographiesProps {
    geography: string | Record<string, any>
    children: (data: { geographies: any[] }) => React.ReactNode
  }
  export const Geographies: FC<GeographiesProps>

  interface GeographyProps {
    geography: any
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onMouseEnter?: (e: React.MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (e: React.MouseEvent<SVGPathElement>) => void
    onClick?: (e: React.MouseEvent<SVGPathElement>) => void
  }
  export const Geography: FC<GeographyProps>

  interface MarkerProps {
    coordinates: [number, number]
    children?: React.ReactNode
    onClick?: () => void
  }
  export const Marker: FC<MarkerProps>
}
