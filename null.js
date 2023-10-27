const {  Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const cfg = require("./null/config");

const client = new Client({
  intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildPresences,GatewayIntentBits.GuildMessageReactions,GatewayIntentBits.DirectMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.AutoModerationConfiguration,GatewayIntentBits.AutoModerationExecution,GatewayIntentBits.DirectMessageReactions,GatewayIntentBits.DirectMessageTyping,GatewayIntentBits.GuildEmojisAndStickers,GatewayIntentBits.GuildIntegrations,GatewayIntentBits.GuildInvites,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessageTyping,GatewayIntentBits.GuildModeration,GatewayIntentBits.GuildScheduledEvents,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.GuildWebhooks,],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction , Partials.GuildMember , Partials.GuildScheduledEvent , Partials.ThreadMember]
});


// ------------ BOTUN OYNUYOR KISMI ------------ //

client.on('ready', () => {
  console.log(`${client.user.tag} Kullanıma Hazır.`);
  client.user.setStatus("idle");
  setInterval(() => {
  const oyun = Math.floor(Math.random() * (cfg.STATUS.length));
  client.user.setActivity({name: `${cfg.STATUS[oyun]}`, type: ActivityType.Playing});
}, 10000);
});

// ------------ WORK KANALINA MESAJ ENGELİ ------------ //
client.on('messageCreate', async (message) => {
  const guildId = cfg.GUILD_ID;
  const channelId = cfg.CHANNEL_ID;
  if (message.channelId !== channelId || message.guildId !== guildId) return;
  if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.width) {
          await message.react(cfg.EMOJI);
      }
  } else {
      await message.delete();

  }
});


// ------------ URL ROLU ALMA VERME OTOMATİK :) ------------ //

client.on('presenceUpdate', (oldPresence, newPresence) => {
  const guild = client.guilds.cache.get(cfg.GUILD_ID);
  const role = guild.roles.cache.get(cfg.ROLE_ID);
  if (!role) {
    console.error('Rol bulunamadı.');
    return;
  }
  const member = guild.members.cache.get(newPresence.userId);
 if (!member) {
    return;
 }
  if (newPresence.activities[0]?.state?.includes(cfg.EXPECTED_STATUS)) {
      member.roles.add(role)
        .catch(error => console.error('Rol ekleme hatası:', error));
    } else {
    if (member.roles.cache.has(role.id)) {
      member.roles.remove(role)
        .catch(error => console.error('Rol Kaldırma hatası:', error));
    }
  }
});

client.login(cfg.TOKEN);
