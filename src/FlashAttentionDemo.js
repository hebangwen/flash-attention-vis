import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Info, Database, Cpu, Grid3x3 } from 'lucide-react';

const FlashAttentionDemo = () => {
  // Configuration parameters
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0); // 0: initial, 1: outer loop start, 2: inner loop compute, 3: update output
  const [qIdx, setQIdx] = useState(-1); // current Q block index
  const [kvIdx, setKvIdx] = useState(-1); // current KV block index
  const [speed, setSpeed] = useState(1000);
  
  const numBlocks = 4; // simplified to 4x4 block demonstration
  
  // simulated data state
  const [outputReady, setOutputReady] = useState(Array(numBlocks).fill(false));
  // track which blocks in Score Map are completed or being processed
  // 0: unprocessed, 1: processing, 2: completed
  const [scoreMapState, setScoreMapState] = useState(
    Array(numBlocks).fill(0).map(() => Array(numBlocks).fill(0))
  );

  // animation logic
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        handleNext();
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, qIdx, kvIdx, step, speed]);

  const handleNext = () => {
    if (qIdx === -1) {
      // start animation
      setQIdx(0);
      setKvIdx(0);
      setStep(1);
    } else if (step === 1) {
      // prepare to compute current block
      setStep(2);
      // update Score Map state: set current block to "processing"
      const newState = [...scoreMapState];
      newState[qIdx][kvIdx] = 1;
      setScoreMapState(newState);
    } else if (step === 2) {
      // finished computing one KV block, mark as completed
      const newState = [...scoreMapState];
      newState[qIdx][kvIdx] = 2;
      setScoreMapState(newState);

      if (kvIdx < numBlocks - 1) {
        setKvIdx(prev => prev + 1);
        setStep(1);
      } else {
        // completed scanning one row of Q
        setStep(3);
      }
    } else if (step === 3) {
      // write to Output
      const newOutputReady = [...outputReady];
      newOutputReady[qIdx] = true;
      setOutputReady(newOutputReady);
      
      if (qIdx < numBlocks - 1) {
        setQIdx(prev => prev + 1);
        setKvIdx(0);
        setStep(1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const reset = () => {
    setQIdx(-1);
    setKvIdx(-1);
    setStep(0);
    setIsPlaying(false);
    setOutputReady(Array(numBlocks).fill(false));
    setScoreMapState(Array(numBlocks).fill(0).map(() => Array(numBlocks).fill(0)));
  };

  // render matrix blocks (Q, K, V, O)
  const renderMatrix = (type, highlightIdx, isVertical = true) => {
    return (
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm`}>
        {Array.from({ length: numBlocks }).map((_, i) => (
          <div
            key={i}
            className={`
              ${isVertical ? 'w-16 h-12' : 'w-12 h-16'} 
              flex items-center justify-center text-xs font-bold rounded transition-all duration-300
              ${highlightIdx === i ? 'bg-blue-600 text-white scale-110 shadow-lg ring-2 ring-blue-300 z-10' : 'bg-white border border-gray-300 text-gray-400'}
              ${type === 'O' && outputReady[i] ? 'bg-emerald-100 text-emerald-700 border-emerald-400' : ''}
            `}
          >
            {type}{i}
          </div>
        ))}
      </div>
    );
  };

  // render center Score Map table
  const renderScoreMap = () => {
    return (
      <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-inner border border-slate-200">
        <div className="flex items-center gap-2 mb-3 text-slate-500 font-mono text-[10px] uppercase tracking-tighter">
          <Grid3x3 size={14} />
          <span>Attention Score Map (N x N)</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {scoreMapState.map((row, rIdx) => 
            row.map((cell, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`}
                className={`w-10 h-10 border rounded flex items-center justify-center text-[8px] font-mono transition-all duration-300
                  ${cell === 0 ? 'bg-slate-50 border-slate-100 text-slate-200' : ''}
                  ${cell === 1 ? 'bg-amber-400 border-amber-500 text-white scale-110 z-10 shadow-md ring-2 ring-amber-200' : ''}
                  ${cell === 2 ? 'bg-blue-100 border-blue-200 text-blue-500' : ''}
                  ${qIdx === rIdx && cell !== 1 ? 'border-blue-300 border-2' : ''}
                  ${kvIdx === cIdx && cell !== 1 ? 'border-purple-300 border-2' : ''}
                `}
              >
                {cell === 1 ? 'LIVE' : cell === 2 ? 'DONE' : `${rIdx},${cIdx}`}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-4 mt-3 text-[10px] text-slate-400">
           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded"></div> Computing</div>
           <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-100 rounded"></div> Staged</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">FLASH ATTENTION <span className="text-blue-600">VIZ</span></h1>
            <p className="text-slate-500 mt-1">IO-Aware Block-wise Attention Mechanism</p>
          </div>
          <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button onClick={reset} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600">
              <RotateCcw size={20} />
            </button>
            <div className="w-[1px] bg-slate-200 my-1"></div>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className={`p-3 px-6 rounded-xl transition-all font-bold flex items-center gap-2 shadow-sm ${isPlaying ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isPlaying ? <><Pause size={20} /> PAUSE</> : <><Play size={20} /> START</>}
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600">
              <SkipForward size={20} />
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-12 gap-2 mb-10 items-center">
          
          {/* Column 1: Q */}
          <div className="col-span-2 flex flex-col items-center">
            <div className="text-[11px] font-black mb-3 text-blue-600 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Database size={12} />
              Q ∈ ℝᴺˣᵈ
            </div>
            {renderMatrix('Q', qIdx)}
          </div>

          {/* Column 2: The Core (K, V, Map, SRAM) */}
          <div className="col-span-8 flex flex-col items-center space-y-6 px-4">
            
            {/* K & V Rows */}
            <div className="flex gap-8 justify-center w-full">
               <div className="flex flex-col items-center">
                 <div className="text-[11px] font-black mb-3 text-purple-600 flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                   <Database size={12} />
                   K ∈ ℝᴺˣᵈ
                 </div>
                 {renderMatrix('K', kvIdx, false)}
               </div>
               <div className="flex flex-col items-center">
                 <div className="text-[11px] font-black mb-3 text-pink-600 flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                   <Database size={12} />
                   V ∈ ℝᴺˣᵈ
                 </div>
                 {renderMatrix('V', kvIdx, false)}
               </div>
            </div>

            {/* Score Map and SRAM Interaction */}
            <div className="flex items-center gap-8 w-full justify-center">
              
              {/* Score Map Table */}
              {renderScoreMap()}

              {/* SRAM / Local Computing */}
              <div className="relative w-64 h-64 border-4 border-double border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50/50 overflow-hidden">
                <div className="absolute top-2 left-0 right-0 flex justify-center">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border shadow-sm">
                      <Cpu size={12} />
                      <span>ON-CHIP SRAM</span>
                   </div>
                </div>
                
                {step >= 1 ? (
                  <div className="flex flex-col gap-2 w-full p-4 animate-in fade-in zoom-in duration-300">
                      <div className={`p-2 rounded-lg text-center text-[10px] border shadow-sm transition-all ${step === 2 ? 'bg-blue-600 text-white border-blue-400' : 'bg-white text-slate-400'}`}>
                         LOAD Q{qIdx}, K{kvIdx}, V{kvIdx}
                      </div>
                      <div className={`p-2 rounded-lg text-center text-[10px] border shadow-sm transition-all ${step === 2 ? 'bg-amber-500 text-white border-amber-300' : 'bg-white text-slate-400'}`}>
                         S = Q{qIdx} @ K{kvIdx}ᵀ
                      </div>
                      <div className={`p-2 rounded-lg text-center text-[10px] border shadow-sm transition-all ${step === 2 ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-white text-slate-400'}`}>
                         Update O{qIdx} (Online Softmax)
                      </div>
                  </div>
                ) : (
                  <div className="text-slate-300 text-[10px] uppercase font-bold tracking-widest text-center">
                    Waiting for<br/>Data Blocks...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: O */}
          <div className="col-span-2 flex flex-col items-center">
            <div className="text-[11px] font-black mb-3 text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <Database size={12} />
              O ∈ ℝᴺˣᵈ
            </div>
            {renderMatrix('O', qIdx)}
          </div>

        </div>

        {/* Logic & Description */}
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3 bg-slate-900 text-slate-400 p-6 rounded-2xl font-mono text-xs shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Database size={80} />
            </div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <span className="text-blue-500 font-bold">ALGORITHM:</span>
              <span className="text-slate-600">flash_attention_forward(Q, K, V)</span>
            </div>
            <div className="space-y-1">
              <div className={qIdx !== -1 ? 'text-slate-600' : 'text-slate-200'}>// Divide Q, K, V into blocks of size Br, Bc</div>
              <div className={`${step === 1 || step === 2 ? 'text-blue-400 bg-blue-500/10 -mx-2 px-2' : ''}`}>For each block <span className="text-blue-300 font-bold">Q[{qIdx >= 0 ? qIdx : 'i'}]</span> in Q:</div>
              <div className={`${step === 2 ? 'text-amber-400 bg-amber-500/10 -mx-2 px-2' : ''} ml-4`}>For each block <span className="text-amber-300 font-bold">K[{kvIdx >= 0 ? kvIdx : 'j'}], V[{kvIdx >= 0 ? kvIdx : 'j'}]</span>:</div>
              <div className={`${step === 2 ? 'text-white' : ''} ml-8 italic`}>1. Load to SRAM (Low IO Cost)</div>
              <div className={`${step === 2 ? 'text-white' : ''} ml-8 italic`}>2. S = Q{qIdx >= 0 ? qIdx : 'i'} @ K{kvIdx >= 0 ? kvIdx : 'j'}ᵀ</div>
              <div className={`${step === 2 ? 'text-white' : ''} ml-8 italic`}>3. Update Local Softmax Stats (m, ℓ)</div>
              <div className={`${step === 2 ? 'text-white' : ''} ml-8 italic`}>4. Update Partial Output O{qIdx >= 0 ? qIdx : 'i'}</div>
              <div className={`${step === 3 ? 'text-emerald-400 bg-emerald-500/10 -mx-2 px-2' : ''} ml-4`}>Write block <span className="text-emerald-300 font-bold">O{qIdx >= 0 ? qIdx : 'i'}</span> to HBM (Final Output)</div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
                <Info size={18} />
                <span className="text-sm">Computation Stats</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Current Block Coordinates</p>
                  <p className="text-lg font-mono font-bold text-slate-800">
                    {qIdx >= 0 && kvIdx >= 0 ? `(${qIdx}, ${kvIdx})` : '--'}
                  </p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">HBM Write-back Count</p>
                  <p className="text-lg font-mono font-bold text-emerald-600">
                    {outputReady.filter(Boolean).length} / {numBlocks}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Demo Speed</p>
              <input 
                type="range" 
                min="200" 
                max="2000" 
                step="100" 
                value={2200 - speed} 
                onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashAttentionDemo;
