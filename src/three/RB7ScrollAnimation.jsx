import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Vector3 } from 'three'

gsap.registerPlugin(ScrollTrigger)

const INITIAL_TARGET = {
  x: 0,
  y: 0.06,
  z: 0.55,
}

// ------------------------------------------------------------
// SIDE VIEW
// ------------------------------------------------------------

const SIDE_CAMERA_X = 5.8
const SIDE_CAMERA_Y = 0.78
const SIDE_CAMERA_Z = 1.5

const SIDE_CAMERA_FOLLOW_OFFSET = 0.35

const SIDE_TARGET_X = 0
const SIDE_TARGET_Y = 0.12
const SIDE_TARGET_Z = 0.55

// ------------------------------------------------------------
// CAR
// ------------------------------------------------------------

const DRIVE_DISTANCE = 0.6

// ------------------------------------------------------------
// WHEEL
// ------------------------------------------------------------

const WHEEL_RADIUS = 0.30
const WHEEL_SPIN_SPEED = 4.0

// ------------------------------------------------------------
// DRIVE
// ------------------------------------------------------------

const DRIVE_START = 0.96
const DRIVE_DURATION = 2.5
const FINAL_SECTION_END = DRIVE_START + DRIVE_DURATION
const RACE_TRANSITION_DURATION = 0.5
const RACE_RECORD_HOLD_DURATION = 0.55
const GALLERY_ENTER_DURATION = 0.5
const GALLERY_HOLD_DURATION = 0.45
const GALLERY_EXIT_DURATION = 0.5
const VIEWPORT_GUTTER = 32
const RACE_TRANSITION_START = FINAL_SECTION_END
const RACE_RECORD_HOLD_START = RACE_TRANSITION_START + RACE_TRANSITION_DURATION
const GALLERY_ENTER_START = RACE_RECORD_HOLD_START + RACE_RECORD_HOLD_DURATION
const GALLERY_HOLD_START = GALLERY_ENTER_START + GALLERY_ENTER_DURATION
const GALLERY_EXIT_START = GALLERY_HOLD_START + GALLERY_HOLD_DURATION

