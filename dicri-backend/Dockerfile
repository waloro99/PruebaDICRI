# dicri-backend/Dockerfile
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo package*.json para aprovechar cache
COPY package*.json ./

# Instalar dependencias (sin dev si quieres modo prod)
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Variable de entorno recomendada
ENV NODE_ENV=production

# Puerto donde escucha tu API (ajústalo si usas otro)
ENV PORT=3000
EXPOSE 3000

# Asegúrate de tener en package.json:
# "scripts": { "start": "node src/index.js" }  (o el archivo que uses)
CMD ["npm", "start"]
