const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Invite extends Command {
    constructor (client) {
        super(client, {
            name: "invite",
            enabled: true,
            aliases: [ "invites", "rank" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {
        
        let member = await this.client.resolveMember(args.join(" "), message.guild) || message.member;
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });
        let guildData = await this.client.findOrCreateGuild({ id: message.guild.id });
        
        let nextRank = null;
        guildData.ranks.forEach((rank) => {
            let superior = (rank.inviteCount >= (memberData.invites + memberData.bonus - memberData.leaves - memberData.fake));
            let found = member.guild.roles.cache.get(rank.roleID);
            let superiorFound = (nextRank ? rank.inviteCount < nextRank.inviteCount : true);
            if(superior && found && superiorFound) nextRank = rank;
        });

        let description = message.language.invite.description(member, memberData, (member.id === message.member.id), nextRank, (nextRank ? message.guild.roles.cache.get(nextRank.roleID) : null));
        
        let embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setDescription(description)
            .setColor(data.color)
            .setFooter({ text: data.footer });

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Invite;
