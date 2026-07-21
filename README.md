# Somewhere

> AI can generate infinite things. So we built something you can only have once.

Somewhere is a quiet, AI-assisted journey with no productivity goal. A visitor names where they would like to be, chooses a detail in a rain-cleared landscape, and decides whether to keep the resulting travel sketch or give it away.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The full flow works without credentials through restrained fallback copy. To enable live copy generation, set `OPENAI_API_KEY`. `OPENAI_MODEL` defaults to the hackathon-requested `gpt-5.6` and can be overridden if that model ID is unavailable to the account.

## Architecture decisions

- **Next.js App Router + TypeScript:** one application owns the experience, server endpoints, and recipient routes.
- **One client journey state machine:** the short linear flow stays explicit and avoids a global state dependency.
- **Canvas in the browser:** pointer coordinates map from the responsive rendered landscape to its natural dimensions. The selected area is redrawn into a new canvas with reduced saturation, contrast, sepia, paper color, and grain; the source remains untouched.
- **Progressive AI fallback:** `/api/atmosphere` uses the OpenAI Responses API when configured and deterministic, tone-safe lines otherwise, so the demo never depends on network availability.
- **Ownership:** kept memories live only in browser `localStorage`. Given memories are removed locally, assigned a UUID, marked `GIVEN_AWAY`, and persisted server-side for the recipient route. The sender retains only the ID/state, not the sketch.
- **MVP persistence:** share records are JSON files under `.data/memories`, intentionally avoiding a database dependency. For serverless production, replace `lib/memories.ts` with durable object/blob storage; ephemeral or read-only filesystems cannot preserve share links.
- **No added UI library:** CSS, Tailwind utilities, pointer events, and the Canvas API keep the bundle and interaction surface small.

## Where GPT-5.6 is used

GPT-5.6 is called only for two bounded pieces of language: the atmospheric transition after the visitor’s phrase and the restrained observation attached to a chosen crop. Both prompts explicitly disallow advice, psychological analysis, therapeutic language, explanation, and verbosity. No user profile or chat history is created.

## Design decisions

The landscape dominates the only interactive screen. Warm off-white type, a near-black green ground, a muted post-rain illustration, long fades, modest serif typography, and generous space avoid dashboard or game language. Actions use plain verbs. The give-away decision adds a separate confirmation, then visually removes the sketch before the final line. Keyboard focus, semantic labels, alt text, touch pointer events, and reduced-motion preferences are supported.

## How Codex was used

Codex inspected the empty repository, wrote the implementation plan in `TODO.md`, established the architecture, implemented the full flow and fallback path, created the prepared landscape, integrated the OpenAI SDK, and added a resilient credential-free demo path. The work was deliberately ordered around a reliable end-to-end demo before visual refinement.

## Commands

```bash
npm run dev       # local development
npm run typecheck # TypeScript check
npm run build     # production build
npm start         # run the production build
```

## Demo path

Begin → enter a short place → wait for the transition → drag over the landscape → create the sketch → keep it, or give it away and confirm → copy the recipient URL. The intended path takes well under two minutes.
