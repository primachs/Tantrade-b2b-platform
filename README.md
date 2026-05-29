# TanTrade B2B Platform

Quick setup for local development.

**NOTE: THIS IS A DEMO FOCUSING ON BUSINESS MATCH-MAKING WITHOUT CHAT/CONTACT FEATURE. OTHER FEATURES ARE UPCOMING.**

## Project Setup

From the project root:

1. Install backend dependencies:
   ```bash
   cd Backend
   composer install
   ```

2. Install frontend dependencies:
   ```bash
   cd ../Frontend
   npm install
   ```

## Seed the Database

Run the backend seeders first:

```bash
cd Backend
php artisan migrate:fresh --seed
```

## Start the Backend

```bash
cd Backend
php artisan serve --host=0.0.0.0 --port=8000
```

## Start the Frontend

```bash
cd Frontend
npm run dev
```

## Architecture Docs

See the design and domain documentation in [Docs](Docs/).
