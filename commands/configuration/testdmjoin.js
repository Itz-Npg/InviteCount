const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class TestDMJoin extends Command {
    constructor (client) {
        super(client, {
            name: "testdmjoin",
            enabled: true,
            aliases: [ "testdm" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        let embed = new EmbedBuilder()
            .setTitle(message.language.testdmjoin.title())
            .setDescription(message.language.testdmjoin.description())
            .addFields(
                { name: message.language.testdmjoin.fields.enabled(), value: (data.guild.joinDM.enabled ? message.language.testdmjoin.enabled(data.guild.prefix) : message.language.testdmjoin.disabled(data.guild.prefix)) },
                { name: message.language.testdmjoin.fields.message(), value: (data.guild.joinDM.message || message.language.testdmjoin.notDefineds.message(data.guild.prefix)) }
            )
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });

        if(data.guild.joinDM.enabled && data.guild.joinDM.message){
            message.author.send(this.client.functions.formatMessage(
                data.guild.joinDM.message,
                message.member,
                message.client.user,
                {
                    code: "436SPZX",
                    url: "https://discord.gg/436SPZX",
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

module.exports = TestDMJoin;
