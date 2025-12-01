const { EmbedBuilder } = require('discord.js');
const giveawayModel = require('../models/giveaway');

module.exports = {
    async execute(giveaway, member, reaction, client) {
        if (reaction.message.partial) await reaction.message.fetch();
        let message = reaction.message;

        let guildData = await client.findOrCreateGuild({ id: message.guild.id });
        const memberData = await client.findOrCreateGuildMember({ id: member.id, guildID: message.guild.id, bot: member.user.bot });

        const find = await giveawayModel.findOne({ serverID: giveaway.guildId, MessageID: giveaway.messageId })
        if (find) {
            if (find.requiredMessages) {
                if (find.requiredMessages < memberData.messagesCount || find.requiredMessages == memberData.messagesCount) {
                    const succes = new EmbedBuilder()
                        .setTitle(`✅ - Entry accepted`)
                        .setDescription(`Your participation for [this giveaway](${message.url}) has been accepted.`)
                        .addFields({ name: "🧷 Links", value: `\n● Add me to your server [here](https://discordapp.com/api/oauth2/authorize?client_id=577236734245470228&permissions=8&scope=bot) \n● Join my support server [here](https://discord.gg/6QsXCfw) \n● Vote for me [here](https://top.gg/bot/577236734245470228/vote)` })
                        .setColor(client.config.color)
                        .setURL('https://discord.gg/6QsXCfw')
                        .setFooter({ text: client.config.footer, iconURL: client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

                    member.send({ embeds: [succes] }).catch(() => {});
                    if (guildData.glogs) {
                        const succesA = new EmbedBuilder()
                            .setTitle(`✅ - New valid entry`)
                            .setDescription(`The participation of ${member} for [this giveaway](${message.url}) has been accepted.`)
                            .setColor(client.config.color)
                            .setURL('https://discord.gg/6QsXCfw')
                            .setFooter({ text: client.config.footer, iconURL: client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

                        let aLogs = member.guild.channels.cache.get(guildData.glogs);
                        if (aLogs) aLogs.send({ embeds: [succesA] });
                    }
                } else {
                    const succese = new EmbedBuilder()
                        .setTitle(`❎ |  Participation denied`)
                        .setURL('https://discord.gg/6QsXCfw')
                        .setDescription(`You participation for [this giveaway](${message.url}) has been denied : \n__Conditions__\nMessages : **${memberData.messagesCount}/${find.requiredMessages}**\n `)
                        .addFields({ name: "🧷 Links", value: `\n● Add me to your server [here](https://discordapp.com/api/oauth2/authorize?client_id=577236734245470228&permissions=8&scope=bot) \n● Join my support server [here](https://discord.gg/6QsXCfw) \n● Vote for me [here](https://top.gg/bot/577236734245470228/vote)` })
                        .setColor('#982318')
                        .setFooter({ text: client.config.footer, iconURL: client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

                    member.send({ embeds: [succese] }).catch(() => {});
                    reaction.users.remove(member.user);
                    if (guildData.glogs) {
                        const succesA = new EmbedBuilder()
                            .setTitle(`❎ | Participation denied`)
                            .setDescription(`The participation of ${member} for [this giveaway](${message.url}) has been denied.\n__Conditions__\nMessages : **${memberData.messagesCount}/${find.requiredMessages}**`)
                            .setColor(client.config.color)
                            .setURL('https://discord.gg/6QsXCfw')
                            .setFooter({ text: client.config.footer, iconURL: client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

                        let aLogs = member.guild.channels.cache.get(guildData.glogs);
                        if (aLogs) aLogs.send({ embeds: [succesA] });
                    }
                }
            }
        } else {
            const succes = new EmbedBuilder()
                .setTitle(`<:succes:851491428563812382> Entry accepted`)
                .setDescription(`Your participation for [this giveaway](${message.url}) has been accepted.`)
                .addFields({ name: "🧷 Links", value: `\n● Add me to your server [here](https://discordapp.com/api/oauth2/authorize?client_id=577236734245470228&permissions=8&scope=bot) \n● Join my support server [here](https://discord.gg/6QsXCfw) \n● Vote for me [here](https://top.gg/bot/577236734245470228/vote)` })
                .setColor(client.config.color)
                .setURL('https://discord.gg/6QsXCfw')
                .setFooter({ text: client.config.footer, iconURL: client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

            member.send({ embeds: [succes] }).catch(() => {});
            if (guildData.glogs) {
                const succesA = new EmbedBuilder()
                    .setTitle(`✅ - New valid entry`)
                    .setDescription(`${member}'s participation for [this giveaway](${message.url}) has been accepted.`)
                    .setColor(client.config.color)
                    .setURL('https://discord.gg/6QsXCfw')
                    .setFooter({ text: client.config.footer, iconURL: client.user.displayAvatarURL({ extension: 'png', size: 512 }) });

                let aLogs = member.guild.channels.cache.get(guildData.glogs);
                if (aLogs) aLogs.send({ embeds: [succesA] });
            }
        }
    }
};
