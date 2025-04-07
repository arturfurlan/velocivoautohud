# Auto HUD para Stories

Esta aplicação permite que você aplique automaticamente uma HUD (Head-Up Display) personalizada em suas fotos para criar stories do Instagram com aparência profissional.

## Funcionalidades

- Upload de imagens
- Aplicação automática da HUD personalizada
- Ajuste da imagem para o formato de Stories do Instagram (1080x1920)
- Download da imagem processada pronta para publicação

## Requisitos

- Node.js 18.0.0 ou superior
- NPM ou Yarn

## Como usar

1. Clone este repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```
4. Abra seu navegador em [http://localhost:3000](http://localhost:3000)
5. Carregue uma imagem, aplique a HUD e faça o download do resultado

## Personalização

Substitua o arquivo `public/hud.png` por sua própria HUD personalizada, mantendo o mesmo nome de arquivo.

## Tecnologias

- Next.js
- React
- Fabric.js para manipulação de imagens
- TailwindCSS para estilos

## Licença

MIT 