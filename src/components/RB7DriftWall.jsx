import DriftWall from './DriftWall/DriftWall'

const items = [
  { image: '/images/gallery/gallery-01.jpg', title: '2011 Malaysian Grand Prix' },
  { image: '/images/gallery/gallery-02.jpg', title: 'RB7 on track' },
  { image: '/images/gallery/gallery-03.jpg', title: 'Monaco celebration' },
  { image: '/images/gallery/gallery-04.jpg', title: 'Red Bull Racing celebration' },
  { image: '/images/gallery/gallery-05.jpg', title: 'Team arrival' },
  { image: '/images/gallery/gallery-06.jpg', title: 'Pit lane' },
  { image: '/images/gallery/gallery-07.jpg', title: 'RB7 in motion' },
  { image: '/images/gallery/gallery-08.jpg', title: 'Wet race action' },
  { image: '/images/gallery/gallery-09.jpg', title: 'RB7 show run' },
  { image: '/images/gallery/gallery-10.jpg', title: 'Circuit pass' },
  { image: '/images/gallery/gallery-11.jpg', title: 'Red Bull Racing' },
  { image: '/images/gallery/gallery-12.jpg', title: 'Driver focus' },
  { image: '/images/gallery/gallery-13.jpg', title: 'Rain race' },
  { image: '/images/gallery/gallery-14.jpg', title: 'RB7 in the rain' },
  { image: '/images/gallery/gallery-15.jpg', title: 'Race helmet' },
  { image: '/images/gallery/gallery-16.jpg', title: 'Pit stop' },
  { image: '/images/gallery/gallery-17.jpg', title: 'Night racing' },
  { image: '/images/gallery/gallery-18.jpg', title: 'Night racing detail' },
  { image: '/images/gallery/gallery-19.jpg', title: 'RB7 at night' },
  { image: '/images/gallery/gallery-20.jpg', title: 'Championship celebration' },
  { image: '/images/gallery/gallery-21.jpg', title: 'RB7 display run' },
  { image: '/images/gallery/gallery-22.jpg', title: 'Podium finish' },
  { image: '/images/gallery/gallery-23.jpg', title: 'Singapore Grand Prix' },
  { image: '/images/gallery/gallery-24.jpg', title: 'Pool celebration' },
  { image: '/images/gallery/gallery-25.jpg', title: 'Victory lap' },
  { image: '/images/gallery/gallery-26.jpg', title: 'Malaysian GP podium' },
  { image: '/images/gallery/gallery-27.jpg', title: 'Sebastian Vettel RB7' },
  { image: '/images/gallery/gallery-28.jpg', title: 'RB7 team-mates' },
]

export default function RB7DriftWall({ sectionRef }) {
  return (
    <section ref={sectionRef} className="drift-wall-section" aria-label="Drift Wall showcase">
      <div className="drift-wall-stage">
        <DriftWall
          items={items}
          columns={9}
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
          fade={0}
          dim={0.95}
          overlayColor="transparent"
        />
      </div>
    </section>
  )
}
