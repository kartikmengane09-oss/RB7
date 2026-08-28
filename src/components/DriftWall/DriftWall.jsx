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
  style,
  columnStyles = [],
}) => {
  const containerRef = useRef(null)
  const planeRef = useRef(null)
  const trackRefs = useRef([])
  const rafRef = useRef(null)
  const offsetsRef = useRef([])
  const velocitiesRef = useRef([])
  const hoveredColRef = useRef(-1)
  const wallHoveredRef = useRef(false)
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerDampedRef = useRef({ x: 0, y: 0 })
  const lastTsRef = useRef(null)

  const [containerHeight, setContainerHeight] = useState(600)
  const [activeId, setActiveId] = useState(null)
  const activeIdRef = useRef(null)
  const [reduced, setReduced] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = (event) => setIsMobile(event.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const effective = useMemo(() => {
    if (!isMobile) return { tileWidth, tileHeight, gap, radius, tilt, turn, perspective, depth }

    return {
      // 9 columns fit a 390–430px phone while remaining large enough to read
      // as photographs. The cylinder supplies the visual depth.
      tileWidth: 42,
      tileHeight: 28,
      gap: 4,
      radius: 5,
      tilt: 3,
      turn: 0,
      perspective: 900,
      depth: 0,
    }
  }, [isMobile, tileWidth, tileHeight, gap, radius, tilt, turn, perspective, depth])

  const columnItems = useMemo(() => {
    const cols = Array.from({ length: columns }, () => [])
    items.forEach((item, index) => cols[index % columns].push(item))
    return cols.map((column) => (column.length ? column : items.slice(0, 1)))
  }, [items, columns])

  const columnMeta = useMemo(() => {
    const unit = effective.tileHeight + effective.gap
    return columnItems.map((column) => {
      const copyHeight = Math.max(unit, column.length * unit)
      const copies = Math.max(4, Math.ceil((containerHeight * 3) / copyHeight) + 3)
      return { copyHeight, copies }
    })
  }, [columnItems, effective.tileHeight, effective.gap, containerHeight])

  useLayoutEffect(() => {
    if (!containerRef.current) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const baseVelocities = useMemo(() => {
    const directionSign = direction === 'up' ? 1 : -1
    return columnItems.map((_, columnIndex) => {
      const alternateSign = columnIndex % 2 === 0 ? 1 : -1
      return speed * columnFactor(columnIndex, variance) * directionSign * alternateSign
    })
  }, [columnItems, speed, direction, variance])

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, columnIndex) => meta.copyHeight * ((columnIndex * 0.37) % 1))
    velocitiesRef.current = columnItems.map(() => 0)
  }, [columnMeta, columnItems])

  const applyPlaneTransform = useCallback(
    (pointerX, pointerY) => {
      const plane = planeRef.current
      if (!plane) return
      plane.style.transform =
        `translate(-50%, -50%) scale(${isMobile ? 1 : 1.18}) ` +
        `rotateX(${effective.tilt + pointerY}deg) rotateY(${effective.turn + pointerX}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-effective.depth}px)`
    },
    [effective.tilt, effective.turn, effective.depth, isMobile, roll]
  )

  useEffect(() => {
    const animate = (timestamp) => {
      if (lastTsRef.current === null) lastTsRef.current = timestamp
      const deltaTime = Math.min(0.05, Math.max(0, timestamp - lastTsRef.current) / 1000)
      lastTsRef.current = timestamp

      const maxTilt = parallax * 8
      const targetX = pointerRef.current.x * maxTilt
      const targetY = -pointerRef.current.y * maxTilt
      const damping = 1 - Math.exp(-deltaTime / 0.12)
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damping
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damping
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y)

      for (let columnIndex = 0; columnIndex < trackRefs.current.length; columnIndex += 1) {
        const track = trackRefs.current[columnIndex]
        const meta = columnMeta[columnIndex]
        if (!track || !meta) continue

        if (!reduced) {
          const paused = wallHoveredRef.current && pauseOnHover
          const factor = paused || hoveredColRef.current === columnIndex ? 0 : 1
          const targetVelocity = baseVelocities[columnIndex] * factor
          const easing = 1 - Math.exp(-deltaTime / (targetVelocity === 0 ? 0.16 : 0.28))
          velocitiesRef.current[columnIndex] += (targetVelocity - velocitiesRef.current[columnIndex]) * easing
          let nextOffset = (offsetsRef.current[columnIndex] ?? 0) + velocitiesRef.current[columnIndex] * deltaTime
          nextOffset = ((nextOffset % meta.copyHeight) + meta.copyHeight) % meta.copyHeight
          offsetsRef.current[columnIndex] = nextOffset
        }

        track.style.transform = `translate3d(0, ${-(offsetsRef.current[columnIndex] ?? 0)}px, 0)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [applyPlaneTransform, baseVelocities, columnMeta, parallax, pauseOnHover, reduced])

  const activate = useCallback((id, index) => {
    activeIdRef.current = id
    hoveredColRef.current = index
    setActiveId(id)
  }, [])

  const release = useCallback(() => {
    activeIdRef.current = null
    hoveredColRef.current = -1
    setActiveId(null)
  }, [])

  const handlePointerMove = useCallback((event) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    if (parallax > 0 && !reduced) {
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      }
    }
    const hit = document.elementFromPoint(event.clientX, event.clientY)
    const tile = hit?.closest?.('[data-tile-id]')
    if (!tile) return
    const id = tile.dataset.tileId
    if (id === activeIdRef.current) return
    activeIdRef.current = id
    hoveredColRef.current = Number(tile.dataset.col)
    setActiveId(id)
  }, [parallax, reduced])

  const handlePointerLeaveWall = useCallback(() => {
    wallHoveredRef.current = false
    pointerRef.current = { x: 0, y: 0 }
    release()
  }, [release])

  const cssVars = useMemo(() => ({
    '--dw-tile-w': `${effective.tileWidth}px`,
    '--dw-tile-h': `${effective.tileHeight}px`,
    '--dw-gap': `${effective.gap}px`,
    '--dw-radius': `${effective.radius}px`,
    '--dw-perspective': `${effective.perspective}px`,
    '--dw-lift': `${lift}px`,
    '--dw-dim': dim,
    '--dw-gray': grayscale ? 1 : 0,
    '--dw-overlay': overlayColor,
    '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
    ...style,
  }), [effective, lift, dim, grayscale, overlayColor, fade, style])

  const renderTile = (item, id, columnIndex) => {
    const inner = (
      <span className="drift-wall__inner">
        <img src={item.image} alt={item.title ?? ''} loading="lazy" decoding="async" draggable={false} />
        <span className="drift-wall__overlay" aria-hidden="true" />
      </span>
    )
    const commonProps = {
      className: `drift-wall__tile${activeId === id ? ' is-active' : ''}`,
      'data-tile-id': id,
      'data-col': columnIndex,
      onFocus: () => activate(id, columnIndex),
      onBlur: release,
    }

    if (item.href) {
      return <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>{inner}</a>
    }

    return <div key={id} tabIndex={0} role="button" aria-label={item.title ?? 'tile'} {...commonProps}>{inner}</div>
  }

  const rootClass = ['drift-wall', reduced ? 'drift-wall--reduced' : '', className].filter(Boolean).join(' ')

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { wallHoveredRef.current = true }}
      onPointerLeave={handlePointerLeaveWall}
      role="group"
      aria-label="Drifting wall of tiles"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((column, columnIndex) => {
          const meta = columnMeta[columnIndex]
          const copies = Array.from({ length: meta.copies })
          const customColumnStyle = columnStyles[columnIndex] || {}
          return (
            <div className="drift-wall__col" key={`col-${columnIndex}`} style={customColumnStyle}>
              <div className="drift-wall__track" ref={(element) => { trackRefs.current[columnIndex] = element }}>
                {copies.map((_, copyIndex) => column.map((item, itemIndex) => renderTile(item, `${columnIndex}-${copyIndex}-${itemIndex}`, columnIndex)))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DriftWall
