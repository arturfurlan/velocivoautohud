// Tamanho padrão do Stories do Instagram (1080x1920)
export const STORIES_WIDTH = 1080;
export const STORIES_HEIGHT = 1920;

/**
 * Verifica se o código está sendo executado no navegador
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Carrega uma imagem a partir de um arquivo ou URL
 */
export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = (err) => {
      console.error('Erro ao carregar imagem:', err);
      reject(new Error('Erro ao carregar imagem'));
    };
    
    if (typeof src === 'string') {
      try {
        // Adicionar timestamp para evitar cache
        const url = new URL(src, window.location.origin);
        url.searchParams.append('t', Date.now().toString());
        img.src = url.toString();
      } catch (e) {
        // Fallback para URLs relativas
        img.src = `${src}?t=${Date.now()}`;
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      reader.readAsDataURL(src);
    }
  });
}

/**
 * Centraliza e dimensiona uma imagem para caber em um canvas de tamanho fixo
 */
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x = 0,
  y = 0,
  w = ctx.canvas.width,
  h = ctx.canvas.height,
  offsetX = 0.5,
  offsetY = 0.5
) {
  // Retorna se a imagem ainda não estiver carregada
  if (img.width === 0) return;

  // Dimensões padrão
  const imgWidth = img.width;
  const imgHeight = img.height;

  // Escala para preencher
  const scale = Math.max(w / imgWidth, h / imgHeight);
  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  // Cálculo de offset
  const dx = x - (scaledWidth - w) * offsetX;
  const dy = y - (scaledHeight - h) * offsetY;
  
  // Renderiza a imagem centralizada
  ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
}

/**
 * Processa uma imagem aplicando a HUD
 */
export async function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Criar canvas com suporte a transparência
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { alpha: true });
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Limpar o canvas (importante para que comece transparente)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar a imagem original
      ctx.drawImage(img, 0, 0);
      
      // Carregar o HUD (usar PNG com transparência)
      const hudImg = new Image();
      hudImg.onload = () => {
        // Configurar para preservar a transparência do PNG
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        // Desenhar o HUD sobre a imagem
        ctx.drawImage(hudImg, 0, 0, canvas.width, canvas.height);
        
        // Converter o canvas para Blob e resolver a promessa
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        });
      };
      
      hudImg.onerror = () => {
        console.error('Erro ao carregar hud.png, tentando o formato jpg como fallback');
        // Tentar carregar o JPG como fallback
        hudImg.src = '/hud.jpg';
      };
      
      // Carregar o HUD PNG (com transparência)
      hudImg.src = '/hud.png';
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Carregar a imagem do arquivo
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
} 