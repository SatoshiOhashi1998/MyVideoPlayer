import QueuePanel from './QueuePanel.jsx'

export default function PlayerShell({ children, mode = 'watch' }) {
  return (
    <div className={`player-shell player-shell-${mode}`}>
      <section className="player-main">{children}</section>

      {mode === 'watch' && <QueuePanel />}
    </div>
  )
}