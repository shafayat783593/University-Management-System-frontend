<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI work

For any task that changes how the UI **looks or moves** — a new screen, a restyle, a
redesign, an animation, a transition, a micro-interaction, or a complaint that a screen
looks generic or cheap — use the **`taste-ui`** skill in
`../.opencode/skills/taste-ui/`. It carries this repo's real tokens and component
inventory, the tasteskill research library, and the lint/inspect tools to check the
result.

Two things it will tell you that are easy to get wrong here:

- Use the design tokens in `src/app/globals.css` (`--primary`, `--destructive`,
  `--radius-*`, `--shadow-*`). Do not hardcode colours, and do not invent a new
  palette — "Violet Bloom" is the brand.
- `framer-motion` is installed and used zero times. The motion layer is the gap.
  `references/motion-stack.md` has the recipes and the reduced-motion rules.

