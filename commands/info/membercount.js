const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class MemberCount extends Command {
    constructor (client) {
        super(client, {
            name: "membercount",
            enabled: true,
            aliases: [ "m" ],
            clientPermissions: [ "EmbedLinks", "AddReactions" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let guild = message.guild;
        let embed = new EmbedBuilder()
            .setAuthor({ name: message.language.membercount.title(message.guild.name) })
            .setDescription(message.language.membercount.description(guild))
            .setColor(data.color)
            .setFooter({ text: data.footer });
        message.channel.send({ embeds: [embed] });
    }

};

module.exports = MemberCount;
