# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based interactive visualization of the Flash Attention algorithm, demonstrating IO-aware block-wise attention computation. The project uses Create React App, Tailwind CSS, and Lucide React icons.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start
# or
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App (irreversible)
npm run eject
```

## Architecture

### Key Files
- `src/FlashAttentionDemo.js`: Main visualization component containing the interactive Flash Attention algorithm demonstration
- `src/index.js`: React application entry point
- `public/index.html`: HTML template with Tailwind CSS CDN integration
- `package.json`: Project dependencies and scripts

### Component Structure
The main component `FlashAttentionDemo` manages:
- Animation state with `useState` hooks for step-by-step visualization
- Timer-based animation using `useEffect`
- Matrix block rendering functions for Q, K, V, O matrices
- Score map visualization showing attention computation progress
- SRAM simulation showing on-chip memory operations

### State Management
- `step`: Current algorithm step (0-3)
- `qIdx`, `kvIdx`: Current block indices being processed
- `scoreMapState`: 2D array tracking computation status (0=unprocessed, 1=processing, 2=completed)
- `outputReady`: Array tracking which output blocks are complete
- `speed`: Animation speed control

## Technical Details

### Dependencies
- React 18.2.0 with hooks
- Lucide React for icons
- Tailwind CSS via CDN for styling
- Create React App for build tooling

### Animation Logic
The visualization cycles through algorithm steps:
1. Block division and initialization
2. SRAM loading of Q, K, V blocks
3. Attention score computation (Q @ Kᵀ)
4. Output block updates with online softmax
5. HBM write-back of completed blocks

### Styling Approach
- Tailwind utility classes for responsive design
- Dynamic className generation based on computation state
- Color-coded visual indicators for different algorithm states
- Transition animations for smooth visual updates