// lib/utils.ts

/**
 * Генерирует уникальный цвет на основе строки (например, имени кошки).
 * @param str - Входная строка.
 * @returns HEX-код цвета.
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

/**
 * Создает SVG-аватарку в виде строки.
 * @param name - Имя кошки, используется для первой буквы и цвета.
 * @returns Строка с данными SVG в формате Data URL.
 */
export function generateAvatar(name: string): string {
  const firstLetter = name.charAt(0).toUpperCase();
  const bgColor = stringToColor(name);

  // Определяем цвет текста для контрастности
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 125 ? '#000000' : '#FFFFFF';

  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${bgColor}" />
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="50" fill="${textColor}">
        ${firstLetter}
      </text>
    </svg>
  `;

  // Кодируем SVG в Base64 и возвращаем как Data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
