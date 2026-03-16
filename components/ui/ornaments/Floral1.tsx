import type { FC, SVGProps } from 'react'

type OrnamentProps = SVGProps<SVGSVGElement>

/**
 * Floral-1 — A refined typographic fleuron (❧) inspired by classical French printing.
 * Symmetrical heart-shaped vine with curling tendrils and a central bud.
 * Perfect for the "Amour" category.
 */
const Floral1: FC<OrnamentProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Central stem */}
        <path d="M32 56 V36" />

        {/* Central bud / bloom */}
        <circle cx="32" cy="28" r="3.5" fill="currentColor" opacity="0.15" />
        <path d="M32 24.5 C32 20 28 17 28 13 C28 9 32 8 32 8 C32 8 36 9 36 13 C36 17 32 20 32 24.5Z" fill="currentColor" opacity="0.12" />

        {/* Left vine */}
        <path d="M32 36 C26 34 18 30 14 22 C12 18 14 14 18 14 C22 14 24 18 22 22" />
        <path d="M18 14 C16 10 18 6 22 6 C26 6 26 10 24 12" />

        {/* Left tendril curls */}
        <path d="M22 22 C20 26 16 26 14 24" />
        <path d="M14 22 C10 20 8 22 9 25" />

        {/* Right vine (mirrored) */}
        <path d="M32 36 C38 34 46 30 50 22 C52 18 50 14 46 14 C42 14 40 18 42 22" />
        <path d="M46 14 C48 10 46 6 42 6 C38 6 38 10 40 12" />

        {/* Right tendril curls */}
        <path d="M42 22 C44 26 48 26 50 24" />
        <path d="M50 22 C54 20 56 22 55 25" />

        {/* Small leaf accents on stem */}
        <path d="M32 44 C28 42 26 44 28 46" />
        <path d="M32 48 C36 46 38 48 36 50" />
    </svg>
)

export default Floral1
