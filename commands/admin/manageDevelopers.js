const { SlashCommandBuilder } = require('discord.js');
const { developers } = require('../../database/databaseHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('developer')
        .setDescription('Rawr :3 (only for the bot owner).')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('The command action.')
                .setRequired(true)
                .addChoices(
                    { name: 'addDeveloper', value: 'addDeveloper' },
                    { name: 'removeDeveloper', value: 'removeDeveloper' }
                )
        )
        .addStringOption(option =>
            option.setName('user')
                .setDescription('User.')
                .setRequired(true)
        ),

        async execute(interaction, user, client) {
            const action = interaction.options.getString('action');
            const userId = interaction.options.getString('user')

            if (user.user.id == '562694909702963220') {
                developers(action, userId);
            };
        }
};