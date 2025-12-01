const mongoose = require("mongoose"),
Schema = mongoose.Schema;

module.exports = mongoose.model("GuildMember", new Schema({

    /* REQUIRED */
    userId: { type: String, required: true }, // Discord ID of the user
    guildId: { type: String, required: true },

    /* STATS */
    fake: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    leaves: { type: Number, default: 0 },
    invites: { type: Number, default: 0 },

    /* OLD STATS (restore command) */
    old_fake : { type: Number, default: 0 },
    old_bonus: { type: Number, default: 0 },
    old_leaves: { type: Number, default: 0 },
    old_invites: { type: Number, default: 0 },
    backuped: { type: Boolean, default: false },

    /* INVITES DATA */
    invited: { type: Array, default: [] },
    left: { type: Array, default: [] },

    /* INVITER */
    invitedBy: { type: String },
    usedInvite: { type: Object },
    joinData: { type: Object }, // { type: "normal" || "oauth" || "unknown" || "vanity", invite: inviteData || null }
   messagesCount: { type: Number, default: 0 },

    /* BOT */
    bot: { type: Boolean, default: false }

}, { 
    indexes: [
        { guildId: 1, userId: 1, unique: true, sparse: true }
    ]
}));
