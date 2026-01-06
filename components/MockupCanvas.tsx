import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MockupState } from '../types';

interface MockupCanvasProps {
  state: MockupState;
  onStateChange: (newState: Partial<MockupState>) => void;
  width?: number;
  height?: number;
}

export interface MockupCanvasHandle {
  getCanvasData: () => string;
}

export const MockupCanvas = forwardRef<MockupCanvasHandle, MockupCanvasProps>(({ state, onStateChange, width = 600, height = 600 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    getCanvasData: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return '';
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = async () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f3f4f6'; // bg-gray-100 default
      ctx.fillRect(0, 0, width, height);

      // Draw Background
      if (state.bgImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = state.bgImage;
        await new Promise((resolve) => {
          bgImg.onload = () => {
            // Cover fit logic
            const scale = Math.max(width / bgImg.width, height / bgImg.height);
            const x = (width / 2) - (bgImg.width / 2) * scale;
            const y = (height / 2) - (bgImg.height / 2) * scale;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
            resolve(true);
          };
          bgImg.onerror = resolve; // Continue even if error
        });
      } else {
        // Fallback placeholder text
        ctx.fillStyle = '#9ca3af';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("No Product Selected", width / 2, height / 2);
      }

      // Draw Logo
      if (state.logoImage) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = state.logoImage;
        await new Promise((resolve) => {
          logoImg.onload = () => {
            const logoW = logoImg.width * state.logoScale;
            const logoH = logoImg.height * state.logoScale;
            // state.logoX/Y are center coordinates relative to canvas center
            const centerX = width / 2 + state.logoX;
            const centerY = height / 2 + state.logoY;
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
            ctx.restore();

            // Draw selection box if it helps visibility (optional)
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(centerX - logoW/2, centerY - logoH/2, logoW, logoH);
            
            resolve(true);
          };
          logoImg.onerror = resolve;
        });
      }
    };

    render();
  }, [state, width, height]);

  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!state.logoImage) return;
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !state.logoImage) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onStateChange({
      logoX: state.logoX + dx,
      logoY: state.logoY + dy
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 cursor-move touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="w-full h-auto block"
      />
      {!state.logoImage && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <p className="text-gray-400 bg-white/80 px-3 py-1 rounded-full text-sm">Upload a logo to place it</p>
         </div>
      )}
    </div>
  );
});

MockupCanvas.displayName = 'MockupCanvas';
