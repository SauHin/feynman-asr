# Surface brief: layar live

Scope: route `/live` (`frontend/src/screens/LiveScreen.tsx`). Mode: Operate, with the expressive register the user pinned (a Duolingo-like education app).

Task: the user explains one topic out loud and only glances at the screen. In one glance, the user must see which concepts are still not covered. Dosen see real-time proof (partial transcript, latency, status) during the demo.

Constraints: data only through `TranscriptSource`. Concept status never by color alone. Agenda order stays fixed during a session. Light and dark mode with a toggle. No serif fonts. No all-caps text. Light progress only: a concept progress bar and small celebrations. No XP, streaks, hearts, or badges. The mock session is labeled as a sample on every state.

Memorable moment: Si Kapur, a living piece of chalk on the chalk tray, reacts to the explanation. When a concept changes status, he walks to that agenda row and ticks the box with his hand. The mark draws itself, and a puff of chalk dust rises from the row.

Si Kapur follows the user's reference sheet (`docs/design/referensi-si-kapur.jpg`): a white chalk cylinder with an elliptical top, flipper arms, round feet, pink cheeks, and one eye shape plus one gesture or prop per mood.

Unresolved: Si Kapur is an authored SVG for now. Prompts for a polished expression sheet are in `docs/design/arah-visual-live.md`. Setup and feedback screens inherit this world later.

History: version 1 of this direction (restrained, the whole page as a flat board color) was rejected by the user as bland. This contract replaces it.

## Direction contract

THESIS: A bright classroom where a real chalkboard hangs on the wall, and Si Kapur helps you teach. The board is an illustrated object with a wooden frame and a chalk tray, not a background color. This refuses both a flat transcript app and a restrained dark page.

OWN-WORLD: Day mode has a pale sky wall (#EAF5FF) with a small plus-sign wallpaper, a chalkboard (#245A45) in a warm wood frame (#C98A4B), and chalk in white, yellow (#FFE27A), blue, pink, and mint. Night mode has a navy wall (#152231) and a darker board (#1F4F3C). Every illustration shares one outline color (#44586C by day, #0C1620 by night) at about 3px: Si Kapur, the board frame and panels, the tray chalk, the clock, the notes, the lamp, and the window. Buttons are chunky and pressable, with a darker bottom edge: green (#3CCB7F) to start, coral (#FF7A6E) to stop. Fredoka carries headings, buttons, agenda items, and Si Kapur's speech. Nunito carries the transcript and body text.

STORY: Si Kapur waves and says what the app does. The user reads three chalk steps and presses Mulai. While the user talks, Si Kapur listens, asks about concepts that were only mentioned, and cheers each explained one. The progress bar fills up. The user presses Berhenti and opens the feedback.

FIRST VIEWPORT: At 1366x768, a top bar holds the exit link, a two-tone concept progress bar with one numbered circle per keyword, the recording pill with timer, latency, and the theme switch. Below it, the board hangs on the wall with decor on both sides. The board has two green panels divided by wood: the agenda panel on the left (uncovered concepts in yellow, with the mark legend at its bottom), and the "Penjelasanmu" panel on the right with the transcript. Si Kapur stands on the chalk tray at the bottom of the right panel with a speech bubble. A white footer bar holds indicator pills and the big primary button at the right.

FORM: Papan Kuliah Feynman, candidate 7 of 7 on the grounded list, seed key e41ba7ae, re-rendered in the user's pinned Duolingo-like register. Kept raises: inline pause notes, one state for every mark, marks drawn on state change, one partial treatment. Motion: Si Kapur idles, blinks, hops, and tilts. Marks draw themselves, and chalk dust puffs. With reduced motion, only static poses and final marks remain.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
