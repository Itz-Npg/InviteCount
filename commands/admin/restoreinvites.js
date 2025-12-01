const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class RestoreInvites extends Command {
    constructor (client) {
        super(client, {
            name: "restoreinvites",
            enabled: true,
            aliases: [ "resinvites", "restoreinv", "resinv", "restoreinvite", "restore-invites", "restore-invite" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {

        let member = args[0] ? await this.client.resolveMember(args.join(" "), message.guild) : null;
        if(member) member.data = await this.client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id });
        let members = null;
        let memberCount = { invites: 0, leaves: 0, fake: 0, bonus: 0 };
        if(!member){
            members = await this.client.guildMembersData.find({ guildID: message.guild.id });
            members.forEach((m) => {
                memberCount.invites += m.old_invites;
                memberCount.leaves += m.old_leaves;
                memberCount.fake += m.old_fake;
                memberCount.bonus += m.old_bonus;
            });
        }
        let conf = await (member ?
            message.channel.send(message.language.restoreinvites.confirmations.member(data.guild.prefix, member))
            : message.channel.send(message.language.restoreinvites.confirmations.all(data.guild.prefix, memberCount))
        );
        
        const filter = (m) => m.author.id === message.author.id && (m.content === "cancel" || m.content === "-confirm");
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => null);
        
        if (!collected || collected.size === 0) {
            return conf.edit(message.language.restoreinvites.confirmations.cancelled());
        }
        
        if(collected.first().content === "cancel") return conf.edit(message.language.restoreinvites.confirmations.cancelled());
        collected.first().delete().catch(() => {});
        await (member ? conf.edit(message.language.restoreinvites.loading.member(data.guild.prefix, member)) : conf.edit(message.language.restoreinvites.loading.all(data.guild.prefix)));
        
        if(member){
            member.data.invites = member.data.old_invites;
            member.data.fake = member.data.old_fake;
            member.data.leaves = member.data.old_leaves;
            member.data.bonus = member.data.old_bonus;
            await member.data.save();
        } else {
            await this.client.functions.asyncForEach(members, async (memberData) => {
                memberData.invites = memberData.old_invites;
                memberData.fake = memberData.old_fake;
                memberData.leaves = memberData.old_leaves;
                memberData.bonus = memberData.old_bonus;
                await memberData.save();
            });
        }

        let embed = new EmbedBuilder()
            .setAuthor({ name: message.language.restoreinvites.title() })
            .setDescription((member ?
                message.language.restoreinvites.titles.member(data.guild.prefix, member)
                : message.language.restoreinvites.titles.all(data.guild.prefix)
            ))
            .setColor(data.color)
            .setFooter({ text: data.footer });

        conf.edit({ content: null, embeds: [embed] });
    }

};

module.exports = RestoreInvites;
