const Command = require("../../structures/Command.js"),
    moment = require('moment'),
    { EmbedBuilder } = require("discord.js");

class Invite extends Command {
    constructor(client) {
        super(client, {
            name: "messages",
            enabled: true,
            aliases: [],
            clientPermissions: ["EmbedLinks"],
            permLevel: 0
        });
    }

    async run(message, args, data) {

        let member = await this.client.resolveMember(args.join(" "), message.guild) || message.member;
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });

        let embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setDescription(`<:horloge3:851486762928701551> Statistics since ${moment(message.guild.members.me.joinedTimestamp).locale(data.guild.language.substr(0, 2)).fromNow()}\n<:channel:851482936787730472> You have sent \`${memberData.messagesCount}\` on this server`)
            .setColor(data.color)
            .setFooter({ text: data.footer, iconURL: message.client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = Invite;
