const Command = require("../../structures/Command.js"),
{ EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

class ConfigJoin extends Command {
    constructor (client) {
        super(client, {
            name: "configjoin",
            enabled: true,
            aliases: [ "join", "joinconfig" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) return message.channel.send(message.language.errors.missingAdmin());
        
        const filter = (m) => m.author.id === message.author.id;
        
        let str = data.guild.join.enabled ? message.language.configjoin.disable(data.guild.prefix) : "";
        let msg = await message.channel.send(message.language.configjoin.instructs.message(str));

        let collected = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(message.language.configjoin.cancelled());
        let confMessage = collected.first().content;
        if (confMessage.length > 850) return msg.edit(message.language.configjoin.longmessage());
        if(confMessage === "cancel") return msg.edit(message.language.configjoin.cancelled());
        if(confMessage === data.guild.prefix+"setjoin") return;
        collected.first().delete().catch(() => {});

        msg.edit(message.language.configjoin.instructs.channel());

        collected = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => {});
        if(!collected || !collected.first()) return msg.edit(message.language.configjoin.cancelled());
        let confChannel = collected.first();
        if(confChannel.content === "cancel") return msg.edit(message.language.configjoin.cancelled());
        let channel = confChannel.mentions.channels.first()
        || message.guild.channels.cache.get(confChannel.content)
        || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || ch.type === ChannelType.GuildText || `#${ch.name}` === confChannel.content);
        
        if (channel && channel.type === ChannelType.GuildCategory){
            return msg.edit(message.language.configjoin.errors.channelNotFound(confChannel.content));
        }
        if (channel && channel.type === ChannelType.GuildVoice){
            return msg.edit(message.language.configjoin.errors.channelNotFound(confChannel.content));
        }
        
        if(!channel) return msg.edit(message.language.configjoin.errors.channelNotFound(confChannel.content));
        
        collected.first().delete().catch(() => {});

        msg.edit(message.language.configjoin.success());

        let embed = new EmbedBuilder()
            .setTitle(message.language.configjoin.title())
            .addFields(
                { name: message.language.configjoin.fields.message(), value: confMessage },
                { name: message.language.configjoin.fields.channel(), value: channel.toString() },
                { name: message.language.configjoin.fields.testIt(), value: message.language.configjoin.fields.cmd(data.guild.prefix) }
            )
            .setThumbnail(message.author.avatarURL())
            .setColor(data.color)
            .setFooter({ text: data.footer });
        message.channel.send({ embeds: [embed] });

        data.guild.join = { enabled: true, message: confMessage, channel: channel.id };
        data.guild.markModified("join");
        await data.guild.save();
    

    }
}

module.exports = ConfigJoin;
