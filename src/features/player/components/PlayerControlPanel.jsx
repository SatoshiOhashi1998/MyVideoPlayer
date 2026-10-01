export default function PlayerControlPanel({
  title,
  onClose,
  children,
  className = '',
}) {
  return (
    <div className={`player-control-panel ${className}`.trim()}>
      <div className="player-control-panel-header">
        <span>{title}</span>

        <button
          className="player-control-panel-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="player-control-panel-content">
        {children}
      </div>
    </div>
  )
}