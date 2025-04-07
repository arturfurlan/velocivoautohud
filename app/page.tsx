'use client';

import { useState } from 'react';
import * as imageProcessor from '@/lib/simpleImageProcessor';
import '../styles/globals.css';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      processImageHandler(file);
    }
  };

  // Processar a imagem
  const processImageHandler = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      setProcessingStatus('Iniciando processamento...');
      
      const processedImageBlob = await imageProcessor.processImage(file);
      const processedImageUrl = URL.createObjectURL(processedImageBlob);
      
      setProcessingStatus('Finalizando...');
      setProcessedImage(processedImageUrl);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setError('Ocorreu um erro ao processar a imagem. Por favor, tente novamente.');
      setProcessedImage(null);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Download da imagem processada
  const handleDownload = () => {
    if (!processedImage) return;

    try {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'story-com-hud.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      setError('Erro ao fazer download da imagem.');
    }
  };

  // Abrir a ferramenta de conversão HUD para PNG
  const openHudConverter = () => {
    window.open('/scripts/convertHud.html', '_blank');
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Velocivo Auto HUD</h1>
          <p className="text-gray-600">Adicione automaticamente o HUD da Velocivo às suas imagens</p>
          
          {/* Botão para acessar ferramenta de conversão */}
          <button
            onClick={openHudConverter}
            className="mt-2 text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors"
          >
            Ferramenta de Conversão HUD
          </button>
        </header>
        
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
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className={`btn bg-blue-600 text-white px-6 py-3 rounded-md cursor-pointer hover:bg-blue-700 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processando...' : 'Selecionar Imagem'}
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-lg font-medium">{processingStatus || 'Processando sua imagem...'}</p>
            <p className="text-sm text-gray-500 mt-1">Isso pode levar alguns segundos</p>
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
      </div>
    </main>
  );
} 