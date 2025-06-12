// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'cat-archive',
      script: 'npm',
      args: 'start',

      // Переменные окружения для продакшена
      env_production: {
        NODE_ENV: 'production',
        
        // Эта переменная нужна для корректной работы NextAuth
        NEXTAUTH_URL: 'http://localhost', 
        
        // НОВАЯ ПЕРЕМЕННАЯ: Этот же адрес для доступа к файлам
        // Префикс NEXT_PUBLIC_ делает ее доступной на клиенте
        NEXT_PUBLIC_APP_URL: 'http://localhost',

        // Вставьте сюда ваш секретный ключ
        NEXTAUTH_SECRET: '0f69503ba1641b3d573bf6697df11338',
      },
    },
  ],
};
