# 🎲 Sudoku 3D

A beautiful 6×6 Mini Sudoku game with 3D effects, 1000 levels, and paper confetti celebrations.

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Levels](https://img.shields.io/badge/Levels-1000-gold) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **6×6 Sudoku Grid** — Numbers 1–6 with 3×2 box regions
- **1000 Levels** across 4 difficulty tiers (Easy → Medium → Hard → Expert)
- **3D Effects** — Perspective transforms, hover depth, flip animations on win
- **Paper Confetti** — Fullscreen celebration with tumbling paper pieces, stars, and strips
- **Smart Highlighting** — Row, column, box, and same-number highlighting
- **Hints System** — 2–5 hints per level based on difficulty
- **Timer & Move Counter** — Track your performance
- **Level Selector** — Jump to any of the 1000 levels
- **Progress Tracker** — See how many levels you've completed
- **Responsive** — Works on desktop and mobile

## 🚀 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/sudoku-3d.git
cd sudoku-3d
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📦 Build & Deploy

```bash
npm run build
```

Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop) for instant free hosting.

## 🎮 How to Play

1. Tap an empty cell to select it
2. Tap a number (1–6) to fill it in
3. Tap ✕ to clear a cell
4. Fill the entire grid correctly to trigger the confetti celebration
5. Each row, column, and 3×2 box must contain numbers 1–6 with no repeats

## 🏗 Tech Stack

- **React 18** — UI components with hooks
- **Vite 5** — Fast dev server and build
- **Canvas API** — Paper confetti particle system
- **CSS 3D Transforms** — Perspective and depth effects
- **Zero dependencies** — No UI libraries, everything custom

## 📁 Project Structure
