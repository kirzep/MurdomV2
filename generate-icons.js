// generate-icons.js

const sharp = require('sharp');
const fs = require('fs').promises;
const toIco = require('to-ico');

// --- НАСТРОЙКИ ---
// Укажите путь к вашему исходному логотипу
const SOURCE_IMAGE = 'logo.png'; 

// Папка, куда будут сохранены иконки (должна совпадать с той, что в вашем коде)
const OUTPUT_DIR = 'public/icons'; 

// Список иконок, которые нужно сгенерировать
const ICONS_TO_GENERATE = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'android-chrome-192x192.png', size: 192 }, // Рекомендуется для Android/PWA
  { name: 'android-chrome-512x512.png', size: 512 }, // Рекомендуется для Android/PWA
  { name: 'apple-touch-icon.png', size: 180 },       // Стандартный размер для Apple устройств
];
// --- КОНЕЦ НАСТРОЕК ---


// Основная асинхронная функция для выполнения всех операций
async function generateIcons() {
  try {
    console.log('🚀 Начинаем генерацию иконок...');

    // Проверяем и создаем выходную директорию, если её нет
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const pngBuffers = []; // Будем хранить буферы PNG для создания ICO

    // 1. Генерируем все PNG файлы
    for (const icon of ICONS_TO_GENERATE) {
      const outputPath = `${OUTPUT_DIR}/${icon.name}`;
      console.log(`- Создаем ${outputPath} (${icon.size}x${icon.size})...`);
      
      const buffer = await sharp(SOURCE_IMAGE)
        .resize(icon.size, icon.size)
        .png()
        .toBuffer();
        
      await fs.writeFile(outputPath, buffer);
      
      // Сохраняем буферы для ICO, если размер подходит (обычно 16, 32, 48)
      if (icon.size === 16 || icon.size === 32) {
        pngBuffers.push(buffer);
      }
    }
    console.log('✅ PNG иконки успешно созданы.');

    // 2. Генерируем favicon.ico из PNG файлов (16x16 и 32x32)
    if (pngBuffers.length > 0) {
      console.log('- Создаем favicon.ico...');
      const icoBuffer = await toIco(pngBuffers);
      await fs.writeFile(`${OUTPUT_DIR}/favicon.ico`, icoBuffer);
      console.log('✅ favicon.ico успешно создан.');
    }

    console.log('✨ Генерация всех иконок завершена!');

  } catch (error) {
    console.error('❌ Произошла ошибка во время генерации иконок:');
    console.error(error);
  }
}

// Запускаем функцию
generateIcons();