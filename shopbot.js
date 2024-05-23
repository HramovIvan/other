const mysql = require('mysql');
const TelegramBot = require('node-telegram-bot-api');
const token = 'NOTACTUAL';
const bot = new TelegramBot(token, { polling: true });

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "telegram_bot"
});

const admin_chatid = NOTACTUAL

con.connect((err) => {
    if (err) throw err;
    let admins = [];
    let settings = { isLog: 1, isWork: 1 };
    let items = {};
    setInterval(() => {
        con.query("SELECT * FROM items", (err,rows,fields) => {
            if (err) throw err;
            rows.forEach(row => {
                items[row.id] = {
                    item_name: row.item_name,
                    item_desc: row.item_desc,
                    item_price: row.item_price,
                    item_sold: row.item_sold
                };
            });
        });

        con.query("SELECT * FROM settings", (err,res,fields) => {
            if (err) throw err;
            settings.isLog = res[0].isLog;
            settings.isWork = res[0].isWork;
        });

        con.query("SELECT * FROM admins", (err,rows,fields) => {
            if (err) throw err;
            admins = [];
            rows.forEach(row => {
                admins.push(row.tg_id);
            });
        });
    }, 50);

    //! COMMAND -> start
    bot.onText(/\/start/, (msg) => {
        if (settings.isWork === 0 && !admins.includes(msg.from.id)) { bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nБот на технических работах!`); return; }
        const timeNow = nowTime();
        let message = '👋 | Привет!\nВ данном боте Вы можете приобрести какие-либо услуги, предоставляемыми нами.\nС предоствляемыми услугами и ценами, можно ознакомиться ниже:\n';
        let keys = Object.keys(items);
        keys.forEach((key, index) => {
            let item = items[key];
            message += `${index+1} | ${item.item_name} (${item.item_desc}) - ${item.item_price}€\n`;
        });
        bot.sendMessage(msg.chat.id, message)
        .then((res) => {
            bot.sendMessage(msg.chat.id, `Приобрести какую-либо услугу можно командой:\n/buy {Цифровое значение товара*} {Дополнительная информация}\n\n<i>Аргументы, помеченные звездочкой (*), являются обязательными!\nДополнительная информация указана в круглых скобках у товаров.\nК заказу можно прикрепить фото.</i>`,{ parse_mode:'HTML' });
        })
        .then((res) => {
            if (settings.isLog === 1) {
                bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /start\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
            }
        });
    });

    //! COMMAND -> chatid
    bot.onText(/\/chatid/, (msg) => {
        if (settings.isWork === 0 && !admins.includes(msg.from.id)) { bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nБот на технических работах!`); return; }
        const timeNow = nowTime();
        bot.sendMessage(msg.chat.id, msg.chat.id)
        .then((res) => {
            if (settings.isLog === 1) {
                bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /chatid\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
            }
        });
    });

    //! COMMAND -> setadmin
    bot.onText(/\/setadmin (\d+)/, (msg,match) => {
        if (settings.isWork === 0 && !admins.includes(msg.from.id)) { bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nБот на технических работах!`); return; }
        const timeNow = nowTime();
        if (admins.includes(msg.from.id)) {
            if (admins.includes(parseInt(match[1]))) {
                con.query("DELETE FROM `admins` WHERE tg_id = " + match[1], (err,res,fields) => {
                    if (err) throw err;
                    bot.sendMessage(msg.chat.id, `✅ | Успешно\nПрава администратора сняты с пользователя: ${match[1]}!`)
                    .then((res) => {
                        if (settings.isLog === 1) {
                            bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setadmin ${match[1]}\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                        }
                    });
                });
            } else {
                con.query("INSERT INTO `admins`(`id`, `tg_id`) VALUES (NULL, " + match[1] + ")", (err,res,fields) => {
                    if (err) throw err;
                    bot.sendMessage(msg.chat.id, `✅ | Успешно\nПрава администратора выданы пользователю: ${match[1]}!`)
                    .then((res) => {
                        if (settings.isLog === 1) {
                            bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setadmin ${match[1]}\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                        }
                    });
                });
            }
        } else {
            bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nВы не являетесь администратором!`)
            .then((res) => {
                if (settings.isLog === 1) {
                    bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setadmin ${match[1]}\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                }
            });
        }
    });

    //! COMMAND -> setlogs
    bot.onText(/\/setlogs/, (msg) => {
        if (settings.isWork === 0 && !admins.includes(msg.from.id)) { bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nБот на технических работах!`); return; }
        const timeNow = nowTime();
        const isLog_before = settings.isLog
        if (admins.includes(msg.from.id)) {
            con.query(`UPDATE \`settings\` SET \`isLog\`='${settings.isLog === 1 ? '0' : '1'}'`, (err,res,fields) => {
                if (err) throw err;
                bot.sendMessage(msg.chat.id, `✅ | Успешно\nЛогирование действий ${isLog_before === 1 ? 'выключено' : 'включено'}!`)
                .then((res) => {
                    bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setlogs\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                });
            });
        } else {
            bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nВы не являетесь администратором!`)
            .then((res) => {
                if (settings.isLog === 1) {
                    bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setlogs\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                }
            });
        }
    });

    //! COMMAND -> setwork
    bot.onText(/\/setwork/, (msg) => {
        if (settings.isWork === 0 && !admins.includes(msg.from.id)) { bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nБот на технических работах!`); return; }
        const timeNow = nowTime();
        const isWork_before = settings.isWork
        if (admins.includes(msg.from.id)) {
            con.query(`UPDATE \`settings\` SET \`isWork\`='${settings.isWork === 1 ? '0' : '1'}'`, (err,res,fields) => {
                if (err) throw err;
                bot.sendMessage(msg.chat.id, `✅ | Успешно\nТех работы ${isWork_before === 1 ? 'включены' : 'выключены'}!`)
                .then((res) => {
                    bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setwork\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                });
            });
        } else {
            bot.sendMessage(msg.chat.id, `🛑 | Ошибка\nВы не являетесь администратором!`)
            .then((res) => {
                if (settings.isLog === 1) {
                    bot.sendMessage(admin_chatid, `[LOGS]\nИспользование команды: /setwork\nЧат: ${msg.chat.id}\nОт: ${msg.from.id}\nСтатус администратора: ${admins.includes(msg.from.id) ? 'TRUE' : 'FALSE'}\n\nДата действия: ${timeNow}`);
                }
            });
        }
    });

});

function nowTime() {
    const date = new Date();
    const timeNow = date.toLocaleString();
    return timeNow;
}