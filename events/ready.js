const { PermissionFlagsBits, ActivityType } = require("discord.js");

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run () {

        const client = this.client;
       
        if(!process.argv.includes("--uncache")) await this.client.wait(1000);
        let invites = {};
        let startAt = Date.now();
        this.client.fetching = true;

        await this.client.functions.asyncForEach(Array.from(this.client.guilds.cache.values()), async (guild) => {
            let hasPermission = guild.members.me && guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild);
            let i = process.argv.includes("--uncache") ? new Map() : (hasPermission ? await guild.invites.fetch().catch(() => {}) : new Map());
            invites[guild.id] = i || new Map();
        });
        this.client.invitations = invites;
        this.client.fetched = true;
        this.client.fetching = false;
        if(this.client.shard.ids.includes(0)) console.log("=================================================");
        this.client.user.setPresence({ 
            status: "online", 
            activities: [{ 
                name: `@InviteCount - 2.0.0 | Shard: ${this.client.shard.ids[0]} | docs.invite-count.xyz`, 
                type: ActivityType.Playing 
            }]
        });
        setInterval(() => {
            this.client.user.setPresence({ 
                status: "online", 
                activities: [{ 
                    name: `@InviteCount - 2.0.0 | Shard: ${this.client.shard.ids[0]} | docs.invite-count.xyz`, 
                    type: ActivityType.Playing 
                }]
            });
        }, 60000*60);
        console.log(`\x1b[32m%s\x1b[0m`, `SHARD [${this.client.shard.ids[0]}]`, "\x1b[0m", `Invitations récupérées en  ${Date.now() - startAt} ms.`);
        console.log("=================================================");
        if(this.client.shard.ids.includes(this.client.shard.count-1)){
            console.log("Prêt. Enregistré en tant que "+this.client.user.tag+". Quelques statistiques:\n");
            this.client.shard.broadcastEval((c) => {
                console.log(`\x1b[32m%s\x1b[0m`, `SHARD [${c.shard.ids[0]}]`, "\x1b[0m", `Sert ${c.users.cache.size} membres et ${c.guilds.cache.size} serveurs.`);
            });
        }

    }
};
