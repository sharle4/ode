"use client";

import React from "react";

interface OdeLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const OdeLogo = React.memo(function OdeLogo({
  className = "",
  width = "100%",
  height = "100%",
}: OdeLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 500"
      width={width}
      height={height}
      className={className}
      aria-labelledby="odeLogoTitle"
      role="img"
    >
      <title id="odeLogoTitle">ode</title>
      <defs>
        <linearGradient id="ink-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#e4e4e7" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter
          id="luxury-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="2"
            dy="4"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.12"
          />
        </filter>
        <path
          id="ode-o"
          pathLength={100}
          d="M 360 140 C 320 80, 240 120, 250 230 C 260 340, 350 350, 380 270 C 395 210, 375 160, 355 160 C 335 160, 330 200, 350 240 C 360 260, 380 270, 410 250"
        />
        <path
          id="ode-de"
          pathLength={100}
          d="M 480 220 C 450 180, 410 190, 410 250 C 410 310, 460 320, 485 260 C 500 180, 510 100, 510 70 C 505 120, 495 200, 490 280 C 485 330, 520 330, 550 280 C 570 230, 550 200, 535 220 C 520 240, 525 300, 555 310 C 585 320, 620 300, 650 270"
        />
      </defs>
      <style>
        {`
          .calligraphy-group {
            transform: translate(30px, 40px);
            filter: url(#luxury-shadow);
          }
          .ink-path {
            fill: none;
            stroke: url(#ink-gradient);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            opacity: 0.7;
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          .anim-o {
            animation: drawO 8s cubic-bezier(0.35, 0.0, 0.25, 1) infinite;
          }
          .anim-de {
            animation: drawDE 8s cubic-bezier(0.35, 0.0, 0.25, 1) infinite;
          }
          @keyframes drawO {
            0%   { stroke-dashoffset: 100; opacity: 0; }
            4%   { stroke-dashoffset: 100; opacity: 0.7; }
            20%  { stroke-dashoffset: 0; opacity: 0.7; }
            85%  { stroke-dashoffset: 0; opacity: 0.7; }
            95%  { stroke-dashoffset: 100; opacity: 0.7; }
            100% { stroke-dashoffset: 100; opacity: 0; }
          }
          @keyframes drawDE {
            0%   { stroke-dashoffset: 100; opacity: 0; }
            21%  { stroke-dashoffset: 100; opacity: 0; }
            22%  { stroke-dashoffset: 100; opacity: 0.7; }
            42%  { stroke-dashoffset: 0; opacity: 0.7; }
            75%  { stroke-dashoffset: 0; opacity: 0.7; }
            85%  { stroke-dashoffset: 100; opacity: 0.7; }
            100% { stroke-dashoffset: 100; opacity: 0; }
          }
        `}
      </style>
      <g className="calligraphy-group">
        <rect
          x="200"
          y="50"
          width="600"
          height="400"
          fill="none"
          pointerEvents="none"
        />
        {[...Array(15)].map((_, i) => (
          <use
            key={`o-${i}`}
            href="#ode-o"
            x={i * 0.3}
            y={i * -0.3}
            className="ink-path anim-o"
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <use
            key={`de-${i}`}
            href="#ode-de"
            x={i * 0.3}
            y={i * -0.3}
            className="ink-path anim-de"
          />
        ))}
      </g>
    </svg>
  );
});

export default OdeLogo;
