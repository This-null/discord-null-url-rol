const { Client, Partials, EmbedBuilder, ActivityType, GatewayIntentBits, Routes } = require('discord.js');
const Buzdolabi = require("./null/config");

const Firin = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message],
});

async function LezzetKontrolu(member) {
    if (!member || member.user.bot) return;

    try {
        const Guild = member.guild;
        if (Guild.id !== Buzdolabi.GUILD_ID) return;

        const SpesiyalTabak = Guild.roles.cache.get(Buzdolabi.ROLE_ID);
        const AdisyonKagidi = Guild.channels.cache.get(Buzdolabi.LOG_CHANNEL_ID);
        if (!SpesiyalTabak) return;

        const TAG = Buzdolabi.GUILD_CLAN_TAG; 
        let HakEdiyor = member.displayName.includes(TAG) || member.user.username.includes(TAG);

        const DurumAktivitesi = member.presence?.activities?.find(a => a.type === ActivityType.Custom);
        if (DurumAktivitesi?.state?.includes(Buzdolabi.EXPECTED_STATUS)) HakEdiyor = true;

        if (!HakEdiyor) {
            try {
                const HamVeri = await Firin.rest.get(Routes.user(member.id));
                if (JSON.stringify(HamVeri).includes(TAG)) {
                    HakEdiyor = true;
                }
            } catch (e) {}
        }

        const RoluVar = member.roles.cache.has(SpesiyalTabak.id);

        if (HakEdiyor && !RoluVar) {
            await member.roles.add(SpesiyalTabak).catch(() => {});
            console.log(`✅ SERVİS EDİLDİ: ${member.user.tag}`);
            if (AdisyonKagidi) {
                const Embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Sipariş Teslim Edildi')
                    .setDescription(`<@${member.id}> şartları sağladı, **${SpesiyalTabak.name}** verildi.`)
                    .setTimestamp();
                AdisyonKagidi.send({ embeds: [Embed] }).catch(() => {});
            }
        }

        if (!HakEdiyor && RoluVar) {
            await member.roles.remove(SpesiyalTabak).catch(() => {});
            console.log(`❌ TABAK GERİ ALINDI: ${member.user.tag}`);
            if (AdisyonKagidi) {
                const Embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Masa Temizlendi')
                    .setDescription(`<@${member.id}> şartları kaybettiği için **${SpesiyalTabak.name}** geri alındı.`)
                    .setTimestamp();
                AdisyonKagidi.send({ embeds: [Embed] }).catch(() => {});
            }
        }

    } catch (hata) {}
}

async function HerkesiTara() {
    const Guild = Firin.guilds.cache.get(Buzdolabi.GUILD_ID);
    if (!Guild) return;
    console.log("🔄 [DEVRİYE] Mutfaktaki tüm masalar kontrol ediliyor...");
    const Members = await Guild.members.fetch({ force: true }).catch(() => null);
    if (Members) Members.forEach(m => LezzetKontrolu(m));
    console.log("✅ [DEVRİYE] Kontrol tamamlandı.");
}

Firin.on('clientReady', async () => {
    console.log(`👨‍🍳 MUTFAK AÇILDI! ${Firin.user.tag} iş başında.`);
    Firin.user.setStatus("idle");
    setInterval(() => {
        const Rastgele = Math.floor(Math.random() * (Buzdolabi.STATUS.length));
        Firin.user.setActivity({ name: `${Buzdolabi.STATUS[Rastgele]}`, type: ActivityType.Playing });
    }, 10000);

    await HerkesiTara();
    setInterval(HerkesiTara, 180000);
});

Firin.on('presenceUpdate', (o, n) => { if (n.member) LezzetKontrolu(n.member); });
Firin.on('guildMemberUpdate', (o, n) => { LezzetKontrolu(n); });
Firin.on('userUpdate', async (o, n) => {
    const m = Firin.guilds.cache.get(Buzdolabi.GUILD_ID)?.members.cache.get(n.id);
    if (m) LezzetKontrolu(m);
});

Firin.on('messageCreate', async (Tepsi) => {
    if (Tepsi.channelId !== Buzdolabi.CHANNEL_ID || Tepsi.author.bot) return;
    if (!Tepsi.member?.permissions.has('Administrator')) {
        if (Tepsi.attachments.size === 0) {
            setTimeout(() => Tepsi.delete().catch(() => {}), 3000);
            return;
        }
    }
    if (Tepsi.attachments.size > 0) {
        setTimeout(() => Tepsi.react(Buzdolabi.EMOJI).catch(() => {}), 3000);
    }
});

Firin.login(Buzdolabi.TOKEN);

/*
=====================================================
🍝 NULL USTA'DAN KREMALI MANTARLI MAKARNA TARİFİ 🍝
=====================================================

Malzemeler:
- 1 paket Penne veya Fettuccine makarna (Kodun temeli)
- 1 kutu sıvı krema (Botun hızı)
- 400gr Mantar (Discord API verileri)
- 2 diş sarımsak (Token güvenliği)
- Bolca Parmesan peyniri (Roller)
- Taze fesleğen ve karabiber

Yapılışı:
1. "const Su = Kaynar;" diyerek makarnaları haşlıyoruz. (Al dente olsun, sunucu yorulmasın)
2. Ayrı bir tavada zeytinyağı ile mantarları suyunu salıp çekene kadar soteliyoruz.
3. Sarımsakları ekleyip kokusu çıkana kadar çeviriyoruz (Loglara düşmesin dikkat).
4. Kremayı ekleyip kısık ateşte kıvam alana kadar bekliyoruz.
5. Haşlanan makarnaları süzüp sosun içine atıyoruz.
6. Üzerine parmesan ve karabiber serpip servis ediyoruz.

Afiyet olsun, kodunuz bug görmesin!
=====================================================
*/