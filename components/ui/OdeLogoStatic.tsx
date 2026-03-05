import React from "react";

interface OdeLogoStaticProps {
    width?: string | number;
    height?: string | number;
    className?: string;
}

/**
 * Static (non-animated) version of the Ode calligraphic logo.
 * Uses currentColor so it adapts to light/dark mode via Tailwind text color classes.
 */
export default function OdeLogoStatic({
    width = "100%",
    height = "auto",
    className = "",
}: OdeLogoStaticProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 500"
            width={width}
            height={height}
            className={className}
            aria-label="ode"
            role="img"
        >
            <defs>
                {/* Shadow for depth */}
                <filter id="navbar-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow
                        dx="2"
                        dy="4"
                        stdDeviation="3"
                        floodColor="currentColor"
                        floodOpacity="0.08"
                    />
                </filter>

                {/* Letter O path */}
                <path
                    id="nav-o"
                    pathLength="100"
                    d="
            M 360 140
            C 320 80, 240 120, 250 230
            C 260 340, 350 350, 380 270
            C 395 210, 375 160, 355 160
            C 335 160, 330 200, 350 240
            C 360 260, 380 270, 410 250
          "
                />

                {/* Letters de path */}
                <path
                    id="nav-de"
                    pathLength="100"
                    d="
            M 480 220
            C 450 180, 410 190, 410 250
            C 410 310, 460 320, 485 260
            C 500 180, 510 100, 510 70
            C 505 120, 495 200, 490 280
            C 485 330, 520 330, 550 280
            C 570 230, 550 200, 535 220
            C 520 240, 525 300, 555 310
            C 585 320, 620 300, 650 270
          "
                />
            </defs>

            <g
                style={{ transform: "translate(30px, 40px)" }}
                filter="url(#navbar-shadow)"
            >
                <rect
                    x="200"
                    y="50"
                    width="600"
                    height="400"
                    fill="none"
                    pointerEvents="none"
                />

                {/* O layers */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <use
                        key={`o-${i}`}
                        href="#nav-o"
                        x={i * 0.3}
                        y={i * -0.3}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.7}
                        strokeDasharray="100"
                        strokeDashoffset="0"
                    />
                ))}

                {/* de layers */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <use
                        key={`de-${i}`}
                        href="#nav-de"
                        x={i * 0.3}
                        y={i * -0.3}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.7}
                        strokeDasharray="100"
                        strokeDashoffset="0"
                    />
                ))}
            </g>
        </svg>
    );
}
