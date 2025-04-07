'use client';

import { useState, useCallback } from 'react';
import * as imageProcessor from '@/lib/imageProcessor';
import Canvas from './components/Canvas';
import '../styles/globals.css';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<any>(null);

  // Manipular quando o canvas estiver pronto
  const handleCanvasReady = useCallback((canvasInstance: any) => {
    setCanvas(canvasInstance);
  }, []);

  // Manipular o upload de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      processImage(file);
    }
  };

  // Processar a imagem
  const processImage = async (file: File) => {
    if (!canvas) {
      setError('Canvas não está disponível. Tente recarregar a página.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await imageProcessor.processImage(canvas, file);
      if (!result) {
        throw new Error('Não foi possível gerar a imagem processada');
      }
      setProcessedImage(result);
    } catch (err: any) {
      console.error('Erro durante processamento:', err);
      setError(`Erro ao processar a imagem: ${err.message || 'Tente novamente ou use outra imagem'}`);
      setProcessedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download da imagem processada
  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'story-com-hud.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Auto HUD para Stories</h1>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Envie sua imagem</h2>
        <p className="mb-4">Carregue uma foto para aplicar o HUD e criar um Stories personalizado.</p>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn bg-blue-600 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Selecionar Imagem
          </label>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600">
              Arquivo selecionado: {selectedFile.name}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="text-center mb-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2">Processando sua imagem...</p>
        </div>
      )}

      {processedImage && !isProcessing && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Resultado</h2>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-4">
              <img
                src={processedImage}
                alt="Stories com HUD"
                className="w-full h-auto object-contain border rounded-lg"
              />
            </div>
            <button
              onClick={handleDownload}
              className="btn bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Baixar Imagem
            </button>
          </div>
        </div>
      )}

      {/* Canvas escondido usado para processamento */}
      <Canvas onCanvasReady={handleCanvasReady} />
    </main>
  );
} 