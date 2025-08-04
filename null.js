const {  Client, Partials, PermissionsBitField, EmbedBuilder,  ActivityType, GatewayIntentBits } = require('discord.js');
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
    client.user.setActivity({ name: `${cfg.STATUS[oyun]}`, type: ActivityType.Playing });
  }, 10000);

  
  setInterval(async () => {
    const guild = client.guilds.cache.get(cfg.GUILD_ID);
    const role = guild.roles.cache.get(cfg.ROLE_ID);
    const logChannel = guild.channels.cache.get(cfg.LOG_CHANNEL_ID);

    if (!guild || !role || !logChannel) return;

    const members = await guild.members.fetch();

    members.forEach(member => {
      const activity = member.presence?.activities[0];
      const state = activity?.state || "";
      const hasRole = member.roles.cache.has(role.id);
      const isExpected = state.includes(cfg.EXPECTED_STATUS);

      
      if (isExpected && !hasRole) {
        member.roles.add(role).then(() => {
          const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Rol Verildi')
            .setDescription(`<@${member.id}> kullanıcısına **${role.name}** rolü verildi.`)
            .setTimestamp();
          logChannel.send({ embeds: [embed] });
        }).catch(console.error);
      }

      
      if (!isExpected && hasRole) {
        member.roles.remove(role).then(() => {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Rol Kaldırıldı')
            .setDescription(`<@${member.id}> kullanıcısından **${role.name}** rolü kaldırıldı.`)
            .setTimestamp();
          logChannel.send({ embeds: [embed] });
        }).catch(console.error);
      }
    });

  }, 30000); 
});

// ------------ WORK KANALINA MESAJ ENGELİ ------------ //
client.on('messageCreate', async (message) => {
  const guildId = cfg.GUILD_ID;
  const channelId = cfg.CHANNEL_ID;

 
  if (message.channelId !== channelId || message.guildId !== guildId) return;

  
  const member = message.member;
  if (!member?.permissions.has('Administrator')) {
    
    if (message.attachments.size === 0) {
      setTimeout(() => {
        message.delete().catch(() => {});
      }, 3000);
    }
    return;
  }

  
  if (message.attachments.size > 0) {
    const attachment = message.attachments.first();

    if (attachment.width) {
      setTimeout(() => {
        message.react(cfg.EMOJI).catch(() => {});
      }, 3000);
    }
  }
});


// ------------ Check Sistemi mevcut olduğu için devredışı bırakıyoruz. ------------ //
/*

const cooldown = new Set();

client.on('presenceUpdate', (oldPresence, newPresence) => {
  const guild = client.guilds.cache.get(cfg.GUILD_ID);
  const role = guild.roles.cache.get(cfg.ROLE_ID);
  const logChannel = guild.channels.cache.get(cfg.LOG_CHANNEL_ID); 

  if (!role || !logChannel) return;

  const member = guild.members.cache.get(newPresence.userId);
  if (!member) return;

  
  if (cooldown.has(member.id)) return;

  const isExpected = newPresence.activities[0]?.state?.includes(cfg.EXPECTED_STATUS);

 
  cooldown.add(member.id);
  setTimeout(() => cooldown.delete(member.id), 5000); 

  if (isExpected) {
    setTimeout(() => {
      member.roles.add(role)
        .then(() => {
          const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Rol Verildi')
            .setDescription(`<@${member.id}> kullanıcısına **${role.name}** rolü verildi.`)
            .setTimestamp();
          logChannel.send({ embeds: [embed] });
        })
        .catch(error => console.error('Rol ekleme hatası:', error));
    }, 3000);
  } else {
    if (member.roles.cache.has(role.id)) {
      setTimeout(() => {
        member.roles.remove(role)
          .then(() => {
            const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('Rol Kaldırıldı')
              .setDescription(`<@${member.id}> kullanıcısından **${role.name}** rolü kaldırıldı.`)
              .setTimestamp();
            logChannel.send({ embeds: [embed] });
          })
          .catch(error => console.error('Rol kaldırma hatası:', error));
      }, 4000);
    }
  }
}); */

client.login(cfg.TOKEN);
