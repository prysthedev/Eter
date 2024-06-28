const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { userInfo } = require('node:os');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
//const joinedGuildEvent = require('./events/joinedGuild');

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`[WARNING] No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, interaction.user);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// client.on('guildCreate', (guild) => {
//     joinedGuildEvent.joinedGuild(guild);
// });

client.login("ODg3MzMwNDgzNjU3MTQyMjgy.GfBApu.XEle51gF324-7ORXUxuJlaNL2q4pXhMp3s35mQ");