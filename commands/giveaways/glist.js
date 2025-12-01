const Command = require("../../structures/Command.js"),
    { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

class glist extends Command {
    constructor(client) {
        super(client, {
            name: "glist",
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

        const currentGiveaways = message.client.giveawaysManager.giveaways.filter((g) => g.guildId === message.guild.id && !g.ended);
        if (currentGiveaways.length == 0) {
            return message.channel.send(message.language.glist.err());
        }
        let embed = new EmbedBuilder()
            .setAuthor({ name: message.language.glist.title() })
            .setDescription(message.language.glist.description(data.guild.prefix))
            .addFields({ name: message.language.glist.fields.name(data.guild.prefix), value: message.language.glist.fields.message(currentGiveaways) || message.language.glist.err() })
            .setColor(data.color);
        return message.channel.send({ embeds: [embed] });
    }

};

module.exports = glist;
