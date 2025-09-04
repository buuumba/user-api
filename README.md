# User API

NestJS REST API с авторизацией, управлением пользователями, загрузкой файлов и системой балансов.

## Быстрый запуск

### Требования

- Node.js 18+
- Docker & Docker Compose

### Установка

```bash
# Клонирование и установка
git clone <repo-url>
cd user-api
npm install

# Настройка окружения
cp .env.example .env
# Отредактируйте .env файл

# Запуск инфраструктуры
docker-compose up -d

# Запуск приложения
npm run start:dev
```

### Переменные окружения (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=user_api

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=avatars
```

## API

- **Swagger**: http://localhost:3000/api
- **Health**: http://localhost:3000/health

### Основные эндпоинты

```bash
# Регистрация/Авторизация
POST /auth/register
POST /auth/login

# Пользователи
GET  /users (список)
GET  /users/profile/my (мой профиль)
PUT  /users/profile/my (обновить профиль)

# Аватары
POST /avatars/upload
DELETE /avatars/:id

# Баланс
GET  /balance
POST /balance/transfer

# Админ
POST /admin/balance/reset-all
GET  /admin/balance/job/:jobId
```

## Разработка

```bash
# Разработка
npm run start:dev

# Тесты
npm run test
npm run test:e2e

# Сборка
npm run build
npm run start:prod
```

## Архитектура

- **Auth**: JWT авторизация
- **Users**: CRUD пользователей + профили
- **Avatars**: Загрузка в MinIO (до 5 активных на юзера)
- **Balance**: Переводы между пользователями
- **Admin**: Массовые операции через Bull.js очереди
- **Cache**: Redis кэширование (30s TTL)
- **Logging**: Структурированные логи через LoggingUtils

---

📋 **TODO**: Рефактор архитектуры, микросервис Notification на Websockets (Socket.io), внедрение NATS.
