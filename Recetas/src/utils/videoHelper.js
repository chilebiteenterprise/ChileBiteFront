/**
 * Parsea una URL de video y devuelve metadatos para renderizar el embed correcto.
 * Soporta YouTube normal, Shorts y TikTok.
 */
export function getVideoEmbedInfo(url) {
  if (!url) return null;

  const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]+)/i);
  if (shortsMatch) {
    return {
      platform: 'YouTube',
      id: shortsMatch[1],
      embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`,
    };
  }

  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch) {
    return {
      platform: 'YouTube',
      id: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  const ytEmbedMatch = url.match(/youtube\.com\/embed\/([^"&?\/\s]{11})/i);
  if (ytEmbedMatch) {
    return {
      platform: 'YouTube',
      id: ytEmbedMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytEmbedMatch[1]}`,
    };
  }

  const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/i);
  if (tiktokMatch) {
    return {
      platform: 'TikTok',
      id: tiktokMatch[1],
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
    };
  }

  const tiktokEmbedMatch = url.match(/tiktok\.com\/embed\/v2\/(\d+)/i);
  if (tiktokEmbedMatch) {
    return {
      platform: 'TikTok',
      id: tiktokEmbedMatch[1],
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokEmbedMatch[1]}`,
    };
  }

  if (/tiktok\.com/i.test(url)) {
    return {
      platform: 'TikTok',
      id: null,
      embedUrl: url,
    };
  }

  return {
    platform: 'Unknown',
    id: null,
    embedUrl: url,
  };
}

/**
 * Mantiene compatibilidad con consumidores antiguos que solo esperaban la URL
 * lista para colocarla dentro de un <iframe>.
 */
export function getEmbedUrl(url) {
  const info = getVideoEmbedInfo(url);
  return info?.embedUrl || null;
}
