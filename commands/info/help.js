const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Help extends Command {
    constructor (client) {
        super(client, {
            name: "help",
            enabled: true,
            aliases: [ "h", "aide" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
   
        let embed = new EmbedBuilder()
            .setTitle(message.language.help.title())
            .setDescription(message.language.help.description(message.guild.name, data.guild.prefix))
            .addFields(
                { name: message.language.help.admin.title(), value: message.language.help.admin.content(data.guild.prefix) },
                { name: message.language.help.moderation.title(), value: message.language.help.moderation.content(data.guild.prefix) },
                { name: message.language.help.joinDM.title(), value: message.language.help.joinDM.content(data.guild.prefix) },
                { name: message.language.help.join.title(), value: message.language.help.join.content(data.guild.prefix) },
                { name: message.language.help.giveaway.title(), value: message.language.help.giveaway.content(data.guild.prefix) }
            )
            .setColor(data.color)
            .setFooter({ text: data.footer });

        message.channel.send({ embeds: [embed] });
    }
}

module.exports = Help;
