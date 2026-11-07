export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-canvas"
    >
      <svg
        className="absolute -inset-[14%] h-[128%] w-[128%] opacity-[0.72]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="aurora-hot" x1="0" y1="0" x2="1" y2="0.7">
            <stop offset="0" stopColor="#FF2E9A" stopOpacity="0" />
            <stop offset="0.22" stopColor="#FF2E9A" stopOpacity="0.9" />
            <stop offset="0.58" stopColor="#FF0A78" stopOpacity="0.72" />
            <stop offset="0.82" stopColor="#B5179E" stopOpacity="0.4" />
            <stop offset="1" stopColor="#7B2CBF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aurora-soft" x1="0" y1="0.4" x2="1" y2="1">
            <stop offset="0" stopColor="#FF8AD2" stopOpacity="0" />
            <stop offset="0.28" stopColor="#FF5BB5" stopOpacity="0.65" />
            <stop offset="0.66" stopColor="#FF2E9A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FF2E9A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="aurora-deep" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B5179E" stopOpacity="0" />
            <stop offset="0.4" stopColor="#B5179E" stopOpacity="0.5" />
            <stop offset="0.7" stopColor="#FF0A78" stopOpacity="0.45" />
            <stop offset="1" stopColor="#FF2E9A" stopOpacity="0" />
          </linearGradient>
          <filter id="aurora-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="52" />
          </filter>
        </defs>

        <g filter="url(#aurora-blur)">
          <g className="aurora-drift">
            <path
              d="M-220 240C80 40 300 180 560 300C820 420 1040 250 1240 150C1420 60 1580 130 1700 260"
              stroke="url(#aurora-hot)"
              strokeWidth="150"
            />
            <path
              d="M-180 610C130 470 350 760 660 700C970 640 1120 430 1330 470C1490 500 1600 600 1700 690"
              stroke="url(#aurora-soft)"
              strokeWidth="135"
            />
          </g>
          <g className="aurora-drift-reverse">
            <path
              d="M300 -120C280 120 470 220 700 310C930 400 1080 520 1120 700C1150 850 1080 980 980 1060"
              stroke="url(#aurora-deep)"
              strokeWidth="115"
            />
            <path
              d="M-240 830C-20 720 220 850 390 950C540 1040 700 1060 860 980"
              stroke="url(#aurora-soft)"
              strokeWidth="95"
              opacity="0.7"
            />
          </g>
        </g>
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,rgba(5,3,6,0.22)_55%,rgba(5,3,6,0.82)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-canvas to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
    </div>
  );
}

export default AuroraBackground;
