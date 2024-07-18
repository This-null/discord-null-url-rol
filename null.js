const {  Client, Partials, PermissionsBitField, ActivityType, GatewayIntentBits } = require('discord.js');
const cfg = require("./null/config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping
],
partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.ThreadMember
], 
allowedMentions:{
    repliedUser: false,
    parse: ['users','roles','everyone']
},


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
      setTimeout(() => {
       message.react(cfg.EMOJI);
    }, 3000); 
    }
    
  } else {
    setTimeout(() => {
       message.delete(3000);
    }, 3000); 
    
  }
});


// ------------ URL ROLU ALMA VERME OTOMATİK :) ------------ //

client.on('presenceUpdate', (oldPresence, newPresence) => {
  const guild = client.guilds.cache.get(cfg.GUILD_ID);
  const role = guild.roles.cache.get(cfg.ROLE_ID);
  if (!role) {
    return;
  }
  const member = guild.members.cache.get(newPresence.userId);
  if (!member) {
    return;
  }
  if (newPresence.activities[0]?.state?.includes(cfg.EXPECTED_STATUS)) {
    setTimeout(() => {
      member.roles.add(role)
        .catch(error => console.error('Rol ekleme hatası:', error));
    }, 3000); 
  } else {
    if (member.roles.cache.has(role.id)) {
      setTimeout(() => {
        member.roles.remove(role)
          .catch(error => console.error('Rol Kaldırma hatası:', error));
      }, 4000);
    }
  }
});

client.login(cfg.TOKEN);
