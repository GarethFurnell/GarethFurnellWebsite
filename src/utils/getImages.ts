import fs from 'fs';
import path from 'path';

export function getImages(directory: string): string[] {
  const directoryPath = path.join(process.cwd(), 'public', 'images', directory);
  
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const files = fs.readdirSync(directoryPath);
  
  // Filter for common image extensions
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });

  // Return the public URL paths
  return imageFiles.map(file => `/images/${directory}/${file}`);
}
