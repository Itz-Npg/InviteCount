const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class RemoveInvites extends Command {
    constructor (client) {
        super(client, {
            name: "removeinvites",
            enabled: true,
            aliases: [ "rinvites", "removeinv", "rinv", "removeinvite", "remove-invites", "remove-invite" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        
        let member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        let msg = await (member ? message.channel.send(message.language.removeinvites.loading.member(data.guild.prefix, member)) : message.channel.send(message.language.removeinvites.loading.all(data.guild.prefix)));
        if(member){
            let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id });
            memberData.old_invites = memberData.invites;
            memberData.invites = 0;
            memberData.old_fake = memberData.fake;
            memberData.fake = 0;
            memberData.old_leaves = memberData.leaves;
            memberData.leaves = 0;
            memberData.old_bonus = memberData.bonus;
            memberData.bonus = 0;
            await memberData.save();
        } else {
            let members = await this.client.guildMembersData.find({ guildID: message.guild.id });
            await this.client.functions.asyncForEach(members, async (memberData) => {
                memberData.old_invites = memberData.invites;
                memberData.invites = 0;
                memberData.old_fake = memberData.fake;
                memberData.fake = 0;
                memberData.old_leaves = memberData.leaves;
                memberData.leaves = 0;
                memberData.old_bonus = memberData.bonus;
                memberData.bonus = 0;
                await memberData.save();
            });
        }

        let embed = new EmbedBuilder()
            .setAuthor({ name: message.language.removeinvites.title() })
            .setDescription((member ?
                message.language.removeinvites.titles.member(data.guild.prefix, member)
                : message.language.removeinvites.titles.all(data.guild.prefix)
            ))
            .setColor(data.color)
            .setFooter({ text: data.footer });

        msg.edit({ content: null, embeds: [embed] });

    }

};

module.exports = RemoveInvites;
