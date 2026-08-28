import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './DriftWall.css'

const DEFAULT_ITEMS = Array.from({ length: 15 }, (_, i) => {
  const ids = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164]
  return {
    image: `https://picsum.photos/id/${ids[i % ids.length]}/600/400`,
    title: `Tile ${i + 1}`,
    href: undefined,
  }
})

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const columnFactor = (index, variance) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1
  return 1 + variance * pseudo
}

const DriftWall = ({
  items = DEFAULT_ITEMS,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = '#060010',
  className = '',
}) => {
  const rootRef = useRef(null)
  const colRefs = useRef([])
  const [hovered, setHovered] = useState(null)
  const [paused, setPaused] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(prefersReducedMotion())
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReducedMotion(media.matches)
    media.addEventListener?.('change', handler)
    return () => media.removeEventListener?.('change', handler)
  }, [])

  const grouped = useMemo(() => {
    const result = Array.from({ length: Math.max(1, columns) }, () => [])
    items.forEach((item, index) => result[index % result.length].push({ ...item, index }))
    return result
  }, [items, columns])

  const factors = useMemo(
    () => grouped.map((_, index) => columnFactor(index, variance)),
    [grouped, variance]
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const cleanups = colRefs.current.map((column, index) => {
      if (!column) return () => {}
      const factor = factors[index] ?? 1
      const multiplier = direction === 'down' ? 1 : -1
      const distance = Math.max(240, tileHeight * Math.max(1, grouped[index]?.length || 1) + gap * 2)
      let offset = index % 2 === 0 ? 0 : -distance * 0.5
      let last = performance.now()
      let frame = 0

      const tick = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        if (!paused && !reducedMotion) {
          offset += multiplier * speed * factor * dt
          if (offset <= -distance) offset += distance
          if (offset >= 0) offset -= distance
          column.style.setProperty('--drift-offset', `${offset}px`)
        }
        frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(frame)
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [direction, fade, gap, grouped, factors, paused, reducedMotion, speed, tileHeight])

  const handlePointerMove = useCallback((event) => {
    if (!rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    setPointer({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }, [])

  const pointerStyle = {
    '--pointer-x': `${pointer.x * parallax}deg`,
    '--pointer-y': `${pointer.y * parallax}deg`,
    '--wall-tilt': `${tilt}deg`,
    '--wall-turn': `${turn}deg`,
    '--wall-roll': `${roll}deg`,
    '--wall-perspective': `${perspective}px`,
    '--wall-depth': `${depth}px`,
    '--tile-width': `${tileWidth}px`,
    '--tile-height': `${tileHeight}px`,
    '--tile-gap': `${gap}px`,
    '--tile-radius': `${radius}px`,
    '--tile-lift': `${lift}px`,
    '--tile-dim': dim,
    '--tile-fade': fade,
    '--overlay-color': overlayColor,
    '--tile-grayscale': grayscale ? 1 : 0,
  }

  return (
    <div
      ref={rootRef}
      className={`drift-wall ${className}`}
      style={pointerStyle}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => {
        if (pauseOnHover) setPaused(false)
        setHovered(null)
        setPointer({ x: 0, y: 0 })
      }}
    >
      <div className="drift-wall__stage">
        {grouped.map((columnItems, columnIndex) => (
          <div
            className="drift-wall__column"
            key={columnIndex}
            ref={(node) => {
              colRefs.current[columnIndex] = node
            }}
          >
            {[...columnItems, ...columnItems].map((item, copyIndex) => {
              const key = `${item.index}-${copyIndex}`
              const isHovered = hovered === item.index
              const content = (
                <article
                  className={`drift-wall__tile${isHovered ? ' is-hovered' : ''}`}
                  style={{ '--tile-index': item.index }}
                  onPointerEnter={() => setHovered(item.index)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <img src={item.image} alt={item.title || ''} loading="lazy" draggable="false" />
                  <span className="drift-wall__overlay" />
                  {item.title && <span className="drift-wall__title">{item.title}</span>}
                </article>
              )
              return item.href ? (
                <a className="drift-wall__link" href={item.href} key={key}>
                  {content}
                </a>
              ) : (
                <div className="drift-wall__link" key={key}>{content}</div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DriftWall
