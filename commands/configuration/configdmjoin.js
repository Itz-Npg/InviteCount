const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class ConfigDMJoin extends Command {
    constructor (client) {
        super(client, {
            name: "configdmjoin",
            enabled: true,
            aliases: [ "dmjoin", "joindm", "configjoindm", "dm", "configdm" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        const filter = (m) => m.author.id === message.author.id;
        
        let str = data.guild.joinDM.enabled ? message.language.configdmjoin.disable(data.guild.prefix) : "";
        let msg = await message.channel.send(message.language.configdmjoin.instruct(str));

        let collected = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(message.language.configdmjoin.cancelled());
        let confMessage = collected.first().content;
        if(confMessage === "cancel") return msg.edit(message.language.configdmjoin.cancelled());
        if(confMessage === data.guild.prefix+"setdmjoin") return;

        msg.edit(message.language.configdmjoin.success());

        let embed = new EmbedBuilder()
            .setTitle(message.language.configdmjoin.title())
            .addFields(
                { name: message.language.configdmjoin.fields.message(), value: confMessage },
                { name: message.language.configdmjoin.fields.testIt(), value: message.language.configdmjoin.fields.cmd(data.guild.prefix) }
            )
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer });
        message.channel.send({ embeds: [embed] });

        data.guild.joinDM = { enabled: true, message: confMessage };
        data.guild.markModified("joinDM");
        await data.guild.save();
   }

};

module.exports = ConfigDMJoin;
