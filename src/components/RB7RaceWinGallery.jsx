const RACE_WINS = [
  { round: '01', race: 'AUSTRALIA', location: 'Melbourne', winner: 'Sebastian Vettel', image: '/images/rb7/australia.jpg' },
  { round: '02', race: 'MALAYSIA', location: 'Sepang', winner: 'Sebastian Vettel', image: '/images/rb7/malaysia.jpg' },
  { round: '04', race: 'TURKEY', location: 'Istanbul', winner: 'Sebastian Vettel', image: '/images/rb7/turkey.jpg' },
  { round: '05', race: 'SPAIN', location: 'Barcelona', winner: 'Sebastian Vettel', image: '/images/rb7/spain.jpg' },
  { round: '06', race: 'MONACO', location: 'Monte Carlo', winner: 'Sebastian Vettel', image: '/images/rb7/monaco.jpg' },
  { round: '08', race: 'EUROPE', location: 'Valencia', winner: 'Sebastian Vettel', image: '/images/rb7/europe.jpg' },
  { round: '12', race: 'BELGIUM', location: 'Spa-Francorchamps', winner: 'Sebastian Vettel', image: '/images/rb7/belgium.jpg' },
  { round: '13', race: 'ITALY', location: 'Monza', winner: 'Sebastian Vettel', image: '/images/rb7/italy.jpg' },
  { round: '14', race: 'SINGAPORE', location: 'Marina Bay', winner: 'Sebastian Vettel', image: '/images/rb7/singapore.jpg' },
  { round: '16', race: 'SOUTH KOREA', location: 'Yeongam', winner: 'Sebastian Vettel', image: '/images/rb7/south-korea.jpg' },
  { round: '17', race: 'INDIA', location: 'Buddh International Circuit', winner: 'Sebastian Vettel', image: '/images/rb7/india.jpg' },
  { round: '19', race: 'BRAZIL', location: 'Interlagos', winner: 'Mark Webber', image: '/images/rb7/brazil.jpg' },
]

export default function RB7RaceWinGallery({ galleryRef }) {
  return (
    <section ref={galleryRef} className="race-gallery" aria-label="2011 RB7 race win gallery">
      <header className="race-gallery-heading">
        <p className="section-kicker">RB7 / 2011</p>
        <h2>12 RACE WINS</h2>
      </header>
      <div className="race-gallery-wall">
        {RACE_WINS.map((win, index) => (
          <article key={win.round} className="race-tile" style={{ '--tile-index': index }}>
            <div className="race-tile-image" style={{ backgroundImage: `url(${win.image})` }} />
            <div className="race-tile-shade" />
            <div className="race-tile-copy">
              <span>ROUND {win.round}</span>
              <h3>{win.race}</h3>
              <p>{win.location}</p>
              <strong>P1</strong>
              <small>{win.winner}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
