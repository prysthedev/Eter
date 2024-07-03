const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addLog } = require('../../database/databaseHandler');

function createHigherRankEmbed(moderator) {
    const embed = new EmbedBuilder()
        .setTitle(`You can't ban this member.`)
        .setColor('Red')
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

function createHigherRankEmbed2(moderator) {
    const embed = new EmbedBuilder()
        .setTitle(`I can't ban this member.`)
        .setColor('Red')
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

function createBanEmbed(target, moderator, reason) {
    const embed = new EmbedBuilder()
        .setTitle(`${target} has been banned. | ${reason}`)
        .setColor('Green')
        .setFooter({
            text: moderator,
        })
        .setTimestamp();

    return embed;
};

function convertTime(duration) {
    if (duration.endsWith('d')) {
        duration = parseInt(duration);
        duration = (duration * 24 * 60 * 60);
    } else if (duration.endsWith('m')) {
        duration = parseInt(duration);
        duration = (duration * 60);
    } else if (duration.endsWith('h')) {
        duration = parseInt(duration);
        duration = (duration * 60 * 60);
    } else if (duration.endsWith('w')) {
        duration = parseInt(duration);
        duration = (duration * 7 * 24 * 60 * 60);
    } else if (duration.endsWith('y')) {
        duration = parseInt(duration);
        duration = (duration * 365 * 24 * 60 * 60);
    };

    return duration;
};

function convertTimeToReadable(duration) {
    if (duration.endsWith('d')) {
        duration = parseInt(duration);
        if (duration > 1) {
            duration = `${duration} days`
        } else {
            duration = `${duration} day`
        }
    } else if (duration.endsWith('m')) {
        duration = parseInt(duration);
        if (duration > 1) {
            duration = `${duration} minutes`
        } else {
            duration = `${duration} minute`
        }
    } else if (duration.endsWith('h')) {
        duration = parseInt(duration);
        if (duration > 1) {
            duration = `${duration} hours`
        } else {
            duration = `${duration} hour`
        }
    } else if (duration.endsWith('w')) {
        duration = parseInt(duration);
        if (duration > 1) {
            duration = `${duration} weeks`
        } else {
            duration = `${duration} week`
        }
    } else if (duration.endsWith('y')) {
        duration = parseInt(duration);
        if (duration > 1) {
            duration = `${duration} years`
        } else {
            duration = `${duration} year`
        }
    };

    return duration;
}

async function sendDirectMessage(user, reason, guildName, duration) {
    if (duration == undefined) {
        duration = 'Permanent'
    }

    const embed = new EmbedBuilder()
        .setTitle(`You have been banned from ${guildName}.`)
        .setColor('Red')
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
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration for the ban (permanent if empty). Ex: 1m (1 minute), 10d, 2w.')
        )
        .addBooleanOption(option => 
            option.setName('preserve-messages')
                .setDescription('Whether to preserve user messages or not.')
        )
        .addBooleanOption(option => 
            option.setName('appealable')
                .setDescription('Whether you want to allow the user to appeal his punishment.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction, user) {
        const targetMember = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');
        const duration = interaction.options.getString('duration');
        const directMessage = interaction.options.getBoolean('direct-message');
        const preserveMessages = interaction.options.getBoolean('preserve-messages');
        const deleteMessageSeconds = 604800;

        if (preserveMessages == true) {
            deleteMessageSeconds = 0;
        };

        if (isNaN(parseInt(duration))) {
            return await interaction.reply({ content: 'Use valid duration time. Examples: (24h, 2w, 1y, 20m (20 minutes))', ephemeral: true });
        };

        if (targetMember.user.id == user.user.id || targetMember.user.id == interaction.guild.ownerId) {
            return await interaction.reply({ embeds: [createHigherRankEmbed(user.user.username)] });
        }

        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return await interaction.reply({ embeds: [createHigherRankEmbed2(user.user.username)] });
        };

        if (targetMember.roles.highest.position >= user.roles.highest.position && user.user.id != interaction.guild.ownerId) {
            return await interaction.reply({ embeds: [createHigherRankEmbed(user.user.username)] });
        };

        if (duration == null) {
            if (directMessage == true) {
                await sendDirectMessage(targetMember.user, reason, interaction.guild.name);
            };

            await interaction.guild.members.ban(targetMember.user.id, { reason: `${user.user.username} | ${reason}`, deleteMessageSeconds: deleteMessageSeconds })
            .then(
                addLog('ban', targetMember.user.id, interaction.guildId, user.user.id, reason),

                await interaction.reply({ embeds: [createBanEmbed(targetMember.user.username, user.user.username, reason)] })
            )
            .catch (async err => {
                await interaction.reply({ content: `Unexpected error occured, try again later. | ${err}`, ephemeral: true });
            });
        } else {
            const time = new Date().getTime() / 1000;
            const expiration = convertTime(duration) + time;
            

            if (directMessage == true) {
                await sendDirectMessage(targetMember.user, reason, interaction.guild.name, convertTimeToReadable(duration));
            };

            await interaction.guild.members.ban(targetMember.user.id, { reason: `${user.user.username} | ${reason}`, deleteMessageSeconds: deleteMessageSeconds })
            .then(
                addLog('tempBan', targetMember.user.id, interaction.guildId, user.user.id, reason, expiration),

                await interaction.reply({ embeds: [createBanEmbed(targetMember.user.username, user.user.username, reason)] })
            )
            .catch (async err => {
                await interaction.reply({ content: `Unexpected error occured, try again later. | ${err}`, ephemeral: true });
            });
        };

		console.log('[COMMANDS]', user.user.username, "just used the ban command");
	}
};