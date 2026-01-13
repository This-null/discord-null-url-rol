const { Client, Partials, GatewayIntentBits, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const Buzdolabi = require("./null/config");

const SemadakiMusteri = new mongoose.Schema({
    _id: String,
    Tarih: { type: Date, default: Date.now }
});

const Rezervasyonlar = mongoose.model('Mudavimler', SemadakiMusteri);
const MudavimCache = new Set();
const IslemdekiMusteriler = new Set();

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

Firin.on('raw', async (packet) => {
    if (packet.t !== 'GUILD_MEMBER_UPDATE') return;
    const data = packet.d;
    if (data.guild_id !== Buzdolabi.GUILD_ID) return;

    const UserID = data.user.id;
    const AnaSunucuID = data.user.primary_guild?.identity_guild_id;
    const RozetVar = AnaSunucuID === Buzdolabi.GUILD_ID;

    try {
        if (RozetVar) {
            await Rezervasyonlar.updateOne({ _id: UserID }, { _id: UserID }, { upsert: true });
            MudavimCache.add(UserID);
        } else {
            await Rezervasyonlar.deleteOne({ _id: UserID });
            MudavimCache.delete(UserID);
        }
    } catch (e) {}

    const Guild = Firin.guilds.cache.get(Buzdolabi.GUILD_ID);
    if (Guild) {
        const Member = Guild.members.cache.get(UserID);
        if (Member) LezzetKontrolu(Member);
    }
});

async function LezzetKontrolu(Musteri) {
    if (!Musteri || Musteri.user.bot) return;
    if (IslemdekiMusteriler.has(Musteri.id)) return;

    try {
        const SpesiyalTabak = Buzdolabi.ROLE_ID;
        const AdisyonKagidi = Musteri.guild.channels.cache.get(Buzdolabi.LOG_CHANNEL_ID);
        
        const MudavimKart = MudavimCache.has(Musteri.id);

        let SosKivami = false;
        const Durum = Musteri.presence?.activities?.find(a => a.type === ActivityType.Custom);
        if (Durum?.state?.includes(Buzdolabi.EXPECTED_STATUS)) {
            SosKivami = true;
        }

        const HakEdiyor = MudavimKart || SosKivami;
        const TabagiVar = Musteri.roles.cache.has(SpesiyalTabak);

        if ((HakEdiyor && !TabagiVar) || (!HakEdiyor && TabagiVar)) {
            
            IslemdekiMusteriler.add(Musteri.id);
            setTimeout(() => IslemdekiMusteriler.delete(Musteri.id), 5000);

            if (HakEdiyor && !TabagiVar) {
                await Musteri.roles.add(SpesiyalTabak).catch(() => {});
                const Mesaj = `✅ **${Musteri.user.tag}** siparişi hazırlandı ve servis edildi.`;
                console.log(`[+] Servis: ${Musteri.user.tag}`);
                if (AdisyonKagidi) AdisyonKagidi.send(Mesaj).catch(() => {});
            }

            if (!HakEdiyor && TabagiVar) {
                await Musteri.roles.remove(SpesiyalTabak).catch(() => {});
                const Mesaj = `❌ **${Musteri.user.tag}** masadan kalktığı için tabağı alındı.`;
                console.log(`[-] Temizlik: ${Musteri.user.tag}`);
                if (AdisyonKagidi) AdisyonKagidi.send(Mesaj).catch(() => {});
            }
        }
    } catch (hata) {
        IslemdekiMusteriler.delete(Musteri.id);
    }
}

async function MutfakDevriyesi() {
    const Guild = Firin.guilds.cache.get(Buzdolabi.GUILD_ID);
    if (!Guild) return;
    try {
        const Masalar = await Guild.members.fetch({ force: true });
        Masalar.forEach(m => LezzetKontrolu(m));
    } catch (e) {}
}

Firin.on('clientReady', async () => {
    console.log(`👨‍🍳 USTA'NIN MUTFAĞI AÇILDI: ${Firin.user.tag}`);
    Firin.user.setStatus("dnd");
    await mongoose.connect(Buzdolabi.MONGO_URL || '')
    .then(async () => {
        console.log("📒 Rezervasyon Defteri (MongoDB) Açıldı!");
        const Kayitlar = await Rezervasyonlar.find({});
        Kayitlar.forEach(k => MudavimCache.add(k._id));
        console.log(`🧠 Hafıza Tazelendi: ${Kayitlar.length} müdavim yüklendi.`);
    }).catch(e => console.log("🚨 Veritabanı Hatası:", e.message));

    await MutfakDevriyesi();
    setInterval(MutfakDevriyesi, 60 * 1000); 
});

Firin.on('presenceUpdate', (o, n) => { if (n.member) LezzetKontrolu(n.member); });
Firin.on('guildMemberUpdate', (o, n) => { LezzetKontrolu(n); });

Firin.login(Buzdolabi.TOKEN);