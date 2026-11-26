// A CK3-style "portrait" for a county: a small desert vignette whose number and height of
// houses come from the AGEB's census density. It is an illustration, labelled as such.

function rng(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), ((h >>> 0) % 10000) / 10000)
}

export function Portrait({ seed, densityRank, color }: { seed: string; densityRank: number | null; color: string }) {
  const r = rng(seed)
  const n = densityRank == null ? 0 : 2 + Math.round(densityRank * 12) // 0..1 → 2..14 houses
  const houses = Array.from({ length: n }, (_, i) => {
    const w = 14 + r() * 10
    const h = 10 + r() * (6 + densityRank! * 22)
    const x = 8 + ((i * 173) % 9) * 15 + r() * 6
    const y = 92 - (i % 3) * 6
    return { x, y, w, h, roof: r() > 0.6, shade: 0.75 + r() * 0.25 }
  }).sort((a, b) => a.y - b.y)
  const hills = `M0 70 C 30 ${48 + r() * 8}, 50 ${52 + r() * 8}, 80 62 S 130 ${44 + r() * 10}, 170 60 L170 110 L0 110Z`
  return (
    <svg viewBox="0 0 170 110" className="portrait" role="img" aria-label="">
      <defs>
        <linearGradient id={`sky${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c27b" />
          <stop offset="1" stopColor="#f8e6c2" />
        </linearGradient>
      </defs>
      <rect width="170" height="110" fill={`url(#sky${seed})`} />
      <circle cx={120 + r() * 30} cy={24} r={11} fill="#fff3cf" opacity=".9" />
      <path d={hills} fill="#c99e6c" opacity=".7" />
      <path d="M0 84 C 40 76, 90 80, 170 74 L170 110 L0 110Z" fill="#d9b886" />
      {houses.map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y})`}>
          <rect x={0} y={-h.h} width={h.w} height={h.h} fill={color} opacity={h.shade} stroke="#2a1d12" strokeWidth="1" />
          <rect x={0} y={-h.h} width={h.w} height={h.h} fill="#fff" opacity=".35" />
          {h.roof ? (
            <path d={`M-1 ${-h.h} L${h.w / 2} ${-h.h - 6} L${h.w + 1} ${-h.h}Z`} fill="#a35a3c" stroke="#2a1d12" strokeWidth="1" />
          ) : (
            <rect x={-1} y={-h.h - 2} width={h.w + 2} height={2.5} fill="#e9dcc0" stroke="#2a1d12" strokeWidth=".8" />
          )}
          <rect x={h.w / 2 - 2} y={-6} width={4} height={6} fill="#3a2717" />
        </g>
      ))}
      {n === 0 && <text x="85" y="70" textAnchor="middle" fontSize="10" fill="#5a4630">∅</text>}
      <rect width="170" height="110" fill="none" stroke="#2a1d12" strokeWidth="3" />
    </svg>
  )
}
