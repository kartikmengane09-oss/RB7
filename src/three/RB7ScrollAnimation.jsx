import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Vector3 } from 'three'

gsap.registerPlugin(ScrollTrigger)

const INITIAL_TARGET = { x: 0, y: 0.06, z: 0.55 }

const SIDE_CAMERA_X = 6
const SIDE_CAMERA_Y = 0
const SIDE_CAMERA_Z = 0.7
const SIDE_TARGET_X = 0
const SIDE_TARGET_Y = 0.6
const SIDE_TARGET_Z = 0.15
const MOBILE_CAR_SCALE = 0.85

const DRIVE_DISTANCE = 0.6
const WHEEL_RADIUS = 0.30
const WHEEL_SPIN_SPEED = 4.0
const DRIVE_START = 1.5
const DRIVE_DURATION = 2.5
const FINAL_SECTION_END = DRIVE_START + DRIVE_DURATION
const RACE_TRANSITION_DURATION = 0.5
const RACE_RECORD_HOLD_DURATION = 0.55
const GALLERY_ENTRANCE_DURATION = 0.95
const VIEWPORT_GUTTER = 32
const RACE_TRANSITION_START = FINAL_SECTION_END
const RACE_RECORD_HOLD_START = RACE_TRANSITION_START + RACE_TRANSITION_DURATION
const GALLERY_ENTRANCE_START = RACE_RECORD_HOLD_START + RACE_RECORD_HOLD_DURATION

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth <= 767

