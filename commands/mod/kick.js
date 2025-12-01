const Command = require("../../structures/Command.js"),
{ EmbedBuilder, PermissionFlagsBits } = require("discord.js");

class Kick extends Command {
    constructor (client) {
        super(client, {
            name: "kick",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.channel.send(message.language.kick.errors.missingPerms);
        const member = message.mentions.members.first();
        if (!member) return message.channel.send(message.language.kick.errors.nouser);
        let reason = args.slice(1).join(" ");
        if (!reason) {
            reason = "No Reason Specified"
        }
        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if(message.guild.ownerId !== message.author.id && !(moderationPosition > memberPosition)){
            return message.channel.send(message.language.kick.errors.supperior);
        }

        if(!member.kickable) {
            return message.channel.send(message.language.kick.errors.noperm);
        }
        
        await member.send(message.language.kick.banneddm(message.guild.name, message.member.user.tag, reason)).catch(() => {});
        member.kick(reason).then(() => {
            const kickembed = new EmbedBuilder()
                .setColor(data.color)
                .setAuthor({ name: message.member.user.tag, iconURL: message.member.user.displayAvatarURL() })
                .setDescription(message.language.kick.description)
                .setFooter({ text: data.footer });
            message.channel.send({ embeds: [kickembed] });
        }).catch((error) => {console.log(error)});

    }
}

module.exports = Kick;
