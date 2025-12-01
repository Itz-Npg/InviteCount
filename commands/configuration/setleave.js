const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

class SetLeave extends Command {
    constructor (client) {
        super(client, {
            name: "setleave",
            enabled: true,
            aliases: [],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        if(!data.guild.leave.enabled){
            data.guild.leave.enabled = true;
            data.guild.markModified("leave");
            await data.guild.save();
            return message.channel.send(message.language.setleave.on());
        }
        if(data.guild.leave.enabled){
            data.guild.leave.enabled = false;
            data.guild.markModified("leave");
            await data.guild.save();
            return message.channel.send(message.language.setleave.off());
        }
    }
};
          
module.exports = SetLeave;
