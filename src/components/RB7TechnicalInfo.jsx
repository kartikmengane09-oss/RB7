export default function RB7TechnicalInfo({ leftPanelRef, rightPanelRef }) {
  return (
    <>
      <section ref={leftPanelRef} className="technical-info technical-story" aria-label="RB7 season overview">
        <p className="technical-team">RED BULL RACING</p>
        <h2>2011 SEASON</h2>
        <span className="technical-rule" />
        <p className="technical-copy">
          The RB7 marked the beginning of a new era. Designed by Adrian Newey, it
          delivered unmatched performance and consistency throughout the 2011
          Formula One World Championship.
        </p>
      </section>

      <section ref={rightPanelRef} className="technical-info technical-highlights" aria-label="Technical highlights">
        <h2>TECHNICAL HIGHLIGHTS</h2>
        <dl>
          <div><dt>CHASSIS</dt><dd>Carbon Fibre Monocoque</dd></div>
          <div><dt>ENGINE</dt><dd>Renault RS27-2011<br />2.4L V8</dd></div>
          <div><dt>POWER</dt><dd>~750 HP</dd></div>
          <div><dt>GEARBOX</dt><dd>7-Speed Semi-Automatic</dd></div>
          <div><dt>WEIGHT</dt><dd>640 kg</dd></div>
          <div><dt>DRS</dt><dd>Adjustable Rear Wing</dd></div>
        </dl>
      </section>
    </>
  )
}
