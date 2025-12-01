const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Inviter extends Command {
    constructor (client) {
        super(client, {
            name: "inviter",
            enabled: true,
            aliases: [ "whoami", "invited" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        let member = await this.client.resolveMember(args.join(" "), message.guild) || message.member;
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });
        
        let inviter = null;
        let inviterName = message.language.inviter.unknown();
        
        if (memberData.invitedBy) {
            try {
                inviter = await this.client.users.fetch(memberData.invitedBy);
                inviterName = inviter.username;
            } catch (err) {
                inviterName = message.language.inviter.notFound();
            }
        }

        let embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setDescription(message.language.inviter.description(member, inviterName))
            .setColor(data.color)
            .setFooter({ text: data.footer });

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Inviter;
