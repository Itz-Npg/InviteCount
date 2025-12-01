const { ShardingManager } = require("discord.js");
const config = require("./config");

// Check for required Discord token before starting shards
if (!config.token) {
    console.error('\n===========================================');
    console.error('ERROR: Missing DISCORD_BOT_TOKEN');
    console.error('===========================================');
    console.error('Please set the DISCORD_BOT_TOKEN secret to your Discord bot token.');
    console.error('Get your token from: https://discord.com/developers/applications');
    console.error('\nAdditionally, you will need:');
    console.error('- MONGODB_URI: Your MongoDB connection string');
    console.error('===========================================\n');
    process.exit(1);
}

const manager = new ShardingManager("./index.js", {
    token: config.token,
    totalShards: 1,
    shardArgs: process.argv
});

manager.on('shardCreate', shard => console.log(`InviteCount Shard #${shard.id} launched !`));
manager.spawn();
