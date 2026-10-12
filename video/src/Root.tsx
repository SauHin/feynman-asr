import '@fontsource-variable/lexend'
import './video.css'
import { Composition } from 'remotion'
import { DURATION, Promo } from './Promo'
import { FPS } from './motion'
import { REEL_FPS } from './reel/kit'
import { REEL_SECONDS, Showreel } from './reel/Showreel'

export const Root = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="Showreel" component={Showreel} durationInFrames={REEL_SECONDS * REEL_FPS} fps={REEL_FPS} width={1920} height={1080} />
  </>
)
