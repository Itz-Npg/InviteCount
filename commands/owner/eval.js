const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

const clean = (txt) => {
    if (typeof(txt) === "string") return txt.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    return txt;   
};

class Eval extends Command {
    constructor (client) {
        super(client, {
            name: "eval",
            enabled: true,
            aliases: [ "execute" ],
            clientPermissions: [],
            permLevel: 4
        });
    }

    async run (message, args, data) {

        const content = message.content.split(" ").slice(1).join(" ");
        const result = new Promise((resolve) => resolve(eval(content)));
        
        return result.then((output) => {
            if(typeof output !== "string"){
                output = require("util").inspect(output, { depth: 0 });
            }
            if(output.includes(this.client.token)){
                output = output.replace(this.client.token, "T0K3N");
            }
            const embed = new EmbedBuilder()
                .setColor("Random")
                .addFields(
                    { name: "📥 Code testé", value: "```js\n" + content + "\n```" },
                    { name: "📤 Resultat", value: "```js\n" + output.slice(0, 1000) + "\n```" }
                );
            message.channel.send({ embeds: [embed] });
        }).catch((err) => {
            err = err.toString();
            if(err.includes(this.client.token)){
                err = err.replace(this.client.token, "T0K3N");
            }
            const embed = new EmbedBuilder()
                .setColor("Random")
                .addFields(
                    { name: "📥 Code testé", value: "```js\n" + content + "\n```" },
                    { name: "📤 Resultat", value: "```js\n" + err.slice(0, 1000) + "\n```" }
                );
            message.channel.send({ embeds: [embed] });
        });
    }

}

module.exports = Eval;
