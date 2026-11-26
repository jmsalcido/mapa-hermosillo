// Atlas skin decoration over the map: an inked double frame and a compass rose.
// Purely ornamental (pointer-events: none); drawn here, not copied from any map or book.

export function AtlasOverlay() {
  return (
    <div className="atlas-overlay" aria-hidden="true">
      <div className="atlas-frame" />
      <svg className="atlas-compass" viewBox="-60 -60 120 120">
        <circle r="44" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle r="40" fill="none" stroke="currentColor" strokeWidth=".6" strokeDasharray="1.5 2.5" />
        <circle r="26" fill="none" stroke="currentColor" strokeWidth=".6" />
        {/* eight-point star: long cardinal points, short diagonals, half shaded like an engraving */}
        {[0, 90, 180, 270].map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 -52 L7 -7 L0 0Z" fill="currentColor" />
            <path d="M0 -52 L-7 -7 L0 0Z" fill="none" stroke="currentColor" strokeWidth="1" />
          </g>
        ))}
        {[45, 135, 225, 315].map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 -32 L5 -5 L0 0Z" fill="currentColor" opacity=".75" />
            <path d="M0 -32 L-5 -5 L0 0Z" fill="none" stroke="currentColor" strokeWidth=".8" />
          </g>
        ))}
        <circle r="3" fill="currentColor" />
        <text y="-54" textAnchor="middle" fontSize="11">N</text>
      </svg>
    </div>
  )
}
