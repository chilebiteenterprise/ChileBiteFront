import React, { useState } from 'react';
import { Blobatar } from '@blobatar/react';

/**
 * Componente de avatar geométrico determinista basado en Blobatar.
 * Se utiliza para usuarios que no cuentan con una foto de perfil personalizada.
 * Si el usuario posee foto de perfil (`src`), se muestra su foto; si no la tiene o falla al cargar,
 * se genera automáticamente un avatar geométrico Blobatar único y determinista.
 *
 * @param {Object} props
 * @param {string} props.name - Cadena base (email, username o id) para generar el avatar.
 * @param {number|string} [props.size=40] - Tamaño en píxeles o formato CSS.
 * @param {string} [props.className=''] - Clases Tailwind/CSS adicionales.
 * @param {string} [props.rounded='rounded-full'] - Estilo de bordes redondeados.
 * @param {string} [props.src] - URL de foto de perfil personalizada (si existe y es válida, tiene prioridad).
 * @param {boolean|'hover'|'always'} [props.animate=false] - Animación de Blobatar.
 * @param {string} [props.alt] - Texto descriptivo para accesibilidad.
 */
export default function BlobatarAvatar({
  name = 'Usuario',
  size = 40,
  className = '',
  rounded = 'rounded-full',
  src,
  animate = false,
  alt,
  ...rest
}) {
  const [hasError, setHasError] = useState(false);
  const seed = (name && typeof name === 'string' && name.trim()) ? name.trim() : 'Usuario';

  const hasValidCustomPhoto = src && 
    typeof src === 'string' && 
    src.trim() !== '' && 
    src !== '/default-avatar.png' && 
    !hasError;

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
        size={size}
        animate={animate}
        title={alt || seed}
        className="w-full h-full object-cover"
        {...rest}
      />
    </div>
  );
}
