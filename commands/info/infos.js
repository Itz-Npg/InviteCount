const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Infos extends Command {
    constructor (client) {
        super(client, {
            name: "infos",
            enabled: true,
            aliases: [ "info", "botinfo" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let totalSeconds = (this.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let uptime = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;
        let guildsCounts = await this.client.shard.fetchClientValues("guilds.cache.size");
        let guildsCount = guildsCounts.reduce((p, count) => p + count);
        let channelsCounts = await this.client.shard.fetchClientValues("channels.cache.size");
        let channelsCount = message.client.channels.cache.size
        let usersCounts = await this.client.shard.fetchClientValues("users.cache.size");
        let usersCount = message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
        let title = message.language.infos.statistics.title(this.client.shard.ids[0], false);
        
        let results = await this.client.shard.broadcastEval((c) => {
            return [
                Math.round((process.memoryUsage().heapUsed / 1024 / 1024)),
                c.guilds.cache.size,
                c.channels.cache.size,
                c.shard.ids[0],
                Math.round(c.ws.ping)
            ];
        });
        let resultsa = await this.client.shard.broadcastEval((c) => {
            return [...c.guilds.cache.values()].map(g => ({ memberCount: g.memberCount }));
        });
        let guilds = [];
        resultsa.forEach((a) => guilds = [...guilds, ...a]);
        let usersCountW = 0;
        guilds.forEach(g => usersCountW = usersCountW + g.memberCount)
        
        let embed = new EmbedBuilder()
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .setTitle(message.language.infos.title())
            .setDescription(message.language.infos.content(message.guild.name, data.guild.prefix))
            .setAuthor({ name: "InviteCount | v2.0.0", iconURL: this.client.user.displayAvatarURL() })
            .addFields(
                { name: message.language.infos.dev.title(), value: message.language.infos.dev.content(uptime), inline: true },
                { name: title, value: message.language.infos.statistics.content(guildsCount, channelsCount, usersCountW), inline: false },
                { name: message.language.infos.link.title(), value: message.language.infos.link.content(), inline: false }
            );

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Infos;
