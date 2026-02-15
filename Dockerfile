# Frontend - desarrollo con Node
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias desde Recetas
COPY Recetas/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código desde Recetas
COPY Recetas/ ./

# Exponer el puerto que Astro usa por defecto
EXPOSE 3000

# Comando para desarrollo (hot-reload)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
