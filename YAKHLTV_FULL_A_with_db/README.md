
YAKhltv — Full production-ready project (Node + Express + Prisma + PostgreSQL)

Quick start (locally):
1. npm install
2. Create .env with DATABASE_URL (postgres connection string)
3. npx prisma generate
4. npx prisma migrate dev --name init
5. node prisma/seed.js
6. npm start
Admin login: use /public admin modal with the ADMIN_PASS env var (default provided in render.yaml)

Render deployment: render.yaml included for automatic creation of service + DB.
