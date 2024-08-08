const { EmbedBuilder } = require("discord.js");
const { isGuildInDatabase } = require("../database/databaseHandler");

function createEmbed(banData) {
    const embed = new EmbedBuilder()
        .setTitle("User has been banned.")
        .addFields(
            {
            name: "Target:",
            value: banData.target,
            inline: false
            },
            {
            name: "Moderator:",
            value: banData.moderator,
            inline: false
            },
            {
            name: "Reason:",
            value: banData.reason,
            inline: false
            },
            {
            name: "Duration:",
            value: banData.duration,
            inline: false
            },
        )
        .setThumbnail("https://cdn.discordapp.com/avatars/562694909702963220/6a834ffc29988cd8cb77e6f4caec7158.png?size=1024")
        .setColor('Red')
        .setFooter({
            text: banData.moderator,
        })
        .setTimestamp();

    return embed;
};

module.exports = {
    async createBanLog(guildId, banData, client) {
        const results = await isGuildInDatabase(guildId);

        if (results != null) {
            const webhook = await client.fetchWehook(results.webhookId, results.webhookToken);

            try {
                await webhook.send({
                    content: { embeds: [createEmbed(banData)] }
                });
            } catch (err) {
                console.log(`[TASKS] Sending a moderation log failed | ${err}`);
            };
        };
    }
};