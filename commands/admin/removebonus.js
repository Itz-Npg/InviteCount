const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class RemoveBonus extends Command {
    constructor (client) {
        super(client, {
            name: "removebonus",
            enabled: true,
            aliases: [ "delbonus", "removebonus" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let bonus = args[0];
        if(!bonus) return message.channel.send(message.language.removebonus.errors.bonus.missing(data.guild.prefix));
        if(isNaN(bonus) || parseInt(bonus) < 1 || !Number.isInteger(parseInt(bonus))) return message.channel.send(message.language.removebonus.errors.bonus.incorrect(data.guild.prefix));

        let member = message.mentions.members.first() || await this.client.resolveMember(args.slice(1).join(" "), message.guild);
        if(!member) return message.channel.send(message.language.removebonus.errors.member.missing(data.guild.prefix));
    
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });
        memberData.bonus -= parseInt(bonus);
        memberData.markModified("bonus");
        await memberData.save();

        let embed = new EmbedBuilder()
            .setAuthor({ name: message.language.removebonus.title() })
            .setDescription(message.language.removebonus.field(data.guild.prefix, member))
            .setColor(data.color)
            .setFooter({ text: data.footer });

        message.channel.send({ embeds: [embed] });
    }

};

module.exports = RemoveBonus;
