const { PermissionFlagsBits } = require("discord.js");

module.exports = [
    {
        level: 0,
        name: "User",
        check: () => true,
    },
    {
        level: 1,
        name: "Moderator",
        check: (message) => (message.guild ? message.member.permissions.has(PermissionFlagsBits.ManageMessages) : false),
    },
    {
        level: 2,
        name: "Administrator",
        check: (message) => (message.guild ? message.member.permissions.has(PermissionFlagsBits.Administrator) : false),
    },
    {
        level: 3,
        name: "Owner",
        check: (message) => (message.guild ? message.author.id === message.guild.ownerId : false),
    },
    {
        level: 4,
        name: "Bot owner",
        check: (message) => message.client.config.owners.includes(message.author.id),
    },
];
