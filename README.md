# Charterbound RPG Prototype

A small browser-based 2D RPG prototype built with Vite, TypeScript, and Phaser 3. It uses only placeholder rectangle/sprite art and stores saves in `localStorage`, so it can be hosted as a static site on GitHub Pages.

## Features

- Title screen with New Game and Continue when a save exists
- Top-down overworld movement with Arrow keys or WASD
- One town map and one forest map with collision and map transitions
- Recruitable companion through NPC dialogue
- NPC dialogue box with keyboard controls
- Quest system for defeating 3 forest slimes
- Random forest encounters
- Turn-based battle menu with Attack, Skill, Item, and Run
- Potions in inventory
- XP gain and level ups
- Menu with party stats, inventory, quest progress, and manual save
- Static build configured for GitHub Pages subdirectory hosting

## Controls

- Move: Arrow keys or WASD
- Interact/confirm: Space or Enter
- Menu: Escape or M
- Back/cancel: Backspace or Escape

## Run Locally

```bash
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`.

Do not open the source `index.html` with VS Code Live Server. This project uses Vite, so the dev server must compile TypeScript and resolve imports like `phaser`. Opening `index.html` directly through Live Server usually shows a blank page because the browser cannot run `./src/main.ts` as-is.

## Build

```bash
npm run build
```

The static site is generated in `dist/`.

If you want to test the static output locally, run:

```bash
npm run preview
```

## Preview Production Build

```bash
npm run preview
```

## Deploy To GitHub Pages

This project is configured with `base: './'` in `vite.config.ts`, so built assets work from a repository subdirectory such as:

```text
https://your-username.github.io/merchant-rpg/
```

The included `.github/workflows/deploy-pages.yml` workflow builds the app and publishes `dist/` to GitHub Pages whenever you push to `main`.

Setup steps:

1. Push the project to GitHub.
2. In the GitHub repo, open Settings -> Pages.
3. Under Build and deployment, choose GitHub Actions.
4. Push to the `main` branch.

GitHub will run `npm ci`, `npm run build`, and deploy the generated `dist/` folder.

## Save Data

The game saves to browser `localStorage` under:

```text
charterbound-save-v1
```

Use the in-game menu Save button to save manually. Continue appears on the title screen after a save exists.

## Character Animation

The player uses a generated placeholder spritesheet created in `BootScene`. It has four rows for direction (`down`, `left`, `right`, `up`) and three frames per row.

`BootScene` registers idle and walking animations with keys like `player-idle-down` and `player-walk-right`. The `Player` entity in `src/game/entities/Player.ts` reads keyboard input, applies Arcade Physics velocity, chooses the correct walking animation while moving, and returns to the idle animation for the last movement direction when stopped.

## Code Structure

```text
src/
  main.ts
  game/
    config.ts
    entities/
      Player.ts
    scenes/
      BootScene.ts
      TitleScene.ts
      TownScene.ts
      ForestScene.ts
      BattleScene.ts
      MenuScene.ts
    systems/
      DialogueSystem.ts
      QuestSystem.ts
      BattleSystem.ts
      SaveSystem.ts
      InventorySystem.ts
    data/
      characters.ts
      enemies.ts
      quests.ts
      items.ts
    types/
      gameTypes.ts
```
