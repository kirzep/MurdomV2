// app/api/icons/[folder]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ИЗМЕНЕНИЕ: Добавляем новую папку в список разрешенных
const ALLOWED_FOLDERS = [
  'dashboard_background_icons', 
  'loading_screen',
  'dashboard_catcard_background_icons' // <--- ДОБАВЛЕНО
];

export async function GET(
  request: Request,
  { params }: { params: { folder: string } }
) {
  const folderName = params.folder;

  if (!ALLOWED_FOLDERS.includes(folderName)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const directoryPath = path.join(process.cwd(), `public/assets/icons/${folderName}`);
    
    const files = await fs.promises.readdir(directoryPath);
    
    const iconPaths = files
      .filter(file => /\.(svg|png|jpg|jpeg|webp)$/i.test(file))
      .map(file => `/assets/icons/${folderName}/${file}`);
      
    return NextResponse.json(iconPaths);
  } catch (error) {
    console.error(`API Error: Не удалось прочитать папку /assets/icons/${folderName}.`, error);
    return NextResponse.json([], { status: 500 });
  }
}