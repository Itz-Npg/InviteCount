const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class ServersList extends Command {

    constructor (client) {
        super(client, {
            name: "servers-list",
            enabled: true,
            aliases: [ "sl" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 4
        });
    }

    async run (message, args, data) {
        
        await message.delete().catch(() => {});

        let i0 = 0;
        let i1 = 10;
        let page = 1;

        let results = await this.client.shard.broadcastEval((c) => {
            return [...c.guilds.cache.values()].map(g => ({ name: g.name, memberCount: g.memberCount }));
        });
        let guilds = [];
        results.forEach((a) => guilds = [...guilds, ...a]);

        let description = 
        `Total servers: ${guilds.length}\n\n`+
        guilds.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
        .map((r, i) => `**${i + 1}** - ${r.name} | ${r.memberCount} members`)
        .slice(0, 10)
        .join("\n");

        let embed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(data.color)
            .setFooter({ text: message.client.user.username })
            .setTitle(`Page: ${page}/${Math.ceil(guilds.length/10)}`)
            .setDescription(description);

        let msg = await message.channel.send({ embeds: [embed] });
        
        await msg.react("⬅");
        await msg.react("➡");
        await msg.react("❌");

        const filter = (reaction, user) => user.id === message.author.id;
        let collector = msg.createReactionCollector({ filter, time: 120000 });

        collector.on("collect", async(reaction, user) => {

            if(reaction.emoji.name === "⬅") {
                i0 = i0-10;
                i1 = i1-10;
                page = page-1;
                
                if(i0 < 0){
                    return msg.delete().catch(() => {});
                }
                if(!i0 || !i1){
                    return msg.delete().catch(() => {});
                }
                
                description = `Total servers: ${guilds.length}\n\n`+
                guilds.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
                .map((r, i) => `**${i + 1}** - ${r.name} | ${r.memberCount} members`)
                .slice(i0, i1)
                .join("\n");

                embed.setTitle(`Page: ${page}/${Math.round(guilds.length/10)}`)
                .setDescription(description);
            
                msg.edit({ embeds: [embed] });
            
            };

            if(reaction.emoji.name === "➡"){
                i0 = i0+10;
                i1 = i1+10;
                page = page+1;

                if(i1 > guilds.length + 10){
                    return msg.delete().catch(() => {});
                }
                if(!i0 || !i1){
                    return msg.delete().catch(() => {});
                }

                description = `Total servers: ${guilds.length}\n\n`+
                guilds.sort((a,b) => b.memberCount-a.memberCount).map((r) => r)
                .map((r, i) => `**${i + 1}** - ${r.name} | ${r.memberCount} members`)
                .slice(i0, i1)
                .join("\n");

                embed.setTitle(`Page: ${page}/${Math.round(guilds.length/10)}`)
                .setDescription(description);
            
                msg.edit({ embeds: [embed] });

            };

            if(reaction.emoji.name === "❌"){
                return msg.delete().catch(() => {}); 
            }

            await reaction.users.remove(message.author.id).catch(() => {});

        });
    }

}

module.exports = ServersList;
