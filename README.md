# Internal Auction App

Web app dau gia noi bo cho thiet bi cong ty.

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## Chay local

1. Copy `.env.example` thanh `.env`.
2. Chay PostgreSQL:

```powershell
docker compose up -d
```

3. Cai dependencies:

```powershell
npm.cmd install
```

4. Tao Prisma client va migration:

```powershell
npm.cmd run db:migrate
```

5. Seed tai khoan mau:

```powershell
npm.cmd run db:seed
```

6. Chay app:

```powershell
npm.cmd run dev
```

Mac dinh app chay tai `http://localhost:3001`.

## Demo accounts

- Admin: `admin@company.local`
- Employee: `alice@company.local`, `bob@company.local`, `carol@company.local`
- Password chung: `Password123!`
