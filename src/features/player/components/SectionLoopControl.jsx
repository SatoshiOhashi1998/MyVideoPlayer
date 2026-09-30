export default function SectionLoopControl({
  visible,
  isSectionLoop,
  toggleSectionLoop,
  startInput,
  setStartInput,
  handleStartBlur,
  endInput,
  setEndInput,
  handleEndBlur,
}) {
  if (!visible) {
    return null
  }

  return (
    <div className="section-loop-control">
      <button
        className={isSectionLoop ? 'active' : ''}
        onClick={toggleSectionLoop}
      >
        {isSectionLoop ? '区間ループON' : '区間ループOFF'}
      </button>

      <label>
        開始
        <input
          value={startInput}
          onChange={(event) => setStartInput(event.target.value)}
          onBlur={handleStartBlur}
        />
      </label>

      <label>
        終了
        <input
          value={endInput}
          onChange={(event) => setEndInput(event.target.value)}
          onBlur={handleEndBlur}
        />
      </label>
    </div>
  )
}