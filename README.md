# Sizzle & Serve — Rush Hour Kitchen

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Kii922/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Kii922/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original 2D cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). It runs in a desktop browser from static files — no network, no libraries, plain canvas and vanilla JavaScript.

## How to play

You are the only cook on a 150-second shift. Orders fly in on the board — build each dish on a plate and serve it before the customer's patience runs out.

1. **Pick ingredients** — click a bin (or press `1`–`6`): tomato, lettuce, cheese, bun, patty, pasta.
2. **Prep them** — tomato goes on the **chopping board** (click to chop faster), patty on the **grill**, pasta in the **pot**. Watch the rings: green means ready, left too long it burns.
3. **Build the dish** — click a plate to add what you carry; click a plate with empty hands to take the top item back.
4. **Serve** — click the order ticket when a plate matches its recipe. Fast serves and streaks pay more.

Three recipes: **Garden Salad** (lettuce + chopped tomato), **Classic Burger** (bun + grilled patty + cheese + lettuce), **Margherita Pasta** (boiled pasta + cheese). Orders get faster and fancier as the shift goes on; a missed order breaks your combo.

**Controls:** mouse to click everything · `1`–`6` pick up · `Space` chop · `S` serve a matching plate · `T` trash what you carry · `P` pause · `R` restart.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Layout

- `game/index.html` — page shell and canvas
- `game/src/config.js` — sizes, palette, recipes, stations, timings
- `game/src/random.js` — seeded random numbers
- `game/src/state.js` — game state, orders, scoring, timer
- `game/src/actions.js` — what clicks and keys do in the kitchen
- `game/src/render.js` — the kitchen: floor, bins, stations, plates, hands
- `game/src/hud.js` — header, order board, hint bar, title/pause/end screens
- `game/src/shots.js` — deterministic staged states for the screenshots
- `game/src/input.js` — mouse and keyboard wiring
- `game/src/main.js` — game loop and self-test (`?test=1`)
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — 4 screenshots of the game, taken from its own code in a browser
