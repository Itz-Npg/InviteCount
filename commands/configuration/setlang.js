const Command = require("../../structures/Command.js"),
{ EmbedBuilder } = require("discord.js");

const languages = [
    {
        name: "french",
        aliases: [
            "francais",
            "fr",
            "français"
        ]
    },
    {
        name: "english",
        aliases: [
            "en",
            "englich"
        ]
    },
    {
        name: "turkish",
        aliases: [
            "turkce",
            "türkçe",
            "tr",
            "turkis"
        ]
    },
    {
        name: "russian",
        aliases: [
            "ru",
            "russkiy",
            "русский"
        ]
    },
    {
        name: "japanese",
        aliases: [
            "jp",
            "nihongo",
            "日本語"
        ]
    },
    {
        name: "hindi",
        aliases: [
            "hi",
            "hindee",
            "हिंदी"
        ]
    },
    {
        name: "portuguese",
        aliases: [
            "pt",
            "português",
            "portugues"
        ]
    },
    {
        name: "brazilian",
        aliases: [
            "br",
            "brasil",
            "português-br",
            "portugues-br"
        ]
    },
    {
        name: "spanish",
        aliases: [
            "es",
            "español",
            "espanol"
        ]
    },
    {
        name: "german",
        aliases: [
            "de",
            "deutsch"
        ]
    },
    {
        name: "italian",
        aliases: [
            "it",
            "italiano"
        ]
    },
    {
        name: "polish",
        aliases: [
            "pl",
            "polski"
        ]
    },
    {
        name: "dutch",
        aliases: [
            "nl",
            "nederlands"
        ]
    },
    {
        name: "swedish",
        aliases: [
            "sv",
            "svenska"
        ]
    },
    {
        name: "norwegian",
        aliases: [
            "no",
            "norsk"
        ]
    },
    {
        name: "danish",
        aliases: [
            "da",
            "dansk"
        ]
    },
    {
        name: "finnish",
        aliases: [
            "fi",
            "suomi"
        ]
    },
    {
        name: "greek",
        aliases: [
            "el",
            "ελληνικά"
        ]
    },
    {
        name: "czech",
        aliases: [
            "cs",
            "čeština"
        ]
    },
    {
        name: "hungarian",
        aliases: [
            "hu",
            "magyar"
        ]
    },
    {
        name: "romanian",
        aliases: [
            "ro",
            "română"
        ]
    },
    {
        name: "serbian",
        aliases: [
            "sr",
            "srpski"
        ]
    },
    {
        name: "croatian",
        aliases: [
            "hr",
            "hrvatski"
        ]
    },
    {
        name: "bulgarian",
        aliases: [
            "bg",
            "български"
        ]
    },
    {
        name: "ukrainian",
        aliases: [
            "uk",
            "українська"
        ]
    },
    {
        name: "slovak",
        aliases: [
            "sk",
            "slovenčina"
        ]
    },
    {
        name: "slovenian",
        aliases: [
            "sl",
            "slovenščina"
        ]
    },
    {
        name: "albanian",
        aliases: [
            "sq",
            "shqip"
        ]
    },
    {
        name: "icelandic",
        aliases: [
            "is",
            "íslenska"
        ]
    },
    {
        name: "belarusian",
        aliases: [
            "be",
            "беларуская"
        ]
    },
    {
        name: "lithuanian",
        aliases: [
            "lt",
            "lietuvių"
        ]
    }
];

class SetLang extends Command {
    constructor (client) {
        super(client, {
            name: "setlang",
            enabled: true,
            aliases: [ "setlanguage", "configlanguage" ],
            clientPermissions: [ "EmbedLinks" ],
            permLevel: 2
        });
    }

    async run (message, args, data) {
        let language = args[0];
        if(!languages.some((l) => l.name === language || l.aliases.includes(language))){
            return message.channel.send(message.language.setlang.invalid());
        }
        data.guild.language = languages.find((l) => l.name === language || l.aliases.includes(language)).name;
        await data.guild.save();
        message.language = require("../../languages/"+data.guild.language);
        message.channel.send(message.language.setlang.success());
    }
};
  

module.exports = SetLang;
