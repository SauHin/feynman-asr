---
version: 1
slug: "frontend-src-screens-homescreen-tsx"
primary_target: "frontend/src/screens/HomeScreen.tsx"
related_targets: []
---

# Surface brief: beranda

Scope: route `/` (`frontend/src/screens/HomeScreen.tsx`). Mode: Persuade, light: a first-time visitor must understand the app and start a session. Inherits the "Kelas Si Kapur" world from DESIGN.md.

Task: a user-testing participant opens the app for the first time. In one screen they learn what the app is: practice to explain one concept out loud with the Feynman method. They also learn the four stages of a session, and what stays local versus what goes to Gemini. A returning user presses Mulai sesi at once.

Constraints: Indonesian UI text, sans-serif only, no all-caps, no XP, streaks, or badges. Light and dark mode. Paper is a new material (approved by the user). It stays light at night, only slightly dimmed.

Memorable moment: Si Kapur sits on the edge of the notebook and waves. The four stages read like notes a friend wrote for you, each with a small doodle in the sticker style.

## Direction contract

THESIS: The home screen is an open notebook on the classroom wall under the lamp, with today's lesson written as notes. It refuses a marketing hero with feature cards and a second copy of the live board.

OWN-WORLD: Pale sky wall with plus wallpaper. A two-page notebook of cream paper (#fffdf6) with pale blue rules, a coral margin line, and a spiral binding of outlined rings across the fold. Outline 3px (#44586C by day, #0C1620 by night), flat shadow straight down. Doodles use the chalk colors with the same outline. Fredoka headings and buttons, Nunito body. Green Mulai button with a bottom edge.

STORY: Si Kapur waves. The visitor reads one headline and two sentences, then scans four numbered stages. They notice the margin note on privacy and press Mulai sesi to go to setup.

FIRST VIEWPORT: At 1366x768: top bar with app name and theme switch. Centered notebook spread about 64rem wide. Left page: Si Kapur waving at the page edge, headline "Belajar dengan menjelaskan", two sentences, big Mulai sesi button. Right page: "Satu sesi, empat tahap" with four numbered notes and doodles, then a margin note on local audio versus Gemini text. Wall decor (clock, window, lamp) at the sides from 1340px.

FORM: Buku catatan terbuka, candidate 7 of 7 on the grounded list, seed key 02f95ece.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
