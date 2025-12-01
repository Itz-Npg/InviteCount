const Command = require("../../structures/Command.js"),
{ EmbedBuilder, PermissionFlagsBits } = require("discord.js");

class Ban extends Command {
    constructor (client) {
        super(client, {
            name: "ban",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.channel.send(message.language.ban.errors.missingPerms);
        const member = message.mentions.members.first();
        if (!member) return message.channel.send(message.language.ban.errors.nouser);
        let reason = args.slice(1).join(" ");
        if (!reason) {
            reason = "No Reason Specified"
        }
        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if(message.guild.ownerId !== message.author.id && !(moderationPosition > memberPosition)){
            return message.channel.send(message.language.ban.errors.supperior);
        }

        if(!member.bannable) {
            return message.channel.send(message.language.ban.errors.noperm);
        }
        
        await member.send(message.language.ban.banneddm(message.guild.name, message.member.user.tag, reason)).catch(() => {});
        member.ban({ reason: reason }).then(() => {
            const kickembed = new EmbedBuilder()
                .setColor(data.color)
                .setAuthor({ name: message.member.user.tag, iconURL: message.member.user.displayAvatarURL() })
                .setDescription(message.language.ban.description)
                .setFooter({ text: data.footer });
            message.channel.send({ embeds: [kickembed] });
        }).catch(() => {});

    }
}

module.exports = Ban;
