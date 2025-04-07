import * as fabric from 'fabric';

// Tamanho padrão do Stories do Instagram (1080x1920)
export const STORIES_WIDTH = 1080;
export const STORIES_HEIGHT = 1920;

/**
 * Verifica se o código está sendo executado no navegador
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Cria uma nova instância do canvas da fabric.js
 */
export function createCanvas(canvasElement: HTMLCanvasElement | null): any {
  if (!isBrowser()) {
    console.log('Canvas não pode ser criado no servidor');
    return null;
  }
  
  if (!canvasElement) {
    console.error('Elemento canvas não encontrado');
    return null;
  }
  
  try {
    // Usar o StaticCanvas em vez do Canvas interativo
    return new fabric.StaticCanvas(canvasElement, {
      width: STORIES_WIDTH,
      height: STORIES_HEIGHT,
      backgroundColor: '#000000',
    });
  } catch (err) {
    console.error('Erro ao criar o canvas:', err);
    throw new Error('Falha ao criar o canvas');
  }
}

/**
 * Carrega uma imagem a partir de um arquivo
 */
export function loadImage(file: File): Promise<any> {
  if (!isBrowser()) {
    return Promise.reject(new Error('Não é possível carregar imagens no servidor'));
  }

  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        try {
          // @ts-ignore
          fabric.Image.fromURL(dataUrl, (img: any) => {
            if (!img) {
              reject(new Error('Falha ao carregar a imagem'));
              return;
            }
            resolve(img);
          });
        } catch (err) {
          console.error('Erro ao processar imagem com fabric:', err);
          reject(new Error('Erro ao processar a imagem'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Erro ao iniciar leitura do arquivo:', err);
      reject(new Error('Erro ao processar o arquivo'));
    }
  });
}

/**
 * Carrega a imagem HUD
 */
export function loadHUD(): Promise<any> {
  if (!isBrowser()) {
    return Promise.reject(new Error('Não é possível carregar imagens no servidor'));
  }

  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      fabric.Image.fromURL('/hud.jpg', (img: any) => {
        if (!img) {
          reject(new Error('Falha ao carregar a HUD'));
          return;
        }
        resolve(img);
      });
    } catch (err) {
      console.error('Erro ao carregar HUD:', err);
      reject(new Error('Erro ao carregar a HUD'));
    }
  });
}

/**
 * Ajusta a imagem para caber no tamanho do Stories
 */
export function fitImageToStories(image: any): void {
  if (!image) return;
  
  try {
    const imgWidth = image.width || 0;
    const imgHeight = image.height || 0;
    
    if (imgWidth <= 0 || imgHeight <= 0) return;
    
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
      selectable: false,
      evented: false,
    });
  } catch (err) {
    console.error('Erro ao ajustar imagem:', err);
  }
}

/**
 * Aplica a HUD sobre a imagem e retorna o resultado como URL de dados
 */
export async function processImage(canvas: any, imageFile: File): Promise<string> {
  if (!isBrowser()) {
    throw new Error('Não é possível processar imagens no servidor');
  }

  if (!canvas) {
    throw new Error('Canvas não disponível');
  }
  
  // Limpar canvas
  try {
    canvas.clear();
    canvas.renderAll();
  } catch (err) {
    console.error('Erro ao limpar o canvas:', err);
    throw new Error('Erro ao preparar o canvas para processamento');
  }
  
  try {
    console.log('Carregando imagem do usuário...');
    // Carregar a imagem do usuário
    const userImage = await loadImage(imageFile);
    console.log('Imagem carregada, ajustando tamanho...');
    
    // Ajustar ao tamanho do Stories
    fitImageToStories(userImage);
    
    // Adicionar a imagem ao canvas
    canvas.add(userImage);
    canvas.renderAll();
    
    console.log('Carregando HUD...');
    // Carregar e adicionar a HUD
    const hudImage = await loadHUD();
    hudImage.set({
      selectable: false,
      evented: false,
    });
    canvas.add(hudImage);
    
    // Renderizar o canvas
    console.log('Renderizando resultado final...');
    canvas.renderAll();
    
    // Esperar um momento para garantir que o canvas terminou de renderizar
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Retornar a imagem como dataURL
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    
    if (!dataUrl) {
      throw new Error('Falha ao gerar a imagem final');
    }
    
    console.log('Processamento concluído com sucesso!');
    return dataUrl;
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    throw error;
  }
} 