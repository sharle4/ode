import type { FC, SVGProps } from 'react'
import Floral1 from './Floral1'

type OrnamentProps = SVGProps<SVGSVGElement>

/**
 * Registry mapping `ornament_id` (stored in Supabase) to React SVG components.
 * 
 * To add a new ornament:
 * 1. Create a new file in this directory (e.g. `Arabesque1.tsx`)
 * 2. Add the mapping below: `'arabesque-1': Arabesque1`
 * 3. That's it — the admin panel and public pages will pick it up automatically.
 */
export const ORNAMENT_REGISTRY: Record<string, FC<OrnamentProps>> = {
    'floral-1': Floral1,
}

/**
 * All available ornament IDs for use in pickers.
 */
export const ORNAMENT_IDS = Object.keys(ORNAMENT_REGISTRY)

/**
 * Renders the ornament for a given ID. Returns null if the ID is unknown.
 */
export function OrnamentIcon({ id, ...props }: { id: string | null | undefined } & OrnamentProps) {
    if (!id) return null
    const Component = ORNAMENT_REGISTRY[id]
    if (!Component) return null
    return <Component {...props} />
}
