const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Credits extends Command {
    constructor (client) {
        super(client, {
            name: "credits",
            enabled: true,
            aliases: [ ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let embed = new EmbedBuilder()
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .setTitle(message.language.credits.title())
            .setDescription(message.language.credits.content(message.guild.name, data.guild.prefix))
            .setAuthor({ name: "InviteCount | v2.0.0", iconURL: this.client.user.displayAvatarURL() })
            .addFields(
                { name: message.language.credits.dev.title(), value: message.language.credits.dev.content(), inline: true },
                { name: message.language.credits.statistics.title(), value: message.language.credits.statistics.content(), inline: false },
                { name: message.language.credits.link.title(), value: message.language.credits.link.content(), inline: false }
            );

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Credits;
