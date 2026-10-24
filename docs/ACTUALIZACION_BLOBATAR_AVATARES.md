# Documentación Técnica: Integración de Avatares Deterministas con Blobatar

- **Tipo de Actualización:** `feat(avatars)` / Feature (Nueva funcionalidad UI & UX)
- **Fecha:** 2026-10-24
- **Módulos Afectados:** Autenticación, Navegación (Navbar), Perfiles y Sistema de Comentarios
- **Tecnologías:** `@blobatar/react`, `blobatar`, React, TailwindCSS, Supabase Auth

---

## 1. Resumen y Justificación

Anteriormente, los usuarios que no contaban con una imagen de perfil personalizada (`avatar_url`) o que experimentaban fallas al cargar imágenes externas dependían de iniciales simples o de servicios de terceros como `ui-avatars.com`, lo cual provocaba inconsistencias estéticas, parpadeos y solicitudes de red innecesarias.

Con esta actualización se implementó un sistema determinista y reactivo de generación de avatares mediante la librería **Blobatar** (`@blobatar/react`), garantizando que cada usuario tenga una identidad visual geométrica única, moderna y atractiva, calculada directamente a partir de su identificador (nombre de usuario, email o ID).

---

## 2. Dependencias Incorporadas

En el módulo frontend (`ChileBiteFront/Recetas/package.json`):
- **`@blobatar/react`**: `^2.7.0` - Componentes React para renderizado de avatares vectoriales SVG basados en algoritmos generativos.
- **`blobatar`**: `^2.7.0` - Motor de hashing y generación de semillas para formas y paletas cromáticas armónicas.

---

## 3. Componente Central: `BlobatarAvatar.jsx`

Ubicación: [`Recetas/src/shared/ui/BlobatarAvatar.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/shared/ui/BlobatarAvatar.jsx)

### Jerarquía de Renderizado:
1. **Foto personalizada (`src`)**: Si el usuario cuenta con una URL válida (Supabase Storage o proveedor OAuth) y no ha fallado su carga, se renderiza la imagen `<img>` con `onError` controlado.
2. **Fallback Determinista (`Blobatar`)**: Si la URL es nula, vacía, apunta al placeholder por defecto (`/default-avatar.png`), o falla la carga del recurso en red, el componente conmuta automáticamente hacia `<Blobatar />` usando como semilla (`seed`) el email, username o nombre disponible.

### Propiedades Principales:
| Prop | Tipo | Default | Descripción |
| :--- | :--- | :---: | :--- |
| `name` | `string` | `'Usuario'` | Semilla determinista que define la forma y colores del avatar. |
| `size` | `number \| string` | `40` | Dimensión cuadrada en píxeles. |
| `src` | `string` | `undefined` | URL de la imagen de perfil real. |
| `rounded` | `string` | `'rounded-full'` | Clase Tailwind para el radio de curvatura. |
| `animate` | `boolean \| string` | `false` | Posibilidad de habilitar microanimaciones interactivas. |
| `className` | `string` | `''` | Clases de personalización visual (bordes, sombras, etc.). |

---

## 4. Puntos de Integración

### 4.1. Barra de Navegación ([`Navbar.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/shared/layout/Navbar.jsx))
- **Botón de acceso rápido (Desktop):** Muestra el avatar con `size={28}` dentro del botón de perfil.
- **Popover de sesión:** En la tarjeta flotante de usuario, renderiza el avatar con `size={52}` y borde temático `brand-primary`.
- **Menú Responsive (Móvil):** En el panel deslizable de navegación móvil, muestra el avatar con `size={48}`.

### 4.2. Perfil de Usuario ([`UserProfile.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/features/profiles/components/UserProfile.jsx))
- Sustituye el contenedor estático de la letra inicial por `<BlobatarAvatar />` de `112px` de diámetro (`size={112}`), ofreciendo una apariencia premium tanto si el usuario tiene foto en Supabase como si usa el avatar determinista.

### 4.3. Sistema de Comentarios ([`CommentSection.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/features/comments/components/CommentSection.jsx))
- **Caja de publicación:** Muestra el avatar del usuario autenticado en tiempo real (`size={44}`).
- **Listado de comentarios:** Cada reseña y respuesta ahora renderiza a su autor con su avatar Blobatar asignado, destacando además con un borde diferenciado a los administradores (`border-brand-primary`).
- Soporte extendido para resolver la imagen de Google OAuth (`user_metadata.avatar_url` o `picture`) en caso de cuentas recién vinculadas.

### 4.4. Contexto de Autenticación ([`AuthContext.jsx`](file:///c:/Users/chrys/Documents/Github/ChileBite/ChileBiteFront/Recetas/src/features/auth/context/AuthContext.jsx))
- Sincronización proactiva: Al autenticarse con proveedores externos (como Google OAuth), si el perfil en la base de datos no tiene una foto registrada pero el proveedor sí la suministra, se actualiza automáticamente el campo `avatar_url` en Supabase y en el estado global.

---

## 5. Beneficios de Rendimiento y UX

1. **Cero solicitudes fallidas:** Se eliminan los errores 404 de avatares rotos o llamadas a APIs externas lentas.
2. **Coherencia visual:** Los colores y formas generados por Blobatar mantienen una estética suave y moderna acorde a la paleta de ChileBite.
3. **Privacidad y ligereza:** Generación 100% en el cliente mediante vectores SVG ligeros.
