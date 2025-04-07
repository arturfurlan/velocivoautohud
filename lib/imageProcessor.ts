import * as fabric from 'fabric';

// Tamanho padrão do Stories do Instagram (1080x1920)
export const STORIES_WIDTH = 1080;
export const STORIES_HEIGHT = 1920;

/**
 * Cria uma nova instância do canvas da fabric.js
 */
export function createCanvas(): fabric.Canvas | null {
  if (typeof document === 'undefined') return null; // Verifica se está no servidor
  
  return new fabric.Canvas('canvas', {
    width: STORIES_WIDTH,
    height: STORIES_HEIGHT,
    backgroundColor: '#000000',
  });
}

/**
 * Carrega uma imagem a partir de um arquivo
 */
export function loadImage(file: File): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
        resolve(img);
      }, { crossOrigin: 'anonymous' });
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Carrega a imagem HUD
 */
export function loadHUD(): Promise<fabric.Image> {
  return new Promise((resolve) => {
    fabric.Image.fromURL('/hud.jpg', (img: fabric.Image) => {
      resolve(img);
    }, { crossOrigin: 'anonymous' });
  });
}

/**
 * Ajusta a imagem para caber no tamanho do Stories
 */
export function fitImageToStories(image: fabric.Image): void {
  const imgWidth = image.width || 0;
  const imgHeight = image.height || 0;
  
  // Calcular escalas
  const scaleX = STORIES_WIDTH / imgWidth;
  const scaleY = STORIES_HEIGHT / imgHeight;
  
  // Usar a maior escala para cobrir todo o canvas
  const scale = Math.max(scaleX, scaleY);
  
  image.scale(scale);
  
  // Centralizar a imagem
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  
  image.set({
    left: (STORIES_WIDTH - scaledWidth) / 2,
    top: (STORIES_HEIGHT - scaledHeight) / 2,
  });
}

/**
 * Aplica a HUD sobre a imagem e retorna o resultado como URL de dados
 */
export async function processImage(canvas: fabric.Canvas | null, imageFile: File): Promise<string> {
  if (!canvas) {
    throw new Error('Canvas não disponível');
  }
  
  // Limpar canvas
  canvas.clear();
  
  try {
    // Carregar a imagem do usuário
    const userImage = await loadImage(imageFile);
    
    // Ajustar ao tamanho do Stories
    fitImageToStories(userImage);
    
    // Adicionar a imagem ao canvas
    canvas.add(userImage);
    
    // Carregar e adicionar a HUD
    const hudImage = await loadHUD();
    canvas.add(hudImage);
    
    // Renderizar o canvas
    canvas.renderAll();
    
    // Retornar a imagem como dataURL
    return canvas.toDataURL({
      format: 'png',
      multiplier: 1
    });
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
} 