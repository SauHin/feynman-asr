import { useEffect, useState, type ComponentType } from 'react'
import { AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile } from 'remotion'
import { Feedback, Hook, Live, Outro, Private, Reveal, Setup } from './scenes'
import { FONT } from './ui'

// Linimasa: [adegan, frame mulai, panjang]. Adegan berikutnya mulai sebelum yang lama selesai dan
// menutupinya dengan transisinya sendiri. Setiap awal adegan jatuh di awal birama musik (60 frame).
const SCENES: [ComponentType, number, number][] = [
  [Hook, 0, 130],
  [Reveal, 120, 132],
  [Setup, 240, 256],
  [Live, 480, 372],
  [Private, 840, 132],
  [Feedback, 960, 192],
  [Outro, 1140, 180],
]
export const DURATION = 1320

export function Promo() {
  // Tunggu Lexend termuat, supaya frame pertama tidak memakai huruf cadangan.
  const [handle] = useState(() => delayRender('Lexend'))
  useEffect(() => {
    void document.fonts.load('700 40px "Lexend Variable"').then(() => continueRender(handle))
  }, [handle])

  return (
    <AbsoluteFill style={{ background: '#fff', fontFamily: FONT }}>
      {SCENES.map(([Scene, from, length]) => (
        <Sequence key={from} from={from} durationInFrames={length}>
          <Scene />
        </Sequence>
      ))}
      <Html5Audio src={staticFile('music.wav')} volume={0.85} />
    </AbsoluteFill>
  )
}
