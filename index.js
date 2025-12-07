import { Telegraf } from "telegraf";
import pkg from "pg";
const { Client } = pkg;

// ====== ENV ======
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

// ====== CHECK TOKENS ======
if (!BOT_TOKEN) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN not found");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL not found");
  process.exit(1);
}

// ====== TELEGRAM BOT ======
const bot = new Telegraf(BOT_TOKEN);

// ====== POSTGRES CLIENT ======
const db = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Render требует SSL
});

async function connectDB() {
  try {
    await db.connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ Database error:", err);
  }
}

connectDB();

// ====== BOT COMMANDS ======

bot.start(async (ctx) => {
  ctx.reply("👋 Бот работает! База тоже подключена!");
});

// Пример записи в базу
bot.hears("save", async (ctx) => {
  try {
    await db.query("INSERT INTO logs(message) VALUES($1)", ["test"]);
    ctx.reply("✔ Сохранено в базу!");
  } catch (e) {
    ctx.reply("❌ Ошибка сохранения");
    console.log(e);
  }
});

// Пример чтения
bot.hears("show", async (ctx) => {
  try {
    const res = await db.query("SELECT * FROM logs ORDER BY id DESC LIMIT 5");
    ctx.reply("Последние записи:\n" + JSON.stringify(res.rows, null, 2));
  } catch (e) {
    ctx.reply("❌ Ошибка чтения");
    console.log(e);
  }
});

// ====== RUN BOT ======

bot.launch();
console.log("🚀 Bot started");

// Graceful stop (Render)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
