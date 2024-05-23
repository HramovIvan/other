const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

/* config.json:

{
    "BOT_TOKEN": "NOTACTUAL"
}

*/

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.MessageContent,
    ],
});

const prefix = "~";

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    client.guilds.cache.forEach((guild) => {
        console.log(`Server: ${guild.name}`);
        guild.channels.cache.forEach((channel) => {
            console.log(` - Channel: ${channel.name}, Type: ${channel.type}`);
        });
    });
});
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'move') {
        if (args.length !== 4) {
            message.reply('Использование: ~move <идентификатор пользователя> <идентификатор канала> <идентификатор нынешнего канала> <количество перекидываний>');
            return;
        }

        const userId = args[0];
        const channelId = args[1];
        const nowchannelId = args[2];
        const numOfPerk = args[3];

        const user = await message.guild.members.fetch(userId);

        if (!user) {
            message.reply('Пользователь не найден.');
            return;
        }

        const channel = message.guild.channels.cache.get(channelId);
        const nowchannel = message.guild.channels.cache.get(nowchannelId);

        if (!channel) {
            message.reply('Голосовой канал не найден.');
            return;
        }

        if (!nowchannel) {
            message.reply('Нынешний голосовой канал не найден.');
            return;
        }

        try {
            for (let i = 0; i < numOfPerk; i++) {
                user.voice.setChannel(channel);
                new Promise(resolve => setTimeout(resolve, 20));
                user.voice.setChannel(nowchannel);
                new Promise(resolve => setTimeout(resolve, 20));
            }

            message.reply(`Пользователь ${user.user.username} успешно вызван перекидываниями!`);
        } catch (error) {
            console.error(error);
            message.reply('Произошла ошибка при перемещении пользователя.');
        }
    } else if (command === 'sspam') {
        if (args.length !== 2) {
            message.reply('Использование: ~sspam <идентификатор пользователя> <количество сообщений>');
            return;
        }

        const userId = args[0];
        const numOfSpam = args[1];

        if (userId === "1088185365950644306") {
            message.reply('Нельзя!');
            return;
        }
        const user = await client.users.fetch(userId);
        if (!user) {
            message.reply('Пользователь не найден.');
            return;
        }

        try {
            for (let i = 0; i < numOfSpam; i++) {
                console.log(`Sending message ${i + 1} to user ${user.tag}`);
                await user.send('https://media.discordapp.net/attachments/797116457024094208/915984458992201738/GIF-d03458c1c2ac3037dbc9179d9b1880a1.gif');
                new Promise(resolve => setTimeout(resolve, 20));
            }
            message.reply(`Сообщение отправлено пользователю ${user.tag}.`);
        } catch (error) {
            console.error(error);
            message.reply('Произошла ошибка при отправке сообщения.');
        }
    }
});


client.login(config.BOT_TOKEN);
