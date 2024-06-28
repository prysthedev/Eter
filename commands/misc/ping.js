const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, user) {
		await interaction.reply('Pong!');
		console.log('[COMMANDS]', user.username, "just used the ping command");
	},
};