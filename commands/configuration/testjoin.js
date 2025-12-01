const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class TestJoin extends Command {
    constructor (client) {
        super(client, {
            name: "testjoin",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
   
        let embed = new EmbedBuilder()
            .setTitle(message.language.testjoin.title())
            .setDescription(message.language.testjoin.description())
            .addFields(
                { name: message.language.testjoin.fields.enabled(), value: (data.guild.join.enabled ? message.language.testjoin.enabled(data.guild.prefix) : message.language.testjoin.disabled(data.guild.prefix)) },
                { name: message.language.testjoin.fields.message(), value: (data.guild.join.message || message.language.testjoin.notDefineds.message(data.guild.prefix)) },
                { name: message.language.testjoin.fields.channel(), value: (data.guild.join.channel ? `<#${data.guild.join.channel}>` : message.language.testjoin.notDefineds.channel(data.guild.prefix)) }
            )
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
        
        if(data.guild.join.enabled && data.guild.join.message && data.guild.join.channel && message.guild.channels.cache.get(data.guild.join.channel)){
            message.guild.channels.cache.get(data.guild.join.channel).send(this.client.functions.formatMessage(
                data.guild.join.message,
                message.member,
                message.client.user,
                {
                    code: "cAmtjYj",
                    url: "https://discord.gg/cAmtjYj",
                    uses: 1
                },
                (data.guild.language || "english").substr(0, 2),
                {
                    invites: 1,
                    fake: 0,
                    bonus: 0,
                    leaves: 0
                }
            )).catch(() => {
                return message.channel.send(message.language.errors.sendPerm());
            });
        }
    }
}

module.exports = TestJoin;
