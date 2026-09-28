import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { TONES, type KapurMood, type KapurTone } from '../lib/kapur'
import { Kapur } from './kapur'

const MOODS: KapurMood[] = ['wave', 'listen', 'happy', 'curious', 'confused', 'think', 'cheer']

test('setiap mood, warna, dan pose mencentang menghasilkan SVG yang valid', () => {
  for (const tone of Object.keys(TONES) as KapurTone[])
    for (const mood of MOODS)
      for (const tick of [false, true]) {
        const svg = renderToStaticMarkup(<Kapur mood={mood} tone={tone} tick={tick} />)
        expect(svg).toContain('aria-label="Empur')
        expect(svg).not.toMatch(/NaN|undefined/)
      }
})
