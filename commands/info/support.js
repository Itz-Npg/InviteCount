const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Support extends Command {
    constructor (client) {
        super(client, {
            name: "support",
            enabled: true,
            aliases: [ "s" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let embed = new EmbedBuilder()
            .setAuthor({ name: "InviteCount", iconURL: this.client.user.displayAvatarURL() })
            .setDescription(message.language.support.content(this.client.user.id))
            .setColor(this.client.config.color)
            .setFooter({ text: message.language.support.requested(message.author.username), iconURL: message.author.displayAvatarURL() });
        message.channel.send({ embeds: [embed] });

    }

};

module.exports = Support;
