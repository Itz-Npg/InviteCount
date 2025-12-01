const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { isEqual } = require("../helpers/functions.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (member) {

        if(!this.client.fetched) return;

        let guildData = await this.client.findOrCreateGuild({ id: member.guild.id });
        let memberData = await this.client.findOrCreateGuildMember({ id: member.id, guildID: member.guild.id, bot: member.user.bot });
        
        let invite = null;
        let vanity = false;
        let oauth = false;
        let perm = false;

        if(!member.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) perm = true;

        if(member.user.bot){
            oauth = true;
        } else if(!perm) {
            let guildInvites = await member.guild.invites.fetch().catch(() => {});
            if(guildInvites){
                let oldGuildInvites = this.client.invitations[member.guild.id];
                this.client.invitations[member.guild.id] = guildInvites;
                let inviteUsed = guildInvites.find((i) => oldGuildInvites.get(i.code) && ((oldGuildInvites.get(i.code).hasOwnProperty("uses") ? oldGuildInvites.get(i.code).uses : "Infinite") < i.uses));
                if((isEqual([...oldGuildInvites.values()].map((i) => `${i.code}|${i.uses}` ).sort(), [...guildInvites.values()].map((i) => `${i.code}|${i.uses}` ).sort())) && !inviteUsed && member.guild.features.includes("VANITY_URL")){
                    vanity = true;
                } else if(!inviteUsed){
                    let newAndUsed = guildInvites.filter((i) => !oldGuildInvites.get(i.code) && i.uses === 1);
                    if(newAndUsed.size === 1){
                        inviteUsed = newAndUsed.first();
                    }
                }
                if(inviteUsed && !vanity) invite = inviteUsed;
            }
        }

        let inviter = invite ? await this.client.resolveUser(invite.inviter.id) : null;
        let inviterData = inviter ? await this.client.findOrCreateGuildMember({ id: inviter.id, guildID: member.guild.id, bot: inviter.bot }) : null;

        if(invite){
            let inviterMember = member.guild.members.cache.get(inviter.id);
            if(inviterMember){
                if(inviterData.left.includes(member.id)){
                    inviterData.left = inviterData.left.filter((id) => id !== member.id);
                    inviterData.leaves--;
                }
                if(inviterData.invited.includes(member.id)){
                    inviterData.fake++;
                    inviterData.invites++;
                } else {
                    inviterData.invites++;
                    inviterData.invited.push(member.id);
                }
                let nextRank = null;
                guildData.ranks.forEach((rank) => {
                    let superior = (rank.inviteCount >= (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake));
                    let found = member.guild.roles.cache.get(rank.roleID);
                    let superiorFound = (nextRank ? rank.inviteCount < nextRank.inviteCount : true);
                    if(superior && found && superiorFound) nextRank = rank;
                });
                if(nextRank && nextRank.inviteCount === (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake)){
                    if(!guildData.stacked){
                        let oldRoles = guildData.ranks.filter((r) => r.inviteCount < nextRank.inviteCount);
                        let oldRolesFound = oldRoles.filter((r) => member.guild.roles.cache.get(r.roleID));
                        oldRolesFound.forEach((r) => inviterMember.roles.remove(r.roleID));
                    }
                    inviterMember.roles.add(nextRank.roleID);
                }
                if(!nextRank){
                    let highestRole = guildData.ranks.sort((a,b) => b.inviteCount - a.inviteCount)[0];
                    if(highestRole && highestRole.inviteCount < (inviterData.invites + inviterData.bonus - inviterData.leaves - inviterData.fake)){
                        let highestRoleFound = member.guild.roles.cache.get(highestRole.roleID);
                        if(highestRoleFound){
                            inviterMember.roles.add(highestRoleFound);
                            if(!guildData.stacked){
                                let oldRoles = guildData.ranks.filter((r) => r.inviteCount < highestRole.inviteCount);
                                let oldRolesFound = oldRoles.filter((r) => member.guild.roles.cache.get(r.roleID));
                                oldRoles.forEach((r) => inviterMember.roles.remove(r.roleID));
                            }
                        }
                    }
                }
                await inviterData.save();
            }
        }
        
        let language = require("../languages/"+guildData.language);

        if(invite){
            memberData.joinData = {
                type: "normal",
                invite: {
                    uses: invite.uses,
                    url: invite.url,
                    code: invite.code,
                    inviter: inviter.id
                }
            };
        } else if(oauth){
            memberData.joinData = {
                type: "oauth"
            }
        } else if(vanity){
            memberData.joinData = {
                type: "vanity"
            }
        } else if(perm){
            memberData.joinData = {
                type: "perm"
            }
        }
        await memberData.save();

        if(guildData.joinDM.enabled && guildData.joinDM.message && invite ){
            let formattedMessage = this.client.functions.formatMessage(guildData.joinDM.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData)
            member.send(formattedMessage).catch(() => {});
        }

        if(guildData.join.enabled && guildData.join.message && guildData.join.channel){
            let channel = member.guild.channels.cache.get(guildData.join.channel);
            if(!channel) return;
            if(invite){
                let formattedMessage = this.client.functions.formatMessage(guildData.join.message, member, inviter, invite, (guildData.language || "english").substr(0, 2), inviterData)
                channel.send(formattedMessage);
            } else if(vanity){
                channel.send(language.utils.specialMessages.join.vanity(member.toString()))
            } else if(oauth){
                channel.send(language.utils.specialMessages.join.oauth2(member.toString()))
            } else if(perm){
                channel.send(language.utils.specialMessages.join.perm(member.toString()))
            } else {
                channel.send(language.utils.specialMessages.join.unknown(member.toString()))
            }
        }

    }
}
