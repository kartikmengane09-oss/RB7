import { Suspense } from 'react'
import {
  Canvas,
} from '@react-three/fiber'

import {
  ContactShadows,
  Environment,
  MeshReflectorMaterial,
  PerspectiveCamera,
} from '@react-three/drei'

import { Vector3 } from 'three'

import RB7Model from './RB7Model'
import RB7ScrollAnimation from './RB7ScrollAnimation'

function FixedCamera() {
  return (
    <PerspectiveCamera
      makeDefault
      near={0.01}
      far={100}
      fov={32}
      position={[0, 0.83, 5.27]}
      onUpdate={(camera) =>
        camera.lookAt(
          new Vector3(
            0,
            0.06,
            0.55
          )
        )
      }
    />
  )
}

function Scene({
  rb7Ref,
  heroUiRef,
  technicalLeftRef,
  technicalRightRef,
  raceRecordRef,
}) {
  return (
    <>
      <FixedCamera />

      {/*
       * Existing scroll animation.
       *
       * rb7Ref is now supplied ONLY so the
       * animation can access the wheel pivots.
       */}
      <RB7ScrollAnimation
        rb7Ref={rb7Ref}
        heroUiRef={heroUiRef}
        technicalLeftRef={technicalLeftRef}
        technicalRightRef={technicalRightRef}
        raceRecordRef={raceRecordRef}
      />

      {/* Existing lighting - unchanged */}
      <ambientLight
        intensity={0.24}
        color="#8b93a3"
      />

      <directionalLight
        position={[-4, 5, 6]}
        intensity={3.1}
        color="#fff5e8"
      />

      <directionalLight
        position={[4, 4.5, 6]}
        intensity={2.7}
        color="#e9eefb"
      />

      <spotLight
        position={[0, 6.5, 4.5]}
        intensity={44}
        angle={0.62}
        penumbra={0.95}
        color="#ffffff"
      />

      <directionalLight
        position={[0, 4.5, -5]}
        intensity={1.7}
        color="#aebbd6"
      />

      <Suspense fallback={null}>
        {/*
         * The same ref is attached to the RB7.
         *
         * No position, scale or hierarchy changes.
         */}
        <RB7Model ref={rb7Ref} />
      </Suspense>

      <Suspense fallback={null}>
        <Environment
          preset="city"
          environmentIntensity={0.2}
        />
      </Suspense>

      {/* Existing reflective floor - unchanged */}
      <mesh
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry
          args={[0, 64]}
        />

        <MeshReflectorMaterial
          color="#0b101a"
          metalness={0.35}
          roughness={0.8}
          mirror={0.06}
          blur={[380, 105]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.09}
          transparent
          opacity={0.18}
        />
      </mesh>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.36}
        scale={6.5}
        blur={3.8}
        far={4.5}
        color="#000000"
      />
    </>
  )
}

export default function Experience({
  rb7Ref,
  heroUiRef,
  technicalLeftRef,
  technicalRightRef,
  raceRecordRef,
}) {
  return (
    <Canvas
      className="webgl"
      dpr={[1, 2]}
      style={{
        background: 'transparent',
      }}
      gl={{
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(
          0x000000,
          0
        )

        gl.toneMappingExposure = 1.25
      }}
    >
      <Scene
        rb7Ref={rb7Ref}
        heroUiRef={heroUiRef}
        technicalLeftRef={technicalLeftRef}
        technicalRightRef={technicalRightRef}
        raceRecordRef={raceRecordRef}
      />
    </Canvas>
  )
}
