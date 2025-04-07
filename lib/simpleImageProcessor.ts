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
export async function processImage(imageFile: File): Promise<string> {
  if (!isBrowser()) {
    throw new Error('Não é possível processar imagens no servidor');
  }

  try {
    console.log('Carregando imagem do usuário...');
    // Carregar a imagem do usuário
    const userImage = await loadImage(imageFile);
    console.log('Imagem carregada com sucesso:', userImage.width, 'x', userImage.height);

    // Criar canvas no tamanho do Stories
    const canvas = document.createElement('canvas');
    canvas.width = STORIES_WIDTH;
    canvas.height = STORIES_HEIGHT;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      throw new Error('Não foi possível criar o contexto 2D');
    }
    
    // Fundo preto 
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, STORIES_WIDTH, STORIES_HEIGHT);
    
    // Desenhar a imagem do usuário centralizada e dimensionada
    console.log('Desenhando imagem no canvas...');
    
    // Melhorar a qualidade da renderização
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    drawImageProp(ctx, userImage);
    
    try {
      // Carregar e desenhar a HUD
      console.log('Carregando HUD...');
      const hudImage = await loadImage('/hud.jpg');
      console.log('HUD carregada com sucesso:', hudImage.width, 'x', hudImage.height);
      
      // Modo de composição que mantém mais detalhes da imagem original
      ctx.globalCompositeOperation = 'source-over';
      
      // Primeiro desenhar a HUD com uma opacidade mais baixa
      ctx.globalAlpha = 0.75; // 75% de opacidade para a HUD
      ctx.drawImage(hudImage, 0, 0, STORIES_WIDTH, STORIES_HEIGHT);
      
      // Resetar os parâmetros
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    } catch (hudError) {
      console.error('Erro ao carregar HUD, continuando sem aplicá-la:', hudError);
    }
    
    // Converter para data URL
    console.log('Gerando imagem final...');
    const dataUrl = canvas.toDataURL('image/png', 0.9);
    
    console.log('Processamento concluído com sucesso!');
    return dataUrl;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
} 