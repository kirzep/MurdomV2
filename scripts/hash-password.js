// scripts/hash-password.js
const bcrypt = require('bcrypt');
const { EOL } = require('os'); // Для корректного переноса строки

// Получаем пароль из аргументов командной строки
const password = process.argv[2];

if (!password) {
  console.error('Ошибка: Пожалуйста, укажите пароль.');
  console.log('Пример использования: node scripts/hash-password.js "мой-супер-пароль"');
  process.exit(1);
}

// Количество раундов хеширования. 10 — это хороший баланс между безопасностью и скоростью.
const saltRounds = 10;

console.log('Создание хеша для вашего пароля...');

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Произошла ошибка при хешировании:', err);
    process.exit(1);
  }
  
  // Выводим результат в удобном формате
  console.log('--- Готово! ---' + EOL);
  console.log('Пароль:', password);
  console.log('Хеш (скопируйте это значение в базу данных):' + EOL);
  console.log(hash);
  console.log(EOL + '----------------');
});
