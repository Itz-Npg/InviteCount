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
        } else if(guild.ownerId) {
            inviter = await this.client.users.fetch(guild.ownerId).catch(() => null);
        }

        const guildDeleteEmbed = new EmbedBuilder()
            .setTitle("`➖` Serveur quitté !")
            .setDescription("<:cancel:739529403179991073> Malheureusement quelqu'un m'a expulsée sur **" + guild.name +"**.")
            .addFields(
                { name: "• <:invites:756168551731036402> **Nom:**", value: guild.name },
                { name: "• <:idguildjoin:745383975547306084> **ID du serveur:**", value: guild.id },
                { name: "• <:memberguild:745388686337638460> **Membres:**", value: String(guild.memberCount) }
            )
            .setColor("Red");

        let { removeLogs } = this.client.config;
        this.client.shard.broadcastEval((c, { channelId, embedData }) => {
            let rLogs = c.channels.cache.get(channelId);
            if(rLogs) rLogs.send({ embeds: [embedData] });
        }, { context: { channelId: removeLogs, embedData: guildDeleteEmbed.toJSON() } });
        
    }
};
