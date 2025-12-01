const Command = require("../../structures/Command.js"),
moment = require("moment"),
{ EmbedBuilder } = require("discord.js");

class Userinfo extends Command {
    constructor (client) {
        super(client, {
            name: "userinfo",
            enabled: true,
            aliases: [ "ui" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 0
        });
    }

    async run (message, args, data) {

        let user = message.mentions.users.first() || await this.client.resolveUser(args[0]) || message.author;
        let member = await message.guild.members.fetch(user.id).catch(() => {});
        let memberData = member ? await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id }) : null;

        let fields = message.language.userinfo.fields;

        moment.locale(data.guild.language.substr(0, 2));

        let creationDate = moment(user.createdAt, "YYYYMMDD").fromNow();
        let joinDate = member ? moment(member.joinedAt, "YYYYMMDD").fromNow() : null;

        let embed = new EmbedBuilder()
            .setAuthor({ name: message.language.userinfo.title(user), iconURL: user.displayAvatarURL() })
            .addFields(
                { name: fields.bot.title(), value: fields.bot.content(user), inline: true },
                { name: fields.createdAt.title(), value: creationDate.charAt(0).toUpperCase() + creationDate.substr(1, creationDate.length), inline: true }
            )
            .setColor(data.color)
            .setFooter({ text: data.footer });
        
        if(member){
            let joinData = memberData.joinData || (memberData.invitedBy ? { type: "normal", invite: { inviter: memberData.invitedBy } } : { type: "unknown" } );
            let joinWay = fields.joinWay.unknown(user);
            if(joinData.type === "normal"){
                let inviter = await this.client.users.fetch(joinData.invite.inviter);
                joinWay = fields.joinWay.invite(inviter);
            } else if(joinData.type === "vanity"){
                joinWay = fields.joinWay.vanity();
            } else if(joinData.type === "oauth" || user.bot){
                joinWay = fields.joinWay.oauth();
            }
            await message.guild.members.fetch();
            const members = [...message.guild.members.cache.values()].sort((a,b) => a.joinedTimestamp - b.joinedTimestamp);
            let joinPos = members.map((u) => u.id).indexOf(member.id);
            let previous = members[joinPos - 1] ? members[joinPos - 1].user : null;
            let next = members[joinPos + 1] ? members[joinPos + 1].user : null;
            embed.addFields(
                { name: fields.joinedAt.title(), value: joinDate.charAt(0).toUpperCase() + joinDate.substr(1, joinDate.length), inline: true },
                { name: fields.invites.title(), value: fields.invites.content(memberData) },
                { name: fields.joinWay.title(), value: joinWay },
                { name: fields.joinOrder.title(), value: fields.joinOrder.content(previous, next, user) }
            );
        }

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Userinfo;
