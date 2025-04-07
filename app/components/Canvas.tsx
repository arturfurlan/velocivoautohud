'use client';

import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { STORIES_WIDTH, STORIES_HEIGHT } from '@/lib/imageProcessor';

interface CanvasProps {
  onCanvasReady: (canvas: any) => void;
}

export default function Canvas({ onCanvasReady }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<any>(null);

  useEffect(() => {
    // Não fazer nada durante a renderização do servidor
    if (typeof window === 'undefined') return;
    
    if (canvasRef.current && !canvasInstance.current) {
      try {
        // Usar Canvas regular em vez de StaticCanvas para suportar todas as operações necessárias
        canvasInstance.current = new fabric.Canvas(canvasRef.current, {
          width: STORIES_WIDTH,
          height: STORIES_HEIGHT,
          backgroundColor: '#000000',
          preserveObjectStacking: true,
        });

        // Notificar o componente pai que o canvas está pronto
        if (canvasInstance.current) {
          onCanvasReady(canvasInstance.current);
        }
      } catch (err) {
        console.error('Erro ao inicializar canvas:', err);
      }
    }

    // Cleanup
    return () => {
      if (canvasInstance.current) {
        try {
          canvasInstance.current.dispose();
          canvasInstance.current = null;
        } catch (err) {
          console.error('Erro ao limpar canvas:', err);
        }
      }
    };
  }, [onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'none' }}
      width={STORIES_WIDTH}
      height={STORIES_HEIGHT}
    />
  );
} 