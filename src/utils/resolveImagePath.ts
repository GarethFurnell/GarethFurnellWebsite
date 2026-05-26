const basePath = '/GarethFurnellWebsite';

/**
 * Standardizes image path resolution by prepending the Next.js basePath.
 * This ensures images resolve correctly on both local development and GitHub Pages.
 */
export function resolveImagePath(src: string): string {
  if (!src) return '';
  
  // If it's an external link or already contains the basePath, return it as-is
  if (src.startsWith(basePath) || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Prepend basePath ensuring single leading slash
  const cleanSrc = src.startsWith('/') ? src : `/${src}`;
  return `${basePath}${cleanSrc}`;
}
