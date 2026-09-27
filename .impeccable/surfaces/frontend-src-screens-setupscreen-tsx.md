---
version: 1
slug: "frontend-src-screens-setupscreen-tsx"
primary_target: "frontend/src/screens/SetupScreen.tsx"
related_targets: []
---

# Surface brief: setup topik

Scope: route `/setup` (`frontend/src/screens/SetupScreen.tsx`). Mode: Operate, in the pinned playful register. Inherits the "Kelas Si Kapur" world from DESIGN.md.

Task: the user types a topic and optionally adds material (PDF, PPTX, TXT, MD, or pasted text) with a page range. Gemini extracts 4 to 8 concepts. The user reviews the list: edit name, aliases, and description, delete, or add up to 8. Then the user presses Mulai menjelaskan. It must take under a minute.

States:
- empty
- file added with page range
- extracting
- review
- no material: the list is labeled as general Gemini knowledge, not the user's material
- extraction failed: retry, or write concepts yourself

Mock only: extraction is a timed mock of the Backpropagation concepts, labeled as a sample. A URL switch (`?keadaan=gagal`) shows the failure for the mockup.

Constraints: Indonesian UI text, sans-serif only, no all-caps. Concept marks follow the Tiga Tanda rule. The concept list keeps the live agenda's order and numbering. The privacy note says material and concepts go to Gemini.

Memorable moment: Si Kapur asks each question with his own mood and thinks while he reads your material. Then the concept list writes itself onto the board row by row.

## Direction contract

THESIS: Setup is a conversation on the chalkboard: Si Kapur asks one thing per turn, and every answer stays editable. It refuses a multi-field form and a wizard with a stepper.

OWN-WORLD: The same board as the live screen (green #245A45 panel in a wood frame, chalk tray), one wide panel. Si Kapur's questions are white speech bubbles with his small figure. Answers are white answer cards aligned right with an Ubah link. Choice chips and inputs are stickers with a 3px outline and a bottom edge. The concept list is chalk rows like the live agenda, each row expandable to edit.

STORY: Si Kapur asks the topic, then material, then reads it while he thinks, then shows the concepts. The user fixes one concept, reads the privacy line, and presses Mulai menjelaskan.

FIRST VIEWPORT: At 1366x768: top bar with back link, "Siapkan topik", and theme switch. The board fills the wall. Inside it, a centered conversation column about 46rem wide. The current question sits lowest, with its input directly below it, and the column scrolls inside the board. Si Kapur stands on the tray at the left. White footer bar: privacy note and the green Mulai menjelaskan button, disabled until the list has at least one concept.

FORM: Tanya jawab dengan Si Kapur, candidate 7 of 7 on the grounded list, seed key abba0bf6.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
