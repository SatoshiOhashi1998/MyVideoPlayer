import MediaCard from './MediaCard.jsx'

export default function MediaGrid({ items, addedId, onSelect, onAddQueue }) {
  return (
    <div className="media-grid">
      {items.map((media) => (
        <MediaCard
          key={`${media.type}-${media.id}`}
          media={media}
          added={addedId === media.id}
          onSelect={onSelect}
          onAddQueue={onAddQueue}
        />
      ))}
    </div>
  )
}
