const { EmbedBuilder } = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (guild) {

        let inviter = null;

        await this.client.wait(2000);
        let knownGuild = this.client.knownGuilds.find((g) => g.id === guild.id);
        if(knownGuild){
            inviter = await this.client.users.fetch(knownGuild.user);
        } else {
            inviter = await this.client.users.fetch(guild.ownerId);
        }

        let guildData = await this.client.guildsData.findOne({ id: guild.id });
        let welcomeMessage = guildData ?
        `Mon préfix est \`${guildData.prefix}\`. Si vous souhaitez supprimer les invitations du serveur à recommencer à zéro, vous pouvez utiliser \`${guildData.prefix}remove-invites\`. Si vous souhaitez synchroniser les invitations actuelles du serveur avec le bot, vous pouvez utiliser \`${guildData.prefix}sync-invites\`\n \n**--------------**\n`
        : "Mon préfixe est `+`. Si vous souhaitez supprimer les invitations du serveur et recommencer à zéro, vous pouvez utiliser `+remove-invites`.\n \n**--------------**\n";            

        const guildCreateEmbed = new EmbedBuilder()
            .setTitle("`➕` Nouveau Serveur !")
            .setDescription("<:maestro_success:745575733853683732> Merci de m'avoir ajouté sur **" + guild.name +"**.")
            .addFields(
                { name: "• <:invites:756168551731036402> **Nom:**", value: guild.name },
                { name: "• <:idguildjoin:745383975547306084> **ID du serveur:**", value: guild.id },
                { name: "• <:memberguild:745388686337638460> **Membres:**", value: String(guild.memberCount) }
            )
            .setColor("Green");

        let { addLogs } = this.client.config;
        this.client.shard.broadcastEval((c, { channelId, embedData }) => {
            let aLogs = c.channels.cache.get(channelId);
            if(aLogs) aLogs.send({ embeds: [embedData] });
        }, { context: { channelId: addLogs, embedData: guildCreateEmbed.toJSON() } });

        await this.client.wait(5000);
        let client = this.client;
        let guildInvites = await guild.invites.fetch().catch(() => {});
        if(!guildInvites) return;
        let users = new Set([...guildInvites.values()].map((i) => i.inviter.id));
        await this.client.functions.asyncForEach(Array.from(users), async (user) => {
            let memberData = await client.findOrCreateGuildMember({ id: user, guildID: guild.id });
            memberData.invites = [...guildInvites.values()].filter((i) => i.inviter.id === user).map((i) => i.uses).reduce((p, c) => p + c);
            await memberData.save();
        });
    }
};
