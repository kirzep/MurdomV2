// app/dashboard/page.tsx
import fs from 'fs';
import path from 'path';
import DashboardClient from './DashboardClient'; // Убедитесь, что импортируете новый компонент

// Эта функция выполняется на сервере
const getLoadingScreenIcons = (): string[] => {
  try {
    const directoryPath = path.join(process.cwd(), 'public/assets/icons/loading_screen');
    const files = fs.readdirSync(directoryPath);
    return files
      .filter(file => /\.(svg|png|jpg|jpeg|webp)$/i.test(file))
      .map(file => `/assets/icons/loading_screen/${file}`);
  } catch (error) {
    // В случае ошибки на сервере, просто вернем пустой массив
    console.error("Server Error: Не удалось прочитать папку с иконками.", error);
    return [];
  }
};

export default async function DashboardPage() {
  // Получаем список иконок на сервере
  const iconPaths = getLoadingScreenIcons();
  
  // Рендерим клиентский компонент и передаем ему иконки
  return <DashboardClient loadingIcons={iconPaths} />;
}