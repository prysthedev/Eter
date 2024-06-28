const { SlashCommandBuilder, PermissionFlagsBits, Guild, EmbedBuilder } = require('discord.js');
const { addLog } = require('../../database/databaseHandler');

function createBanEmbed(target, moderator){
    const embed = new EmbedBuilder()
        .setTitle(`${target} has been banned`)
        .setColor("#ff0000")
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans the user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User you want to ban.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the ban.')
        )
        .addBooleanOption(option => 
            option.setName('direct-message')
                .setDescription('Banned user will be informed of his ban and the reason.')
        )
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Duration for the ban (permanent if empty).')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction, user) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const duration = interaction.options.getInteger('duration');

        if (duration === null) {
            await interaction.guild.members.ban(targetUser.id, { reason: reason })
            .then(
                addLog('ban', targetUser.id, interaction.guildId, user.id, reason),

                await interaction.reply({ embeds: [createBanEmbed(targetUser.username, user.username)] })
            )
            .catch (async err => {
                await interaction.reply({ content: `Unexpected error occured, try again later. | ${err}`, ephemeral: true });
            });
        } else {
            const time = new Date().getTime() / 1000;
            const expiration = time + (duration * 60);

            await interaction.guild.members.ban(targetUser.id, { reason: reason })
            .then(
                addLog('tempBan', targetUser.id, interaction.guildId, user.id, reason, expiration),

                await interaction.reply({ embeds: [createBanEmbed(targetUser.username, user.username)] })
            )
            .catch (async err => {
                await interaction.reply({ content: `Unexpected error occured, try again later. | ${err}`, ephemeral: true });
            });
        };

		console.log('[COMMANDS]', user.username, "just used the ban command");
	}
};