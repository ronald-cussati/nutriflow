export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skel" aria-hidden="true">
      <div className="skel-header">
        <div className="skel-bar" style={{ width: '38%', height: 22 }} />
        <div className="skel-bar" style={{ width: '58%', height: 13, marginTop: 8 }} />
      </div>
      <div className="skel-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="skel-card" key={i} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skel-row" key={i} />
      ))}
    </div>
  )
}
