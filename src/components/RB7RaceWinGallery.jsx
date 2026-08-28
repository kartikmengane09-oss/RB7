import DriftWall from './DriftWall'
import './RB7RaceWinGallery.css'

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

const wallItems = RACE_WINS.map((win) => ({
  image: win.image,
  title: `${win.round} / ${win.race}`,
}))

export default function RB7RaceWinGallery({ galleryRef }) {
  return (
    <section ref={galleryRef} className="race-gallery" aria-label="2011 RB7 race win gallery">
      <header className="race-gallery-heading">
        <p className="section-kicker">RB7 / 2011</p>
        <h2>12 RACE WINS</h2>
      </header>

      <div className="race-gallery-wall">
        <DriftWall
          items={wallItems}
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
        />
      </div>
    </section>
  )
}
