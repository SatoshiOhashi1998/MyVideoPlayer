export default function SectionLoopControl({
  startInput,
  setStartInput,
  handleStartBlur,
  endInput,
  setEndInput,
  handleEndBlur,
  visible,
}) {
  if (!visible) return null

  return (
    <div className="section-loop-inputs">
      <label>
        開始:
        <input
          type="text"
          value={startInput}
          onChange={(event) => setStartInput(event.target.value)}
          onBlur={handleStartBlur}
          placeholder="00:00:00"
        />
      </label>
      <label>
        終了:
        <input
          type="text"
          value={endInput}
          onChange={(event) => setEndInput(event.target.value)}
          onBlur={handleEndBlur}
          placeholder="00:00:00"
        />
      </label>
    </div>
  )
}
