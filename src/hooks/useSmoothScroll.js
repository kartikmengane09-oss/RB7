import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
    })

    const update = (time) => lenis.raf(time * 1000)
    const refresh = () => ScrollTrigger.update()

    gsap.ticker.add(update)
    lenis.on('scroll', refresh)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', refresh)
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])
}
