import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'

import {
  useGLTF,
} from '@react-three/drei'

import {
  Box3,
  Group,
  Vector3,
} from 'three'

import {
  RB7_MODEL_URL,
  RB7_SCALE,
} from '../config/model'

const WHEEL_NAMES = [
  'WHEEL_LF',
  'WHEEL_LR',
  'WHEEL_RF',
  'WHEEL_RR',
]

const RB7Model = forwardRef(
  function RB7Model(_, ref) {
    const {
      scene,
    } = useGLTF(
      RB7_MODEL_URL
    )

    const groupRef =
      useRef(null)

    const {
      placement,
      wheelPivots,
    } = useMemo(() => {
      /*
       * ------------------------------------------------------
       * MODEL PLACEMENT
       * ------------------------------------------------------
       *
       * Completely unchanged.
       */
      const bounds =
        new Box3().setFromObject(
          scene
        )

      const center =
        bounds.getCenter(
          new Vector3()
        )

      const placementVec = [
        -center.x,
        -bounds.min.y,
        -center.z,
      ]

      /*
       * ------------------------------------------------------
       * WHEEL PIVOTS
       * ------------------------------------------------------
       */

      const pivots = {}

      for (
        const wheelPrefix
        of WHEEL_NAMES
      ) {
        let wheelNode = null

        /*
         * First try an exact node name.
         *
         * This is important because the GLB can
         * contain WHEEL_LF itself.
         */
        wheelNode =
          scene.getObjectByName(
            wheelPrefix
          )

        /*
         * If an exact node isn't found,
         * fall back to the original hierarchy
         * naming convention:
         *
         * WHEEL_LF_...
         */
        if (!wheelNode) {
          scene.traverse(
            (child) => {
              if (
                !wheelNode &&
                child.name &&
                child.name.startsWith(
                  wheelPrefix + '_'
                )
              ) {
                wheelNode = child
              }
            }
          )
        }

        if (!wheelNode) {
          console.warn(
            `[RB7] Wheel node not found: ${wheelPrefix}`
          )

          continue
        }

        /*
         * --------------------------------------------------
         * FIND ACTUAL WHEEL CENTRE
         * --------------------------------------------------
         */

        scene.updateMatrixWorld(
          true
        )

        const wheelBounds =
          new Box3().setFromObject(
            wheelNode
          )

        const wheelCenter =
          wheelBounds.getCenter(
            new Vector3()
          )

        /*
         * Convert world-space wheel centre
         * into the wheel parent's local space.
         */
        if (
          wheelNode.parent
        ) {
          wheelNode.parent.worldToLocal(
            wheelCenter
          )
        }

        /*
         * --------------------------------------------------
         * FIND WHEEL RADIUS
         * --------------------------------------------------
         */

        const wheelMin =
          wheelBounds.min.clone()

        const wheelMax =
          wheelBounds.max.clone()

        if (
          wheelNode.parent
        ) {
          wheelNode.parent.worldToLocal(
            wheelMin
          )

          wheelNode.parent.worldToLocal(
            wheelMax
          )
        }

        const wheelSize =
          new Vector3().subVectors(
            wheelMax,
            wheelMin
          )

        /*
         * The wheel is viewed along its axle.
         *
         * For this RB7 asset the useful diameter
         * is represented by Y/Z.
         */
        const wheelRadius =
          Math.max(
            Math.abs(
              wheelSize.y
            ),
            Math.abs(
              wheelSize.z
            )
          ) / 2

        if (
          !Number.isFinite(
            wheelRadius
          ) ||
          wheelRadius <= 0
        ) {
          console.warn(
            `[RB7] Invalid wheel radius: ${wheelPrefix}`
          )

          continue
        }

        /*
         * --------------------------------------------------
         * CREATE AXLE PIVOT
         * --------------------------------------------------
         */

        const pivot =
          new Group()

        pivot.name =
          `pivot_${wheelPrefix}`

        pivot.position.copy(
          wheelCenter
        )

        /*
         * Keep radius on userData for
         * debugging / animation.
         */
        pivot.userData.rb7WheelRadius =
          wheelRadius

        /*
         * Take a snapshot before reparenting.
         */
        const children = [
          ...wheelNode.children,
        ]

        /*
         * Move each wheel child relative
         * to the new axle centre.
         *
         * This preserves the wheel's visual
         * position while giving it a real
         * rotation pivot.
         */
        for (
          const child
          of children
        ) {
          child.position.sub(
            wheelCenter
          )

          pivot.add(child)
        }

        /*
         * Put pivot inside the wheel node.
         *
         * The wheel node itself remains untouched.
         */
        wheelNode.add(
          pivot
        )

        /*
         * Expose pivot + radius.
         */
        pivots[wheelPrefix] = {
          pivot,
          radius: wheelRadius,
        }
      }

      return {
        placement:
          placementVec,

        wheelPivots:
          pivots,
      }
    }, [scene])

    /*
     * ------------------------------------------------------
     * EXPOSE CONTROLS TO SCROLL ANIMATION
     * ------------------------------------------------------
     */

    useImperativeHandle(
      ref,
      () => ({
        get position() {
          return groupRef.current?.position
        },

        get quaternion() {
          return groupRef.current?.quaternion
        },

        get scale() {
          return groupRef.current?.scale
        },

        get matrix() {
          return groupRef.current?.matrix
        },

        get matrixWorld() {
          return groupRef.current?.matrixWorld
        },

        traverse: (fn) =>
          groupRef.current?.traverse(
            fn
          ),

        wheelPivots,
      }),
      [wheelPivots]
    )

    return (
      <group
        ref={groupRef}
        scale={RB7_SCALE}

        /*
         * IMPORTANT:
         * Current position preserved exactly.
         */
        position={[
          0,
          -0.34,
          0,
        ]}

        dispose={null}
      >
        <group
          position={placement}
        >
          <primitive
            object={scene}
          />
        </group>
      </group>
    )
  }
)

useGLTF.preload(
  RB7_MODEL_URL
)

export default RB7Model