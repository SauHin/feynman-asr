import { useEffect, useState, type ComponentType } from 'react'
import { visualizeAudio, useAudioData } from '@remotion/media-utils'
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { FONT } from '../ui'
import { LevelContext } from './kit'
import { Problem, Reveal } from './opening'
import { Feedback, Live, Retry, Setup } from './tour'
import { Finale, Grid } from './finale'

// Linimasa showreel dalam detik: [adegan, mulai, panjang]. Adegan berikutnya menutupi adegan sebelumnya
// dengan transisinya sendiri, dan setiap potongan jatuh di ketukan lagu (audio/make_audio.py, showreel).
const SCENES: [ComponentType, number, number][] = [
  [Problem, 0, 14.05],
  [Reveal, 14.0, 8.05],
  [Setup, 22.0, 6.1],
  [Live, 27.4, 10.75],
  [Feedback, 37.75, 4.3],
  [Retry, 42.0, 5.05],
  [Grid, 46.6, 5.45],
  [Finale, 52.0, 8.0],
]
export const REEL_SECONDS = 60

export function Showreel() {
  const [handle] = useState(() => delayRender('Lexend'))
  useEffect(() => {
    void document.fonts.load('700 40px "Lexend Variable"').then(() => continueRender(handle))
  }, [handle])

  // Musik dianalisis per frame (16 pita, bas dulu). Visual yang ikut berdenyut membacanya lewat konteks.
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const music = staticFile('showreel.wav')
  const audio = useAudioData(music)
  const levels = audio ? visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 16, smoothing: true }) : []

  return (
    <LevelContext.Provider value={levels}>
      <AbsoluteFill style={{ background: '#000', fontFamily: FONT }}>
        {SCENES.map(([Scene, from, length]) => (
          <Sequence key={from} from={Math.round(from * fps)} durationInFrames={Math.round(length * fps)}>
            <Scene />
          </Sequence>
        ))}
        <Html5Audio src={music} volume={0.78} />
      </AbsoluteFill>
    </LevelContext.Provider>
  )
}
