# Etapa 1: build de la app
FROM node:20-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiar solo los archivos de dependencias para cachear npm install
COPY package*.json ./
RUN npm install

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copiar build al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx personalizada (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
