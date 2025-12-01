const Command = require("../../structures/Command.js"),
    { EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

class GiveawayLogs extends Command {
    constructor(client) {
        super(client, {
            name: "glogs",
            enabled: true,
            aliases: [],
            clientPermissions: ["EmbedLinks"],
            permLevel: 0
        });
    }

    async run(message, args, data) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.channel.send(message.language.errors.perms());
        }
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (!channel) return message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription(message.language.configjoin.errors.channelNotFound(args[0])).setAuthor({ name: "🎁 Giveaway System", iconURL: this.client.user.displayAvatarURL() })] });

        if (channel.type === ChannelType.GuildCategory) {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription(message.language.configjoin.errors.channelNotFound(args[0])).setAuthor({ name: "🎁 Giveaway System", iconURL: this.client.user.displayAvatarURL() })] });
        }
        if (channel.type === ChannelType.GuildVoice) {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription(message.language.configjoin.errors.channelNotFound(args[0])).setAuthor({ name: "🎁 Giveaway System", iconURL: this.client.user.displayAvatarURL() })] });
        }

        data.guild.glogs = channel.id;
        await data.guild.save();
        message.channel.send(message.language.glogs.success());
    }

};

module.exports = GiveawayLogs;
