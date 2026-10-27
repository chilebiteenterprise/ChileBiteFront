import React, { useState, useEffect } from 'react';
import { Blobatar } from '@blobatar/react';

/**
 * Determina si una URL de avatar corresponde a un placeholder/imagen por defecto
 * y no a una foto personalizada genuinamente subida por el usuario.
 * @param {string|null|undefined} url - URL a evaluar.
 * @returns {boolean} true si es un placeholder o no es una imagen válida.
 */
export function isPlaceholderAvatar(url) {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed === '/default-avatar.png') return true;
  if (trimmed.includes('default-avatar')) return true;
  if (trimmed.includes('ui-avatars.com')) return true;
  if (trimmed.includes('default-user')) return true;
  if (trimmed.includes('avatar-placeholder')) return true;
  if (trimmed.includes('gravatar.com/avatar/00000000000000000000000000000000')) return true;
  return false;
}

/**
 * Componente de avatar geométrico determinista basado en Blobatar.
 * Se utiliza para usuarios que no cuentan con una foto de perfil personalizada.
 * Si el usuario posee foto de perfil válida (`src`), se muestra su foto; si no la tiene,
 * si apunta a un placeholder (ui-avatars, google default-user, etc.) o falla al cargar en red,
 * se genera automáticamente un avatar geométrico Blobatar único, determinista y consistente.
 *
 * @param {Object} props
 * @param {string} [props.name='Usuario'] - Cadena base (email, username o id) para generar el avatar.
 * @param {number|string} [props.size=40] - Tamaño en píxeles o formato CSS.
 * @param {string} [props.className=''] - Clases Tailwind/CSS adicionales.
 * @param {string} [props.rounded='rounded-full'] - Estilo de bordes redondeados.
 * @param {string} [props.src] - URL de foto de perfil personalizada.
 * @param {boolean|'hover'|'always'} [props.animate=false] - Animación de Blobatar.
 * @param {boolean|'square'|'circle'|'squircle'} [props.background='circle'] - Fondo geométrico armónico de Blobatar.
 * @param {string} [props.alt] - Texto descriptivo para accesibilidad.
 */
export default function BlobatarAvatar({
  name = 'Usuario',
  size = 40,
  className = '',
  rounded = 'rounded-full',
  src,
  animate = false,
  background = 'circle',
  alt,
  ...rest
}) {
  const [hasError, setHasError] = useState(false);

  // Reiniciar estado de error cuando la URL entrante cambie
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const seed = (name && typeof name === 'string' && name.trim()) ? name.trim() : 'Usuario';
  const numSize = typeof size === 'number' ? size : (parseInt(size, 10) || 40);

  const hasValidCustomPhoto = Boolean(
    src && 
    typeof src === 'string' && 
    !isPlaceholderAvatar(src) && 
    !hasError
  );

  if (hasValidCustomPhoto) {
    return (
      <img
        src={src}
        alt={alt || seed}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`object-cover ${rounded} ${className}`}
        {...rest}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden ${rounded} ${className}`}
      title={alt || seed}
    >
      <Blobatar
        name={seed}
        size={numSize}
        animate={animate}
        background={background}
        title={alt || seed}
        className="w-full h-full object-cover"
        {...rest}
      />
    </div>
  );
}

