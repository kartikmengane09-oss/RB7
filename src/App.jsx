import { useRef } from 'react'
import { useProgress } from '@react-three/drei'
import Experience from './three/Experience'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import RB7TechnicalInfo from './components/RB7TechnicalInfo'
import RB7RaceRecord from './components/RB7RaceRecord'
import RB7DriftWall from './components/RB7DriftWall'
import './styles/mobile-responsive.css'

function LoadingScreen() {
  const { active, progress } = useProgress()

  if (!active && progress === 100) return null

  return (
    <div className="loading-screen" aria-live="polite">
      <span className="loading-title">RB7</span>
      <span className="loading-label">LOADING EXPERIENCE</span>
      <span className="loading-progress">{Math.round(progress)}%</span>
    </div>
  )
}

export default function App() {
  useSmoothScroll()

  const rb7Ref = useRef(null)
  const heroUiRef = useRef(null)
  const technicalLeftRef = useRef(null)
  const technicalRightRef = useRef(null)
  const raceRecordRef = useRef(null)
  const driftWallRef = useRef(null)

  return (
    <>
      <main className="experience-page">
        <img className="red-bull-symbol" src="/images/red-bull-symbol.png" alt="" aria-hidden="true" />

        <Experience
          rb7Ref={rb7Ref}
          heroUiRef={heroUiRef}
          technicalLeftRef={technicalLeftRef}
          technicalRightRef={technicalRightRef}
          raceRecordRef={raceRecordRef}
          driftWallRef={driftWallRef}
        />

        <div className="hero-overlay" aria-label="Red Bull RB7, 2011">
          <div ref={heroUiRef} className="hero-primary-ui">
            <div className="hero-mark">
              <span className="hero-name">RB7</span>
              <span className="hero-year">2011</span>
            </div>
            <span className="team-label">RED BULL RACING</span>
            <span className="season-label">—&nbsp;&nbsp;2011 SEASON</span>
            <div className="drive-prompt">
              <span>SCROLL TO DRIVE</span>
              <span className="down-arrow">↓</span>
            </div>
            <span className="built-label">BUILT TO WIN&nbsp;&nbsp;—</span>
          </div>

          <RB7TechnicalInfo leftPanelRef={technicalLeftRef} rightPanelRef={technicalRightRef} />
          <RB7RaceRecord recordRef={raceRecordRef} />
        </div>

        <RB7DriftWall sectionRef={driftWallRef} />
        <LoadingScreen />
      </main>
    </>
  )
}
