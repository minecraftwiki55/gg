const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('7633241912:AAHo2z94-p_5NMbHt-zBk-AzgGueUg8ZZHA', { polling: true });
const supportChatId = -1002172478190;
const pendingReports = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const message = `👋 نحن هنا لدعمك. اضغط على زر "🛠️ الدعم" أدناه للبدء.`;
    bot.sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🛠️ الدعم", callback_data: "start_support" }]
            ]
        }
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (query.data === "start_support") {
        bot.sendMessage(chatId, '🔍 يرجى اختيار نوع البلاغ:', {
            reply_markup: {
                keyboard: [
                    [{ text: "📞 الدعم الفني" }],
                    [{ text: "🚫 المشكلات" }],
                    [{ text: "📝 أخرى" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const reportType = msg.text;
    if (["📞 الدعم الفني", "🚫 المشكلات", "📝 أخرى"].includes(reportType)) {
        pendingReports[chatId] = { type: reportType, step: 'awaitingDetails' };
        bot.sendMessage(chatId, `✏️ من فضلك أرسل تفاصيل البلاغ الآن.`, { reply_markup: { remove_keyboard: true } });
    } else if (pendingReports[chatId] && pendingReports[chatId].step === 'awaitingDetails') {
        const reportDetails = msg.text;
        const reportType = pendingReports[chatId].type;
        delete pendingReports[chatId];
        const reportMessage = `📣 بلاغ جديد من ${msg.from.first_name}\n🗂️ نوع البلاغ: ${reportType}\n📜 التفاصيل: ${reportDetails}`;
        bot.sendMessage(supportChatId, reportMessage);
        bot.sendMessage(chatId, "✅ تم إرسال البلاغ بنجاح، شكرًا لك!");
        bot.sendMessage(chatId, `👋 نحن هنا لدعمك. اضغط على زر "🛠️ الدعم" أدناه للبدء.`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🛠️ الدعم", callback_data: "start_support" }]
                ]
            }
        });
    }
});