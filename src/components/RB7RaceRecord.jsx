const RECORDS = [
  ['19', 'RACES'],
  ['12', 'WINS'],
  ['18', 'POLES'],
  ['27', 'PODIUMS'],
  ['3', 'FASTEST LAPS'],
]

export default function RB7RaceRecord({ recordRef }) {
  return (
    <section ref={recordRef} className="race-record" aria-label="RB7 race record">
      <p className="section-kicker">2011 CAMPAIGN</p>
      <h2>RACE RECORD</h2>
      <div className="race-record-grid">
        {RECORDS.map(([value, label]) => (
          <div key={label} className="race-record-stat">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
