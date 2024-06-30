const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addLog } = require('../../database/databaseHandler');

function createHigherRankEmbed(moderator){
    const embed = new EmbedBuilder()
        .setTitle(`You can't ban this member.`)
        .setColor("#ff0000")
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

function createHigherRankEmbed2(moderator){
    const embed = new EmbedBuilder()
        .setTitle(`I can't ban this member.`)
        .setColor("#ff0000")
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

function createBanEmbed(target, moderator){
    const embed = new EmbedBuilder()
        .setTitle(`${target} has been banned.`)
        .setColor("#ff0000")
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

async function sendDirectMessage(user, reason, guildName, duration) {
    if (duration == undefined) {
        duration = 'Permanent'
    }

    const embed = new EmbedBuilder()
        .setTitle(`You have been banned from ${guildName}.`)
        .setColor("#ff0000")
        .addFields(
            {
                name: "Reason:",
                value: reason,
                inline: false
            },
            {
                name: "Duration:",
                value: duration,
                inline: false
            }
        );

    await user.send({ embeds: [embed] })
        .catch(err => {
            console.log(err);
            return 'failed';
        });
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
        const targetMember = interaction.options.getMember('user')
        const reason = interaction.options.getString('reason');
        const duration = interaction.options.getInteger('duration');
        const directMessage = interaction.options.getBoolean('direct-message');

        if (targetMember.user.id == user.user.id || targetMember.user.id == interaction.guild.ownerId) {
            return await interaction.reply({ embeds: [createHigherRankEmbed(user.user.username)] });
        }

        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return await interaction.reply({ embeds: [createHigherRankEmbed2(user.user.username)] });
        };

        if (targetMember.roles.highest.position >= user.roles.highest.position && user.user.id != interaction.guild.ownerId) {
            return await interaction.reply({ embeds: [createHigherRankEmbed(user.user.username)] });
        };

        if (duration === null) {
            if (directMessage == true) {
                await sendDirectMessage(targetMember.user, reason, interaction.guild.name);
            };

            await interaction.guild.members.ban(targetMember.user.id, { reason: `${user.user.username} | ${reason}` })
            .then(
                addLog('ban', targetMember.user.id, interaction.guildId, user.user.id, reason),

                await interaction.reply({ embeds: [createBanEmbed(targetMember.user.username, user.user.username)] })
            )
            .catch (async err => {
                await interaction.reply({ content: `Unexpected error occured, try again later. | ${err}`, ephemeral: true });
            });
        } else {
            const time = new Date().getTime() / 1000;
            const expiration = time + (duration * 60);

            if (directMessage == true) {
                await sendDirectMessage(targetMember.user, reason, interaction.guild.name);
            };

            await interaction.guild.members.ban(targetMember.user.id, { reason: `${user.user.username} | ${reason}` })
            .then(
                addLog('tempBan', targetMember.user.id, interaction.guildId, user.user.id, reason, expiration),

                await interaction.reply({ embeds: [createBanEmbed(targetMember.user.username, user.user.username)] })
            )
            .catch (async err => {
                await interaction.reply({ content: `Unexpected error occured, try again later. | ${err}`, ephemeral: true });
            });
        };

		console.log('[COMMANDS]', user.user.username, "just used the ban command");
	}
};