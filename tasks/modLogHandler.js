const { EmbedBuilder, WebhookClient } = require("discord.js");
const { isGuildInDatabase } = require("../database/databaseHandler");

function createEmbed(banData) {
    const embed = new EmbedBuilder()
        .setTitle("User has been banned.")
        .addFields(
            {
            name: "Target:",
            value: banData.tm,
            inline: false
            },
            {
            name: "Moderator:",
            value: banData.m,
            inline: false
            },
            {
            name: "Reason:",
            value: banData.r,
            inline: false
            },
            {
            name: "Duration:",
            value: banData.d,
            inline: false
            },
        )
        .setThumbnail("https://cdn.discordapp.com/avatars/562694909702963220/6a834ffc29988cd8cb77e6f4caec7158.png?size=1024")
        .setColor('Red')
        .setFooter({
            text: banData.m,
        })
        .setTimestamp();

    return embed;
};

module.exports = {
    async createBanLog(guildId, banData, client) {
        const results = await isGuildInDatabase(guildId);

        if (results != null) {
            const webhookClient = new WebhookClient({ id: results.webhookId, token: results.webhookToken });

            try {
                const embed = createEmbed(banData)

                await webhookClient.send({
                    embeds: [embed]
                });
                
            } catch (err) {
                console.log(`[TASKS] Sending a moderation log failed | ${err}`);
            };
        };
    }
};