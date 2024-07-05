const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const { isGuildInDatabase, setLogChannelForGuild, updateLogChannelForGuild } = require("../../database/databaseHandler");

function createEmbed(moderator) {
    const embed = new EmbedBuilder()
        .setTitle(`Successfully updated your log channel.`)
        .setColor('Green')
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-channel')
		.setDescription('Sets log channel for the current server.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel in which will every moderation action get logged.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, user, client) {
        const logChannel = interaction.options.getChannel('channel');
        const results = await isGuildInDatabase(interaction.guild.id);

        if (results == null) {
            const webhook = await logChannel.createWebhook({
                name: 'Eter | Moderation Logs',
                reason: 'Log channel'
            });

            await setLogChannelForGuild(interaction.guild.id, webhook.id, webhook.token);
        } else {
            try {
                const webhook = await client.fetchWebhook(results.webhookId, results.webhookToken);

                webhook.edit({
                    channel: logChannel.id
                });
            } catch {
                const webhook = await logChannel.createWebhook({
                    name: 'Eter | Moderation Logs',
                    reason: 'Log channel'
                });

                await updateLogChannelForGuild(interaction.guild.id, webhook.id, webhook.token);
            };
        };

        await interaction.reply( {embeds: [createEmbed(user.user.username)]} );

        console.log('[COMMANDS]', user.user.username, "just used the log-channel command");
    }
};