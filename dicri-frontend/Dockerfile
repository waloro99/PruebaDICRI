# dicri-frontend/Dockerfile

########################
# 1. Etapa de build
########################
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos package.json y lock solo de la subcarpeta frontend
COPY frontend/package*.json ./

RUN npm install

# Copiamos el resto del código del frontend
COPY frontend/ ./

# Si tu frontend ya llama al backend como "http://localhost:4000"
# no cambies nada. Si usas variable, puedes usar VITE_API_URL aquí.
RUN npm run build

########################
# 2. Etapa de servidor (nginx)
########################
FROM nginx:alpine

# Copiamos el build estático al nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
