import { Telegraf } from 'telegraf';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "9177872661:AAFGLbt9H4GfYGPGTxxkOuEF3H11vXhz2Us";
const SERVER_URL = process.env.SERVER_URL;
if (!BOT_TOKEN) {
    console.error('❌ Warning: TELEGRAM_BOT_TOKEN is missing in environment variables.');
}
const bot = new Telegraf(BOT_TOKEN || 'mock_token');
export const initTelegramBot = async (app) => {
    if (!BOT_TOKEN)
        return;
    bot.start((ctx) => {
        ctx.reply(`مرحباً بك يا ${ctx.from?.first_name} في بوت منصتنا الموحد! 🤖\n\nمعرف الشات الخاص بك (Chat ID) هو:\n<code>${ctx.chat?.id}</code>`, { parse_mode: 'HTML' });
    });
    bot.command('status', (ctx) => {
        ctx.reply(`🚀 الخادم يعمل بنجاح في بيئة: [ ${process.env.NODE_ENV || 'development'} ]`);
    });
    bot.on('text', (ctx) => {
        if ('text' in ctx.message) {
            ctx.reply(`لقد استقبلت رسالتك النصية: "${ctx.message.text}"`);
        }
    });
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && SERVER_URL) {
        const secretPath = `/telegraf_webhook/${bot.secretPathComponent()}`;
        app.use(bot.webhookCallback(secretPath));
        await bot.telegram.setWebhook(`${SERVER_URL}${secretPath}`);
        console.log(`🚀 [Production] Telegram Bot Webhook injected successfully.`);
    }
    else {
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        bot.launch()
            .then(() => console.log('💻 [Development] Telegram Bot started via Long Polling.'))
            .catch((err) => console.error('❌ Failed to launch Telegram Bot locally:', err));
    }
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
export const sendTelegramNotification = async (chatId, text) => {
    try {
        await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' });
    }
    catch (error) {
        if (error.response && error.response.error_code === 400) {
            console.warn(`⚠️ User ${chatId} has not started a conversation with the bot yet.`);
        }
        else {
            console.error(`❌ Failed to send Telegram message to ${chatId}:`, error);
        }
    }
};
