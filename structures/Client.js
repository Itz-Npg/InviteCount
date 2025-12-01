const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js"),
    util = require("util"),
    path = require("path");
const { Database } = require('quickmongo');
const config = require("../config.js")
const { GiveawaysManager } = require("discord-giveaways");

let db = null;
let dbReady = false;
let dbConnectPromise = null;

if (config.mongodb) {
    db = new Database(config.mongodb);
    dbConnectPromise = db.connect()
        .then(() => {
            dbReady = true;
            console.log('QuickMongo database connected successfully');
        })
        .catch(err => {
            console.error('QuickMongo connection error:', err);
            db = null;
            dbReady = false;
        });
}

async function waitForDb() {
    if (!config.mongodb) return false;
    if (dbReady) return true;
    if (dbConnectPromise) {
        try {
            await dbConnectPromise;
        } catch (e) {
            return false;
        }
        return dbReady;
    }
    return false;
}

function getDb() {
    return db;
}

function isDbReady() {
    return dbReady;
}

const GiveawayManagerWithShardSupport = class extends GiveawaysManager {
    async getAllGiveaways() {
        if (!await waitForDb()) return [];
        try {
            return await db.get('giveaways') || [];
        } catch (err) {
            console.error('Error getting giveaways:', err.message);
            return [];
        }
    }

    async saveGiveaway(messageId, giveawayData) {
        if (!await waitForDb()) return false;
        try {
            await db.push('giveaways', giveawayData);
            return true;
        } catch (err) {
            console.error('Error saving giveaway:', err.message);
            return false;
        }
    }

    async editGiveaway(messageId, giveawayData) {
        if (!await waitForDb()) return false;
        try {
            const giveaways = await db.get('giveaways') || [];
            const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageId !== messageId);
            newGiveawaysArray.push(giveawayData);
            await db.set('giveaways', newGiveawaysArray);
            return true;
        } catch (err) {
            console.error('Error editing giveaway:', err.message);
            return false;
        }
    }

    async deleteGiveaway(messageId) {
        if (!await waitForDb()) return false;
        try {
            const data = await db.get('giveaways') || [];
            const newGiveawaysArray = data.filter((giveaway) => giveaway.messageId !== messageId);
            await db.set('giveaways', newGiveawaysArray);
            return true;
        } catch (err) {
            console.error('Error deleting giveaway:', err.message);
            return false;
        }
    }
    
    async refreshStorage() {
        return client.shard.broadcastEval(() => this.giveawaysManager.getAllGiveaways());
    }
};

class ManageInvite extends Client {

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.GuildMember,
                Partials.User
            ]
        });
        this.config = require("../config");
        this.permLevels = require("../helpers/permissions");
        this.commands = new Collection();
        this.aliases = new Collection();
        this.logger = require("../helpers/logger");
        this.functions = require("../helpers/functions");
        this.wait = util.promisify(setTimeout);
        this.invitations = [];
        this.fetched = false;
        this.fetching = false;
        this.guildMembersData = require("../structures/GuildMember");
        this.guildsData = require("../structures/Guild");

        this.states = {};
        this.spawned = false;
        this.knownGuilds = [];

        this.giveawaysManager = new GiveawayManagerWithShardSupport(this, {
            storage: false,
            updateCountdownEvery: 10000,
            default: {
                botsCanWin: false,
                exemptPermissions: [],
                embedColorEnd: '#ED360E',
                embedColor: "#efaa66",
                reaction: '🎁'
            }
        });

    }
    
    get db() {
        return db;
    }
    
    async waitForDb() {
        return await waitForDb();
    }

    loadCommand(commandPath, commandName) {
        try {
            const props = new(require(`.${commandPath}${path.sep}${commandName}`))(this);
            props.conf.location = commandPath;
            if (props.init) {
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            props.conf.aliases.forEach((alias) => {
                this.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    async unloadCommand(commandPath, commandName) {
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else if (this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) {
            return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
        }
        if (command.shutdown) {
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
        return false;
    }

    async findOrCreateGuild(param, isLean) {
        let Guild = this.guildsData;
        return new Promise(async function(resolve, reject) {
            if (!param || !param.id) {
                return reject(new Error("Invalid parameters: id is required"));
            }
            let guild = (isLean ? await Guild.findOne(param).lean() : await Guild.findOne(param));
            if (guild) {
                resolve(guild);
            } else {
                guild = new Guild(param);
                await guild.save().catch(err => {
                    if (err.code === 11000) {
                        console.error("Duplicate key error prevented for guild:", param, err.message);
                        reject(err);
                    } else {
                        throw err;
                    }
                });
                resolve(isLean ? guild.toJSON() : guild);
            }
        });
    }

    async findOrCreateGuildMember(param, isLean) {
        let GuildMember = this.guildMembersData;
        return new Promise(async function(resolve, reject) {
            // Normalize parameters to use correct field names
            let queryParam = {};
            if (param.id) queryParam.userId = param.id;
            if (param.userId) queryParam.userId = param.userId;
            if (param.guildID) queryParam.guildId = param.guildID;
            if (param.guildId) queryParam.guildId = param.guildId;
            
            if (!queryParam.guildId || !queryParam.userId) {
                return reject(new Error("Invalid parameters: guildId and userId are required"));
            }
            
            let guildMember = (isLean ? await GuildMember.findOne(queryParam).lean() : await GuildMember.findOne(queryParam));
            if (guildMember) {
                resolve(guildMember);
            } else {
                // Preserve original parameters but use correct schema field names
                let saveParam = {
                    userId: queryParam.userId,
                    guildId: queryParam.guildId
                };
                if (param.bot !== undefined) saveParam.bot = param.bot;
                
                guildMember = new GuildMember(saveParam);
                await guildMember.save().catch(err => {
                    if (err.code === 11000) {
                        console.error("Duplicate key error prevented for guildMember:", saveParam, err.message);
                        reject(err);
                    } else {
                        throw err;
                    }
                });
                resolve(isLean ? guildMember.toJSON() : guildMember);
            }
        });
    }

    async resolveMember(search, guild) {
        let member = null;
        if (!search || typeof search !== "string") return;
        if (search.match(/^<@!?(\d+)>$/)) {
            let id = search.match(/^<@!?(\d+)>$/)[1];
            member = await guild.members.fetch(id).catch(() => {});
            if (member) return member;
        }
        if (search.match(/^!?([^#]+)#(\d+)$/)) {
            guild = await guild.members.fetch();
            member = guild.members.cache.find((m) => m.user.tag === search);
            if (member) return member;
        }
        member = await guild.members.fetch(search).catch(() => {});
        return member;
    }

    async resolveUser(search) {
        let user = null;
        if (!search || typeof search !== "string") return;
        if (search.match(/^<@!?(\d+)>$/)) {
            let id = search.match(/^<@!?(\d+)>$/)[1];
            user = await this.users.fetch(id).catch(() => {});
            if (user) return user;
        }
        user = await this.users.fetch(search).catch(() => {});
        return user;
    }

    getLevel(message) {
        let permlvl = 0;
        const permOrder = this.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);
        while (permOrder.length) {
            const currentLevel = permOrder.shift();
            if (message.guild && currentLevel.guildOnly) continue;
            if (currentLevel.check(message)) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    }
}

module.exports = ManageInvite;