export default function RB7ScrollAnimation({
  rb7Ref,
  heroUiRef,
  technicalLeftRef,
  technicalRightRef,
  raceRecordRef,
  raceGalleryRef,
}) {
  const { camera } = useThree()

  const target = useRef({
    ...INITIAL_TARGET,
  })

  const targetVector = useRef(
    new Vector3()
  )

  const carZ = useRef(0)

  const driveProgress = useRef(0)

  const driveTrigger = useRef(null)

  // Independent wheel rotation
  const wheelSpin = useRef(0)

  const lastTimelineTime = useRef(0)
  const transitionStartWheelSpin = useRef(0)
  const initialCarZ = useRef(0)
  const transitionWheelSpin = useRef(0)

  // ============================================================
  // FRAME LOOP
  // ============================================================

  useFrame(() => {
    const model =
      rb7Ref?.current

    if (!model) {
      return
    }

    // ----------------------------------------------------------
    // CAR STAYS STATIONARY
    // ----------------------------------------------------------

    if (model.group) {
      model.group.position.z = 0
    }

    // ----------------------------------------------------------
    // WHEELS
    // ----------------------------------------------------------

    const wheelPivots =
      model.wheelPivots

    if (wheelPivots) {
      Object.values(
        wheelPivots
      ).forEach((wheelData) => {
        if (!wheelData?.pivot) {
          return
        }

        wheelData.pivot.rotation.x =
          wheelSpin.current
      })
    }

    // ----------------------------------------------------------
    // CAMERA
    // ----------------------------------------------------------

    if (
      carZ.current !== 0
    ) {
      camera.position.x =
        SIDE_CAMERA_X

      camera.position.y =
        SIDE_CAMERA_Y

      camera.position.z =
        SIDE_CAMERA_Z

      target.current.x =
        SIDE_TARGET_X

      target.current.y =
        SIDE_TARGET_Y

      target.current.z =
        SIDE_TARGET_Z
    }

    // ----------------------------------------------------------
    // CAMERA LOOK AT
    // ----------------------------------------------------------

    targetVector.current.set(
      target.current.x,
      target.current.y,
      target.current.z
    )

    camera.lookAt(
      targetVector.current
    )
  })

  // ============================================================
  // MAIN SCROLL ANIMATION
  // ============================================================

  useLayoutEffect(() => {
    const model = rb7Ref?.current

    // ----------------------------------------------------------
    // INITIAL CAMERA
    // ----------------------------------------------------------

    camera.position.set(
      0,
      0.83,
      5.27
    )

    Object.assign(
      target.current,
      INITIAL_TARGET
    )

    // ----------------------------------------------------------
    // RESET
    // ----------------------------------------------------------

    carZ.current = 0
    driveProgress.current = 0
    wheelSpin.current = 0
    lastTimelineTime.current = 0
    initialCarZ.current = model?.position?.z ?? 0

    // ----------------------------------------------------------
    // GSAP
    // ----------------------------------------------------------

    const context =
      gsap.context(() => {
        const heroUi =
          heroUiRef?.current

        const technicalLeft =
          technicalLeftRef?.current

        const technicalRight =
          technicalRightRef?.current

        const raceRecord =
          raceRecordRef?.current

        const raceGallery =
          raceGalleryRef?.current

        // ======================================================
        // INITIAL UI
        // ======================================================

        if (heroUi) {
          gsap.set(
            heroUi,
            {
              autoAlpha: 1,
            }
          )
        }

        if (technicalLeft) {
          gsap.set(
            technicalLeft,
            {
              autoAlpha: 0,
              x: -30,
            }
          )
        }

        if (technicalRight) {
          gsap.set(
            technicalRight,
            {
              autoAlpha: 0,
              x: 30,
            }
          )
        }

        if (raceRecord) {
          gsap.set(raceRecord, {
            autoAlpha: 1,
            x: () => -raceRecord.getBoundingClientRect().right - VIEWPORT_GUTTER,
          })
        }

        if (raceGallery) {
          gsap.set(raceGallery, {
            autoAlpha: 1,
            x: () => -raceGallery.getBoundingClientRect().right - VIEWPORT_GUTTER,
          })
        }

        const exitRight = (element) => {
          const rect = element.getBoundingClientRect()
          const currentX = Number(gsap.getProperty(element, 'x')) || 0
          return currentX + window.innerWidth - rect.left + VIEWPORT_GUTTER
        }

        const exitLeft = (element) => {
          const rect = element.getBoundingClientRect()
          const currentX = Number(gsap.getProperty(element, 'x')) || 0
          return currentX - rect.right - VIEWPORT_GUTTER
        }

        // ======================================================
        // MASTER TIMELINE
        // ======================================================

        const timeline =
          gsap.timeline({
            scrollTrigger: {
              trigger:
                '.experience-page',

              start:
                'top top',

              end:
                '+=1165%',

              pin:
                true,

              scrub:
                1,

              invalidateOnRefresh:
                true,
            },

            defaults: {
              ease: 'none',
            },
          })

        // ======================================================
        // FRONT VIEW
        // ======================================================

        timeline.to(
          camera.position,
          {
            x: 0,
            y: 0.82,
            z: 4.55,
            duration: 0.20,
          },
          0
        )

        timeline.to(
          target.current,
          {
            x: 0,
            y: 0.10,
            z: 0.60,
            duration: 0.20,
          },
          0
        )

        // ======================================================
        // THREE QUARTER
        // ======================================================

        timeline.to(
          camera.position,
          {
            x: 2.7,
            y: 1.05,
            z: 2.75,
            duration: 0.25,
          },
          0.20
        )

        timeline.to(
          target.current,
          {
            x: 0,
            y: 0.24,
            z: 0.40,
            duration: 0.25,
          },
          0.20
        )

        // ======================================================
        // SIDE VIEW
        // ======================================================

        timeline.to(
          camera.position,
          {
            x: SIDE_CAMERA_X,
            y: SIDE_CAMERA_Y,
            z: SIDE_CAMERA_Z,
            duration: 0.30,
          },
          0.45
        )

        timeline.to(
          target.current,
          {
            x: SIDE_TARGET_X,
            y: SIDE_TARGET_Y,
            z: SIDE_TARGET_Z,
            duration: 0.30,
          },
          0.45
        )

        // ======================================================
        // SIDE VIEW HOLD
        // ======================================================

        timeline.to(
          camera.position,
          {
            x: SIDE_CAMERA_X,
            y: SIDE_CAMERA_Y,
            z: SIDE_CAMERA_Z,
            duration: 0.13,
          },
          0.75
        )

        timeline.to(
          target.current,
          {
            x: SIDE_TARGET_X,
            y: SIDE_TARGET_Y,
            z: SIDE_TARGET_Z,
            duration: 0.13,
          },
          0.75
        )

        // ======================================================
        // HERO UI FADE
        // ======================================================

        if (heroUi) {
          timeline.to(
            heroUi,
            {
              autoAlpha: 0,
              duration: 0.12,
              ease: 'power2.out',
            },
            0.76
          )
        }

        // ======================================================
        // TECHNICAL INFO
        // ======================================================

        if (technicalLeft) {
          timeline.to(
            technicalLeft,
            {
              autoAlpha: 1,
              x: 10,
              duration: 0.02,
              ease: 'power2.out',
            },
            0.88
          )
        }

        if (technicalRight) {
          timeline.to(
            technicalRight,
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.02,
              ease: 'power2.out',
            },
            0.90
          )
        }

        // ======================================================
        // INFORMATION HOLD
        // ======================================================

        timeline.to(
          camera.position,
          {
            x: SIDE_CAMERA_X,
            y: SIDE_CAMERA_Y,
            z: SIDE_CAMERA_Z,
            duration: 0.06,
          },
          0.90
        )

        timeline.to(
          target.current,
          {
            x: SIDE_TARGET_X,
            y: SIDE_TARGET_Y,
            z: SIDE_TARGET_Z,
            duration: 0.06,
          },
          0.90
        )

        // ======================================================
        // FINAL SECTION
        //
        // CAMERA FIXED
        // CAR FIXED
        // WHEELS + INFO RESPOND TO SCROLL
        // ======================================================

        timeline.to(
          camera.position,
          {
            x: SIDE_CAMERA_X,
            y: SIDE_CAMERA_Y,
            z: SIDE_CAMERA_Z,
            duration:
              DRIVE_DURATION,
          },
          DRIVE_START
        )

        timeline.to(
          target.current,
          {
            x: SIDE_TARGET_X,
            y: SIDE_TARGET_Y,
            z: SIDE_TARGET_Z,
            duration:
              DRIVE_DURATION,
          },
          DRIVE_START
        )

        // ======================================================
        // RACE RECORD TRANSITION
        //
        // Existing technical information exits right while the
        // Race Record enters from the left. Both share the exact
        // timeline position and duration as the new car movement
        // calculated in updateDriving below.
        // ======================================================

        if (technicalLeft) {
          timeline.to(
            technicalLeft,
            {
              x: () => exitRight(technicalLeft),
              autoAlpha: 0,
              duration: RACE_TRANSITION_DURATION,
            },
            RACE_TRANSITION_START
          )
        }

        if (technicalRight) {
          timeline.to(
            technicalRight,
            {
              x: () => exitRight(technicalRight),
              autoAlpha: 0,
              duration: RACE_TRANSITION_DURATION,
            },
            RACE_TRANSITION_START
          )
        }

        if (raceRecord) {
          timeline.to(
            raceRecord,
            {
              x: 0,
              duration: RACE_TRANSITION_DURATION,
            },
            RACE_TRANSITION_START
          )
        }

        // Give the Race Record a deliberate reading hold.
        if (raceRecord) {
          timeline.to(
            raceRecord,
            { x: 0, duration: RACE_RECORD_HOLD_DURATION },
            RACE_RECORD_HOLD_START
          )
        }

        // Gallery foreground enters from the left, then later travels left while
        // the RB7 WebGL background remains pinned behind it.
        if (raceGallery) {
          timeline.to(
            raceGallery,
            { x: 0, duration: GALLERY_ENTER_DURATION },
            GALLERY_ENTER_START
          )
          timeline.to(
            raceGallery,
            { x: 0, duration: GALLERY_HOLD_DURATION },
            GALLERY_HOLD_START
          )
          timeline.to(
            raceGallery,
            { x: () => exitLeft(raceGallery), duration: GALLERY_EXIT_DURATION },
            GALLERY_EXIT_START
          )
        }

        // ======================================================
        // DRIVE UPDATE
        // ======================================================

        const updateDriving =
          () => {
            const trigger =
              driveTrigger.current

            if (!trigger) {
              return
            }

            const timelineTime =
              timeline.time()

            // --------------------------------------------------
            // POST-FINAL TRANSITION
            // --------------------------------------------------
            // This is appended after the existing final wheel-spin
            // section. It does not alter any earlier camera or wheel
            // timing; it only maps the new shared transition progress
            // to the car's already-exposed root position.
            if (timelineTime >= RACE_TRANSITION_START) {
              const transitionProgress = Math.min(
                1,
                Math.max(
                  0,
                  (timelineTime - RACE_TRANSITION_START) / RACE_TRANSITION_DURATION
                )
              )

              carZ.current = -DRIVE_DISTANCE * transitionProgress

              if (model?.position) {
                model.position.z = initialCarZ.current + carZ.current
              }

              wheelSpin.current = transitionWheelSpin.current +
                (-carZ.current / WHEEL_RADIUS)

              lastTimelineTime.current = timelineTime
              return
            }

            // --------------------------------------------------
            // BEFORE DRIVE
            // --------------------------------------------------

            if (
              timelineTime <
              DRIVE_START
            ) {
              driveProgress.current = 0

              carZ.current = 0

              if (model?.position) {
                model.position.z = initialCarZ.current
              }

              lastTimelineTime.current =
                timelineTime

              return
            }

            // --------------------------------------------------
            // SCROLL DELTA
            // --------------------------------------------------

            const timelineDelta =
              timelineTime -
              lastTimelineTime.current

            // --------------------------------------------------
            // WHEEL SPIN
            // --------------------------------------------------

            wheelSpin.current +=
              timelineDelta *
              WHEEL_SPIN_SPEED

            transitionWheelSpin.current =
              wheelSpin.current

            lastTimelineTime.current =
              timelineTime

            // --------------------------------------------------
            // DRIVE PROGRESS
            // --------------------------------------------------

            const currentProgress =
              Math.min(
                1,
                Math.max(
                  0,
                  (
                    timelineTime -
                    DRIVE_START
                  ) /
                  DRIVE_DURATION
                )
              )

            driveProgress.current =
              currentProgress

            // --------------------------------------------------
            // CAR STAYS STILL
            // --------------------------------------------------

            carZ.current = 0

            // --------------------------------------------------
            // INFO MOVEMENT
            // --------------------------------------------------

            const infoDistance =
              window.innerWidth *
              0.2

            const infoOffset =
              infoDistance *
              (
                timelineTime -
                DRIVE_START
              ) /
              0.4

            if (technicalLeft) {
              gsap.set(
                technicalLeft,
                {
                  x:
                    10 +
                    infoOffset,
                }
              )
            }

            if (technicalRight) {
              gsap.set(
                technicalRight,
                {
                  x:
                    infoOffset,
                }
              )
            }
          }

        // ======================================================
        // CONNECT TO SCROLLTRIGGER
        // ======================================================

        driveTrigger.current =
          timeline.scrollTrigger

        timeline.eventCallback(
          'onUpdate',
          updateDriving
        )

        updateDriving()
      })

    ScrollTrigger.refresh()

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {
      context.revert()

      driveTrigger.current =
        null
    }
  }, [
    camera,
    rb7Ref,
    heroUiRef,
    technicalLeftRef,
    technicalRightRef,
  ])

  return null
}
