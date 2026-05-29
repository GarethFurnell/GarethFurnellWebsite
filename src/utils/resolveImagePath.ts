/**
 * Standardizes image path resolution.
 */
export function resolveImagePath(src: string): string {
  if (!src) return '';
  
  // If it's an external link, return it as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Ensure single leading slash
  const cleanSrc = src.startsWith('/') ? src : `/${src}`;
  return cleanSrc;
}
