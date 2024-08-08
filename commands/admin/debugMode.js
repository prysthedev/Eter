const { SlashCommandBuilder } = require('discord.js');
const { setDebugMode, isDeveloper } = require('../../database/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug-mode')
        .setDescription('Global debug mode for the bot (only for the developers).')
        .addBooleanOption(option =>
            option.setName('status')
                .setDescription('True or false.')
                .setRequired(true)
        ),

        async execute(interaction, user, client) {
            if (await isDeveloper(user.user.id) == false) {
                return;
            };

            const status = interaction.options.getBoolean('status');

            setDebugMode(interaction.guildId, status);
        }
};