export default function RB7ScrollAnimation({
  rb7Ref,
  heroUiRef,
  technicalLeftRef,
  technicalRightRef,
  raceRecordRef,
  driftWallRef,
}) {
  const { camera } = useThree()
  const target = useRef({ ...INITIAL_TARGET })
  const targetVector = useRef(new Vector3())
  const carZ = useRef(0)
  const driveProgress = useRef(0)
  const driveTrigger = useRef(null)
  const wheelSpin = useRef(0)
  const lastTimelineTime = useRef(0)
  const transitionWheelSpin = useRef(0)
  const initialCarZ = useRef(0)

  useFrame(() => {
    const model = rb7Ref?.current
    if (!model) return

    if (model.group) model.group.position.z = 0

    // Wheel rotation is driven by the master GSAP timeline below.
    // This preserves the wheel-spin animation from the supplied working file.
    const wheelPivots = model.wheelPivots
    if (wheelPivots) {
      Object.values(wheelPivots).forEach((wheelData) => {
        if (!wheelData?.pivot) return
        wheelData.pivot.rotation.x = wheelSpin.current
      })
    }

    // Keep the complete side-view RB7 inside narrow phone viewports.
    // Desktop camera composition remains unchanged.
    if (isMobileViewport() && camera.position.x > 4) {
      const width = window.innerWidth
      const height = window.innerHeight || 1
      const aspect = width / height
      const baseFit = Math.min(1.55, Math.max(1, 0.72 / Math.max(aspect, 0.01)))
      const fit = baseFit / MOBILE_CAR_SCALE
      camera.position.x = SIDE_CAMERA_X * fit
      camera.position.z = SIDE_CAMERA_Z * fit
      camera.fov = Math.min(58, 32 + (1 - Math.min(aspect, 1)) * 24)
      camera.updateProjectionMatrix()
    } else if (!isMobileViewport() && camera.fov !== 32) {
      camera.fov = 32
      camera.updateProjectionMatrix()
    }

    if (carZ.current !== 0) {
      const mobile = isMobileViewport()
      const aspect = mobile
        ? window.innerWidth / (window.innerHeight || 1)
        : 1
      const baseFit = mobile
        ? Math.min(1.55, Math.max(1, 0.72 / Math.max(aspect, 0.01)))
        : 1
      const fit = mobile ? baseFit / MOBILE_CAR_SCALE : 1

      camera.position.x = SIDE_CAMERA_X * fit
      camera.position.y = SIDE_CAMERA_Y
      camera.position.z = SIDE_CAMERA_Z * fit
      target.current.x = SIDE_TARGET_X
      target.current.y = SIDE_TARGET_Y
      target.current.z = SIDE_TARGET_Z
    }

    targetVector.current.set(target.current.x, target.current.y, target.current.z)
    camera.lookAt(targetVector.current)
  })

  useLayoutEffect(() => {
    const model = rb7Ref?.current

    camera.position.set(0, 0.83, 5.27)
    camera.fov = 32
    camera.updateProjectionMatrix()
    Object.assign(target.current, INITIAL_TARGET)

    carZ.current = 0
    driveProgress.current = 0
    wheelSpin.current = 0
    lastTimelineTime.current = 0
    transitionWheelSpin.current = 0
    initialCarZ.current = model?.position?.z ?? 0

    const context = gsap.context(() => {
      const heroUi = heroUiRef?.current
      const technicalLeft = technicalLeftRef?.current
      const technicalRight = technicalRightRef?.current
      const raceRecord = raceRecordRef?.current
      const driftWall = driftWallRef?.current
      const driftWallColumns = driftWall
        ? Array.from(driftWall.querySelectorAll('.drift-wall__col'))
        : []

      const mobile = isMobileViewport()
      const technicalStoryStartX = mobile ? 0 : 300
      const technicalHighlightsStartX = mobile ? 0 : 900

      if (heroUi) gsap.set(heroUi, { autoAlpha: 1 })

      if (technicalLeft) {
        gsap.set(technicalLeft, {
          autoAlpha: 0,
          x: technicalStoryStartX,
        })
      }

      if (technicalRight) {
        gsap.set(technicalRight, {
          autoAlpha: 0,
          x: technicalHighlightsStartX,
          y: mobile ? 0 : -300,
        })
      }

      if (raceRecord) {
        gsap.set(raceRecord, {
          autoAlpha: 1,
          x: () => -raceRecord.getBoundingClientRect().right - VIEWPORT_GUTTER,
        })
      }

      if (driftWall) gsap.set(driftWall, { xPercent: 0 })

      if (driftWallColumns.length) {
        gsap.set(driftWallColumns, {
          yPercent: (index) => index % 2 === 0 ? 130 : -130,
        })
      }

      const exitRight = (element) => {
        const rect = element.getBoundingClientRect()
        const currentX = Number(gsap.getProperty(element, 'x')) || 0
        return currentX + window.innerWidth - rect.left + VIEWPORT_GUTTER
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.experience-page',
          start: 'top top',
          end: '+=1385%',
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'none' },
      })

      timeline.to(camera.position, { x: 0, y: 0.82, z: 4.55, duration: 0.20 }, 0)
      timeline.to(target.current, { x: 0, y: 0.10, z: 0.60, duration: 0.20 }, 0)

      timeline.to(camera.position, { x: 2.7, y: 1.05, z: 2.75, duration: 0.25 }, 0.20)
      timeline.to(target.current, { x: 0, y: 0.24, z: 0.40, duration: 0.25 }, 0.20)

      timeline.to(camera.position, {
        x: SIDE_CAMERA_X,
        y: SIDE_CAMERA_Y,
        z: SIDE_CAMERA_Z,
        duration: 0.30,
      }, 0.45)
      timeline.to(target.current, {
        x: SIDE_TARGET_X,
        y: SIDE_TARGET_Y,
        z: SIDE_TARGET_Z,
        duration: 0.30,
      }, 0.45)

      timeline.to(camera.position, {
        x: SIDE_CAMERA_X,
        y: SIDE_CAMERA_Y,
        z: SIDE_CAMERA_Z,
        duration: 0.13,
      }, 0.75)
      timeline.to(target.current, {
        x: SIDE_TARGET_X,
        y: SIDE_TARGET_Y,
        z: SIDE_TARGET_Z,
        duration: 0.13,
      }, 0.75)

      if (heroUi) {
        timeline.to(heroUi, {
          autoAlpha: 0,
          duration: 0.12,
          ease: 'power2.out',
        }, 0.76)
      }

      if (technicalLeft) {
        timeline.to(technicalLeft, {
          autoAlpha: 1,
          x: 0,
          duration: 0.2,
          ease: 'power2.out',
        }, 0.88)
      }

      if (technicalRight) {
        timeline.to(technicalRight, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.2,
          ease: 'power2.out',
        }, 0.90)
      }

      timeline.to(camera.position, {
        x: SIDE_CAMERA_X,
        y: SIDE_CAMERA_Y,
        z: SIDE_CAMERA_Z,
        duration: 0.06,
      }, 0.90)
      timeline.to(target.current, {
        x: SIDE_TARGET_X,
        y: SIDE_TARGET_Y,
        z: SIDE_TARGET_Z,
        duration: 0.06,
      }, 0.90)

      timeline.to(camera.position, {
        x: SIDE_CAMERA_X,
        y: SIDE_CAMERA_Y,
        z: SIDE_CAMERA_Z,
        duration: DRIVE_DURATION,
      }, DRIVE_START)
      timeline.to(target.current, {
        x: SIDE_TARGET_X,
        y: SIDE_TARGET_Y,
        z: SIDE_TARGET_Z,
        duration: DRIVE_DURATION,
      }, DRIVE_START)

      if (technicalLeft) {
        timeline.to(technicalLeft, {
          x: () => exitRight(technicalLeft),
          autoAlpha: 0,
          duration: RACE_TRANSITION_DURATION,
        }, RACE_TRANSITION_START)
      }

      if (technicalRight) {
        timeline.to(technicalRight, {
          x: () => exitRight(technicalRight),
          autoAlpha: 0,
          duration: RACE_TRANSITION_DURATION,
        }, RACE_TRANSITION_START)
      }

      if (raceRecord) {
        timeline.to(raceRecord, {
          x: 0,
          duration: RACE_TRANSITION_DURATION,
        }, RACE_TRANSITION_START)
      }

      if (driftWallColumns.length) {
        timeline.to(driftWallColumns, {
          yPercent: 0,
          duration: GALLERY_ENTRANCE_DURATION,
          ease: 'power3.out',
        }, GALLERY_ENTRANCE_START)
      }

      if (raceRecord) {
        timeline.to(raceRecord, {
          x: 0,
          duration: RACE_RECORD_HOLD_DURATION,
        }, RACE_RECORD_HOLD_START)
      }

      // Wheel spin + drive are synchronized to the SAME master timeline.
      // This is the working behavior from the supplied animation file.
      const updateDriving = () => {
        const trigger = driveTrigger.current
        if (!trigger) return

        const timelineTime = timeline.time()

        if (timelineTime >= RACE_TRANSITION_START) {
          const transitionProgress = Math.min(1, Math.max(0,
            (timelineTime - RACE_TRANSITION_START) / RACE_TRANSITION_DURATION
          ))

          carZ.current = -DRIVE_DISTANCE * transitionProgress
          if (model?.position) {
            model.position.z = initialCarZ.current + carZ.current
          }

          wheelSpin.current = transitionWheelSpin.current + (-carZ.current / WHEEL_RADIUS)
          lastTimelineTime.current = timelineTime
          return
        }

        if (timelineTime < DRIVE_START) {
          driveProgress.current = 0
          carZ.current = 0
          if (model?.position) {
            model.position.z = initialCarZ.current
          }
          lastTimelineTime.current = timelineTime
          return
        }

        const timelineDelta = timelineTime - lastTimelineTime.current

        // Restore continuous wheel rotation during the drive section.
        wheelSpin.current += timelineDelta * WHEEL_SPIN_SPEED
        transitionWheelSpin.current = wheelSpin.current
        lastTimelineTime.current = timelineTime

        const currentProgress = Math.min(1, Math.max(0,
          (timelineTime - DRIVE_START) / DRIVE_DURATION
        ))

        driveProgress.current = currentProgress
        carZ.current = -DRIVE_DISTANCE * currentProgress

        if (model?.position) {
          model.position.z = initialCarZ.current + carZ.current
        }
      }

      // IMPORTANT: use the timeline's own ScrollTrigger. Do not create a
      // second ScrollTrigger for driving; that caused the wheel animation to
      // drift out of sync with the master scroll animation.
      driveTrigger.current = timeline.scrollTrigger
      timeline.eventCallback('onUpdate', updateDriving)
      updateDriving()
    })

    ScrollTrigger.refresh()

    return () => {
      context.revert()
      driveTrigger.current = null
    }
  }, [camera, driftWallRef, heroUiRef, raceRecordRef, rb7Ref, technicalLeftRef, technicalRightRef])

  return null
}
