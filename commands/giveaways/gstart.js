const Command = require("../../structures/Command.js"),
    { EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

const giveawayModel = require('../../models/giveaway');
const ms = require('ms');

class Gstart extends Command {
    constructor(client) {
        super(client, {
            name: "gstart",
            enabled: true,
            aliases: [],
            clientPermissions: ["EmbedLinks"],
            permLevel: 0
        });
    }

    async run(message, args, data) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return message.channel.send(message.language.errors.perms());
        }
        const currentGiveaways = message.client.giveawaysManager.giveaways.filter((g) => g.guildId === message.guild.id && !g.ended).length;
        if (currentGiveaways > 3 || currentGiveaways == 4) {
            return message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription("The maximum number of giveaways per server has been reached (4) Please end these giveaways first.")] });
        }
        const prompts = ["Hello ! Please mention the channel you want to host the giveaway in. !",
            "Super ! How long do you want the giveaway to last? \n You can use `m` for minutes, `h` for hours, `d` for days.",
            "How many winners will this giveaway have? \n Please enter a number between `1` and `10`.",
            "Good. What is the prize of this giveaway? \n Please enter the giveaway prize under this message.",
            "How many messages do giveaway participant need to have? \n Answer `0` to skip this step.",
        ];
        const response = await getResponses(message, this.client, data);
        if (response.cancelled) return;
        const infos = {
            "end": "Ends at :",
            "enter": "React with 🎁 to enter",
            "host": "Host by",
            "winners": "Winner(s)",
            "rest": "Remaining time:",
            "vote": "Vote for 25% more chances to win !",
            "error": "Giveaway cancelled, no valid participations.",
            "invite": "Invite me on your server !",
            "requirementMessage": "<:flache:852266031568781342> You must send `{messages}` messages",
            "requirementInvite": "<:flache:852266031568781342> You must have `{messages}` invites",
            "requirementDouble": "<:flache:852266031568781342> You must send `{messages}` messages and have `{count}` invites",
            "congrats": "🏆 Congratulations, {winners} ! You won **{prize}**!\n{messageURL}",
            "seconds": "seconds",
            "minutes": "minutes",
            "hours": "hours",
            "days": "days"
        };
        let condition;
        if (response.invites && response.messages) {
            condition = infos.requirementMessage.replace("{messages}", response.messages).replace("{count}", response.invites);
        } else {
            if (!response.invites && !response.messages) {
                condition = "";
            } else {
                if (response.messages) {
                    condition = infos.requirementMessage.replace("{messages}", response.messages);
                }
                if (response.invites) {
                    condition = infos.requirementInvite.replace("{messages}", response.invites);
                }
            }
        }
        let embed = new EmbedBuilder()
            .setAuthor({ name: "🎁 Giveaway System", iconURL: this.client.user.displayAvatarURL() })
            .setDescription(`Your giveaway has been started in ${response.channel}. You can manage it with the followings commands : \`greroll\` , \`gend\`.`)
            .setColor(data.color)
            .setFooter({ text: message.language.add.requested(message.author.username), iconURL: message.author.displayAvatarURL() });
        message.channel.send({ embeds: [embed] });

        message.client.giveawaysManager.start(response.channel, {
            duration: response.time,
            prize: response.price,
            winnerCount: parseInt(response.winners, 10),
            embedColorEnd: "#ED360E",
            messages: {
                giveaway: "\n\n<:tada:852265416905719859><:tada:852265416905719859> **GIVEAWAY** <:tada:852265416905719859><:tada:852265416905719859>",
                giveawayEnded: "\n\n<:tada:852265416905719859><:tada:852265416905719859> **GIVEAWAY ENDED** <:tada:852265416905719859><:tada:852265416905719859>",
                timeRemaining: "<:flache:852266031568781342> " + infos.rest + ": \`{duration}\`!\n" + condition + "\n[" + infos.vote + "](https://top.gg/bot/783708073390112830/vote)",
                inviteToParticipate: "<:flache:852266031568781342> " + infos.enter + "\n<:flache:852266031568781342> " + infos.host + " \`" + message.author.username + "\`\n<:flache:852266031568781342>\`" + response.winners + "\` " + infos.winners + "",
                winMessage: infos.congrats,
                embedFooter: infos.end,
                noWinner: "" + infos.error + "\n\n" + infos.host + " \`" + message.author.username + "\`",
                winners: "🏆 " + infos.winners + "",
                endedAt: infos.end,
                units: {
                    seconds: infos.seconds,
                    minutes: infos.minutes,
                    hours: infos.hours,
                    days: infos.days,
                    pluralS: false
                }
            }
        }).then((gData) => {
            if (response.invites && response.messages) {
                new giveawayModel({
                    serverID: `${gData.guildId}`,
                    MessageID: `${gData.messageId}`,
                    requiredMessages: `${response.messages}`,
                    requiredInvites: `${response.invites}`
                }).save();
            } else {
                if (!response.invites && !response.messages) {
                } else {
                    if (response.messages) {
                        new giveawayModel({
                            serverID: `${gData.guildId}`,
                            MessageID: `${gData.messageId}`,
                            requiredMessages: `${response.messages}`,
                        }).save();
                    }
                    if (response.invites) {
                        new giveawayModel({
                            serverID: `${gData.guildId}`,
                            MessageID: `${gData.messageId}`,
                            requiredInvites: `${response.invites}`
                        }).save();
                    }
                }
            }
            if (response.messages) {
                new giveawayModel({
                    serverID: `${gData.guildId}`,
                    MessageID: `${gData.messageId}`,
                    requiredMessages: `${response.messages}`,
                }).save();
            }
        });

        async function getResponses(message, client, data) {
            const validTime = /^\d+(s|m|h|d)$/;
            const validNumber = /^\d+/;
            const responses = {};
            let can = "Note: You can type at any moment `cancel` to cancel .";
            for (let i = 0; i < prompts.length; i++) {
                await message.channel.send({ embeds: [new EmbedBuilder().setAuthor({ name: "🎁 Giveaway System", iconURL: message.client.user.displayAvatarURL() }).setColor(data.color).setDescription(`${prompts[i]}\n\n${can}`)] });
                const filter = m => m.author.id === message.author.id;
                const response = await message.channel.awaitMessages({ filter, max: 1, time: 90000 }).catch(() => null);
                if (!response || response.size === 0) {
                    responses.cancelled = true;
                    message.channel.send({ embeds: [new EmbedBuilder().setColor(data.color).setTitle("💡 Operation cancelled")] });
                    return responses;
                }
                const { content } = response.first();
                const m = response.first();
                if (content.toLowerCase() === "cancel") {
                    responses.cancelled = true;
                    message.channel.send({ embeds: [new EmbedBuilder().setColor(data.color).setTitle("💡 Operation cancelled")] });
                    return responses;
                }
                if (i === 0) {
                    let channel = m.mentions.channels.first() ||
                        message.guild.channels.cache.get(content);
                    if (!channel) {
                        responses.cancelled = true;
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription(message.language.configjoin.errors.channelNotFound(content))] });
                        return responses;
                    }

                    if (channel.type === ChannelType.GuildCategory) {
                        responses.cancelled = true;
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription(message.language.configjoin.errors.channelNotFound(content))] });
                        return responses;
                    }
                    if (channel.type === ChannelType.GuildVoice) {
                        responses.cancelled = true;
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription(message.language.configjoin.errors.channelNotFound(content))] });
                        return responses;
                    }
                    responses.channel = channel;
                }
                if (i === 1) {
                    if (isNaN(ms(content))) {
                        responses.cancelled = true;
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription("Please provide a valid date format (d/m/s). Example: 1d")] });
                        return responses;
                    } else {
                        if (ms(content) > ms("15d")) {
                            responses.cancelled = true;
                            await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription("Date must not exceed 15 days.")] });
                            return responses;
                        } else {
                            responses.time = ms(content);
                        }
                    }
                }
                if (i === 2) {
                    if (isNaN(content) || content < 1 || content > 10 || m.content.includes('-') || m.content.includes('+') || m.content.includes(',') || m.content.includes('.')) {
                        responses.cancelled = true;
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription("Please provide a valid number between **1** and **10**")] });
                        return responses;
                    } else {
                        responses.winners = content;
                    }
                }
                if (i === 3) {
                    if (content.length < 2 || content.length > 1000) {
                        responses.cancelled = true;
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription("Prize must be between 2 and 1000 characters")] });
                        return responses;
                    }
                    responses.price = content;
                }
                if (i === 4) {
                    if (content === '0') {
                        responses.messages = null;
                    } else {
                        if (isNaN(content) || content < 1 || m.content.includes('-') || m.content.includes('+') || m.content.includes(',') || m.content.includes('.')) {
                            responses.cancelled = true;
                            await message.channel.send({ embeds: [new EmbedBuilder().setColor("#E07C2D").setDescription("Please provide a valid number")] });
                            return responses;
                        } else {
                            responses.messages = content;
                        }
                    }
                }
            }
            return responses;
        }
    }

};

module.exports = Gstart;
