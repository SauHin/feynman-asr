---
version: 1
slug: "frontend-src-screens-feedbackscreen-tsx"
primary_target: "frontend/src/screens/FeedbackScreen.tsx"
related_targets: []
---

# Surface brief: feedback

Scope: route `/feedback` (`frontend/src/screens/FeedbackScreen.tsx`). Mode: Read. Inherits the "Kelas Si Kapur" world from DESIGN.md.

Task: after Stop, the user reads carefully, finds the gaps, and presses Jelaskan ulang. Content follows PLAN.md 7.1 and 7.3:
- local fluency metrics: duration, words per minute, long pauses with location, filler as an indication
- concept coverage with transcript quotes
- factual errors with corrections, and unexplained jargon
- 2 to 3 strengths, 2 to 3 improvements, and a simplicity note
- the full transcript with pauses and fillers marked

States:
- complete
- loading: local metrics shown, Gemini sections still being written
- Gemini failed: a short honest letter, the live checklist marked as not verified, and Coba lagi
- comparison with the previous session, only after Jelaskan ulang

Mock data only, labeled "Contoh, bukan hasil nyata". A URL switch (`?keadaan=memuat|gagal|ulang`) shows states for the mockup.

Constraints: every judgment carries a transcript quote. ASR spelling errors are not the user's mistakes. Coverage uses four marks: the three live marks plus a coral cross in a box for "dijelaskan keliru". The user approved this fourth mark. Each mark always has a text label. Sans-serif only, no all-caps, no scores or badges.

Memorable moment: Si Kapur signs the letter and stands at the bottom of the page with a proud pose. The quotes are little paper strips clipped into the letter.

## Direction contract

THESIS: Feedback is a letter from Si Kapur, read top to bottom, with your own transcript quoted as evidence for every judgment. It refuses a KPI dashboard of equal cards and a score.

OWN-WORLD: A tall sheet of cream paper (#fffdf6) with a 3px outline and a flat shadow on the sky wall, headed like a letter. Coverage marks drawn in ink with the chalk colors. Quotes as paper strips with a blue tape corner. Side column of sticker chips for fluency and comparison. The appendix transcript sits on a green board below the letter, with pause pills and filler marks.

STORY: The user reads the greeting and the summary, then sees what went well and what to fix first. They check each concept with its quote and read the error with its correction. Then they press Jelaskan ulang.

FIRST VIEWPORT: At 1366x768: top bar with topic, sample label, and theme switch. Letter column about 44rem wide, left of center: greeting, "Yang sudah bagus", "Yang perlu diperbaiki dulu". Right column about 20rem: fluency stickers and the Jelaskan ulang button, sticky while reading. Si Kapur at the lower left corner of the letter.

FORM: Surat dari Si Kapur, candidate 7 of 7 on the grounded list, seed key 488f613e.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
