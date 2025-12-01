module.exports = {
    token:          process.env.DISCORD_BOT_TOKEN || "",
    /* Emojis */
    emojis: {
        success:    "<:success:753232040073101363>",
        error:      "<:error:753232040199192657>",
        online:     ":green_circle:",
        dnd:        ":red_circle:",
        offline:    ":white_circle:",
        idle:       ":orange_circle:",
        loading:    "<a:loading:753232044485509268>",
        warn:       "<a:loading:753232044485509268>"
    },
    /* Embeds */
    color:          "#2f3136",
    footer:         "🚀 InviteCount | invite-count.xyz",
    /* Logs */
    addLogs:        "755505356951519355",
    removeLogs:     "755505356951519355",
    shardLogs:      "756174565549539333",
    dashLogs:       "754079986788466769",
    /* Dashboard */
    secret:         process.env.DISCORD_CLIENT_SECRET || "",
    baseURL:        process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000",
    port:           5000,
    pswd:           process.env.SESSION_SECRET || "change-this-secret",
    failureURL:     process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000",
    /* Other */
    mongodb:        process.env.MONGODB_URI || "",
    discord:        "https://discord.gg/JVrQXGwace",
    prefix:         process.env.BOT_PREFIX || "+",
    owners: process.env.BOT_OWNERS ? process.env.BOT_OWNERS.split(",") : [ "1052620216443601076", "307512442617856000", "351840777921626113" ],
    /* PayPal */
    paypal: {
        mode: "sandbox",
        sandbox: {
            client_id: "",
            client_secret: ""
        },
        live: {
            client_id: "",
            client_secret: ""
        }
    }
};
