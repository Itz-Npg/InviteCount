const Command = require("../../structures/Command.js"),
{ EmbedBuilder, PermissionFlagsBits } = require("discord.js");

class UnBan extends Command {
    constructor (client) {
        super(client, {
            name: "unban",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.channel.send(message.language.kick.errors.missingPerms);
       
        let banneduser = args.slice(0).join(" ");
        if (!banneduser || isNaN(banneduser) || banneduser.length < 17) {
            return message.channel.send(message.language.unban.noid);
        }

        const banned = await message.guild.bans.fetch();
        if(![...banned.values()].some((e) => e.user.id === banneduser)){
            return message.channel.send(message.language.unban.noban)
        }

        message.guild.members.unban(banneduser)
        .then(user => {
            const debanembed = new EmbedBuilder()
                .setColor(data.color)
                .setAuthor({ name: message.member.user.tag, iconURL: message.member.user.displayAvatarURL() })
                .setDescription(message.language.unban.success(user.tag))
                .setFooter({ text: data.footer });
            message.channel.send({ embeds: [debanembed] });
        })
        .catch(console.error);

    }
}

module.exports = UnBan;
