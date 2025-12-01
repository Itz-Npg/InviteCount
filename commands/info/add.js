const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Add extends Command {
    constructor (client) {
        super(client, {
            name: "add",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let embed = new EmbedBuilder()
            .setAuthor({ name: "InviteCount", iconURL: this.client.user.displayAvatarURL() })
            .setDescription(message.language.add.content(this.client.user.id))
            .setColor(this.client.config.color)
            .setFooter({ text: message.language.add.requested(message.author.username), iconURL: message.author.displayAvatarURL() });
        message.channel.send({ embeds: [embed] });

    }

};

module.exports = Add;
