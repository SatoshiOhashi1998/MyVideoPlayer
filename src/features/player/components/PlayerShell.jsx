import QueuePanel from './QueuePanel.jsx'

export default function PlayerShell({ children }) {
  return (
    <div className="player-shell">
      <section className="player-main">
        {children}
      </section>
      <QueuePanel />
    </div>
  )
}
