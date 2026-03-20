# 🍴 Frontend ChileBite

Este es el **frontend** de ChileBite, un recetario web con sistema de usuarios, galería de recetas filtrables, perfiles de locales de comida y comentarios.  
Está construido con **Astro** + **React** y usa **Tailwind CSS** para el diseño.

---

## 📦 Tecnologías principales

* **Astro (v5.x):** Generador de sitios estáticos y SSR.  
* **React:** Componentes interactivos.  
* **Tailwind CSS:** Estilos y diseño responsivo.  
* **HeroUI v3 Beta:** Librería principal de componentes UI interactivos.  
* **Supabase:** SDK `@supabase/supabase-js` para gestión completa de Autenticación, Perfiles y Almacenamiento.
* **Docker:** Para contenedores opcionales de desarrollo y despliegue.  
* **npm:** Manejo de dependencias y scripts.

---

## ⚙️ Requisitos previos

Antes de levantar el frontend necesitas:

1.  **Node.js v20+** y **npm v9+**
    ```bash
    node -v
    npm -v
    ```
2.  **Docker y Docker Compose** si vas a usar contenedores.
3.  **Backend corriendo (API)** si quieres que el frontend se conecte y muestre datos reales.

---

## 📂 Archivos clave

| Archivo / Carpeta | Descripción |
| :--- | :--- |
| `package.json` | Dependencias, scripts y configuración de npm. |
| `astro.config.mjs` | Configuración principal de Astro. |
| `Recetas/` | Carpeta principal del frontend con componentes, páginas y estilos. |
| `Recetas/components/` | Componentes React usados en la UI (RecetaCard, filtros, etc.). |
| `Recetas/pages/` | Páginas públicas y rutas del frontend. |
| `public/` | Archivos estáticos (imágenes, favicon, etc.). |
| `.env` | Variables de entorno (puerto, URL de backend, etc.). |

> [!TIP]
> **Nota:** Modifica `.env` si cambias el puerto o las claves, por ejemplo:
> ```env
> VITE_API_URL=http://localhost:8000/api
> VITE_SUPABASE_URL=https://[tu-id].supabase.co
> VITE_SUPABASE_ANON_KEY=ey...
> ```

---

## 🎨 Premium Glassmorphism Design System

Cualquier nuevo componente que se agregue al frontend **debe adherirse a las reglas estéticas de Glassmorphism Premium**:
1. Utilizar utilidades de cristal: `backdrop-blur-md`, `bg-white/10` (en light) o `bg-zinc-900/40` (en dark).
2. Clases nativas de Tailwind o equivalentes en HeroUI que añadan transiciones de estado: `transition-all`, hover properties suaves, animaciones de resorte.
3. Para la gama de color, emplear la paleta de colores café (eg. `#b08968`) e integrarse sin problemas con los modos `light` y `dark`.
4. Siempre usar la clase estandarizada `premium-glass-panel` si está disponible en la hoja de estilos global antes de intentar micro-manejar CSS en línea.

---

## 🔒 Autenticación y Astro Islands (Supabase)

La plataforma utiliza **Supabase Auth** de forma nativa. Para prevenir problemas de hidratación asíncrona entre múltiples *Astro Islands* (componentes React separados que se renderizan independientemente), hemos implementado un **Singleton Pattern en el AuthContext**.
- Este patrón garantiza que la sesión de Supabase (`supabase.auth.getSession`) se solicita una única vez y las promesas se comparten entre todos los árboles React, evitando cuellos de botella y dobles ejecuciones.
- Las vistas condicionales asumen `useAuth()` para extraer el estado real del usuario sin realizar llamadas superfluas al backend de Django.

---

## 💻 Instalación local (sin Docker)

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu_usuario/ChileBiteFront.git](https://github.com/tu_usuario/ChileBiteFront.git)
    cd ChileBiteFront/Recetas
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar el proyecto en modo desarrollo:**
    ```bash
    npm run dev
    ```
4.  **Abrir en el navegador:** Accede a [http://localhost:4321](http://localhost:4321)

---

## 🐳 Uso con Docker

Si prefieres levantar el frontend usando Docker para evitar conflictos de versiones:

1.  **Construir y levantar contenedores:**
    ```bash
    docker-compose up --build
    ```
    *Esto levantará el frontend, backend (si está configurado) y la base de datos.*

2.  **Acceso:** Abre [http://localhost:4321](http://localhost:4321).  
    *Nota: El `--host 0.0.0.0` en Astro permite exponerlo correctamente en localhost desde el contenedor.*

### Comandos útiles de Docker
* **Ejecutar migraciones (vía Backend):**
    ```bash
    docker-compose exec backend python manage.py migrate
    ```
* **Reiniciar frontend sin reconstruir imagen:**
    ```bash
    docker-compose restart frontend
    ```

---

## ⚡ Scripts importantes (package.json)

| Comando | Función |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Hot Reload. |
| `npm run build` | Genera la versión de producción optimizada. |
| `npm run preview` | Levanta un servidor local para probar la build. |
| `npm run format` | Formatea el código con Prettier. |

---

## 🔧 Guía de Modificación y Contribución

Si necesitas realizar cambios o añadir funcionalidades, sigue estas rutas:

* **Rutas y Navegación:** Las páginas se gestionan en `Recetas/pages/`. Astro usa un sistema basado en archivos.
* **UI y Lógica:** Los componentes de React (como `RecetaCard`) se encuentran en `Recetas/components/`.
* **Estilos:** Se utiliza Tailwind CSS. Puedes modificar `tailwind.config.mjs` para temas personalizados.
* **Assets:** Guarda imágenes y logos en la carpeta `public/`.

### Flujo de Contribución
1.  Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2.  Realiza tus cambios y haz commit: `git commit -m 'Añade nueva funcionalidad'`
3.  Sube tus cambios: `git push origin feature/nueva-funcionalidad`
4.  Abre un **Pull Request**.



---

**© 2026 ChileBite Team. Todos los derechos reservados.**
