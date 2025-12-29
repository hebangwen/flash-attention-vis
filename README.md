# Flash Attention Visualization

Interactive visualization of the Flash Attention algorithm, demonstrating the IO-aware block-wise attention mechanism.

## Features

- **Interactive Animation**: Step-by-step visualization of Flash Attention computation
- **Real-time Controls**: Play, pause, step-through, and speed adjustment
- **Visual Components**: Query (Q), Key (K), Value (V), and Output (O) matrix blocks
- **Score Map**: Attention score computation visualization
- **SRAM Visualization**: On-chip memory usage demonstration
- **Algorithm Code**: Live algorithm pseudocode highlighting

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
# or
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Architecture

The application is built with React and uses:
- **React Hooks**: `useState`, `useEffect` for state management
- **Lucide React**: Icon components
- **Tailwind CSS**: Styling via CDN
- **Create React App**: Development and build tooling

## Key Components

- `FlashAttentionDemo.js`: Main visualization component with animation logic
- `index.js`: React application entry point
- `public/index.html`: HTML template with Tailwind CSS integration

## Algorithm Visualization

The demo shows the Flash Attention algorithm's key steps:
1. **Block Division**: Q, K, V matrices divided into blocks
2. **SRAM Loading**: Efficient memory access patterns
3. **Attention Computation**: Q @ Kᵀ matrix multiplication
4. **Output Update**: Online softmax and partial output updates
5. **HBM Write-back**: Final result storage

## Controls

- **START/PAUSE**: Control animation playback
- **Reset**: Return to initial state
- **Step Forward**: Manual step-through
- **Speed Slider**: Adjust animation speed (200ms - 2000ms per step)

## Status Indicators

- **Blue**: Currently processing block
- **Amber**: Live computation in SRAM
- **Emerald**: Completed output blocks
- **Block Coordinates**: Show current computation position
- **HBM Write-back Counter**: Track completion progress