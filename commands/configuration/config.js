const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Config extends Command {
    constructor (client) {
        super(client, {
            name: "config",
            enabled: true,
            aliases: [ "conf", "configuration" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let joinSuccess = data.guild.join.enabled
        && data.guild.join.message
        && data.guild.join.channel
        && message.guild.channels.cache.get(data.guild.join.channel);

        let joinDMSuccess = data.guild.joinDM.enabled
        && data.guild.joinDM.message;

        let leaveSuccess = data.guild.leave.enabled
        && data.guild.leave.message
        && data.guild.leave.channel
        && message.guild.channels.cache.get(data.guild.leave.channel);

        let embed = new EmbedBuilder()
            .setTitle(message.language.config.title(message.guild.name))
            .addFields(
                { name: message.language.config.join.title(joinSuccess), value: message.language.config.join.content(message.guild, data), inline: true },
                { name: message.language.config.leave.title(leaveSuccess), value: message.language.config.leave.content(message.guild, data), inline: true },
                { name: message.language.config.joinDM.title(joinDMSuccess), value: message.language.config.joinDM.content(message.guild, data), inline: true }
            )
            .setColor(data.color)
            .setFooter({ text: data.footer });
        message.channel.send({ embeds: [embed] });
    }
};
          
module.exports = Config;
