// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'cat-archive', // Имя вашего приложения
      script: 'npm',         // Запускаем через npm
      args: 'start',         // Выполняем команду "npm start"

      // Переменные окружения для продакшена
      env_production: {
        NODE_ENV: 'production',
        // Укажите здесь ваш домен или IP-адрес
        NEXTAUTH_URL: 'http://82.202.143.74', 
        
        // Вставьте сюда ваш секретный ключ из файла .env.local
        NEXTAUTH_SECRET: '0f69503ba1641b3d573bf6697df11338',
      },
    },
  ],
};
