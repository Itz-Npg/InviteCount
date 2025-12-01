const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class Leaderboard extends Command {
    constructor (client) {
        super(client, {
            name: "leaderboard",
            enabled: true,
            aliases: [ "top", "lb" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let membersData = await this.client.guildMembersData.find({
            guildID: message.guild.id,
            $expr: {
                $gt: [
                    { $add: [ "$invites", "$bonus", "$leaves", "$fake" ] }, 0
                ]
            }
        }).lean();
        
        if(membersData.length <= 0){
            let embed = new EmbedBuilder()
                .setAuthor({ name: message.language.leaderboard.empty.title() })
                .setDescription(message.language.leaderboard.empty.content())
                .setColor(data.color);
            return message.channel.send({ embeds: [embed] });
        }

        let members = [];
        membersData.forEach((member) => {
            members.push({
                calculatedInvites: (member.invites + member.bonus - member.leaves - member.fake),
                fake: member.fake,
                invites: member.invites,
                bonus: member.bonus,
                leaves: member.leaves,
                id: member.id
            });
        });
        members = members.sort((a, b) => b.calculatedInvites - a.calculatedInvites);

        let description = "";
        let totalMemberCount = 0;
        
        const topMembers = members.slice(0, 10);
        
        for (const member of topMembers) {
            let user = this.client.users.cache.get(member.id) || (message.guild.members.cache.get(member.id) || {}).user;
            if(!user) {
                try {
                    user = await this.client.users.fetch(member.id);
                } catch (e) {
                    continue;
                }
            }
            totalMemberCount++;
            let lb = totalMemberCount === 1 ? "🏆" :
                     totalMemberCount === 2 ? "🥈" :
                     totalMemberCount === 3 ? "🥉" :
                     `**${totalMemberCount}.**`;
            description += `${message.language.leaderboard.user(user, member, lb)}\n`;
        }

        let embed = new EmbedBuilder()
            .setTitle(message.language.leaderboard.title())
            .setDescription(description || "No members found")
            .setColor(data.color)
            .setFooter({ text: data.footer });

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Leaderboard;
