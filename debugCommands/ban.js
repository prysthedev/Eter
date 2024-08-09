const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addLog } = require('../database/databaseHandler');
const { createBanLog } = require('../tasks/modLogHandler');
const { convertTime, convertTimeToReadable } = require('../modules/timeModule');

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
	async debugExecute(info, interaction, user, client) {
        try {
            const targetMember = info.tm;
            const reason = info.r;
            const duration = info.d;
            const directMessage = info.dm;
            const preserveMessages = info.pm;
            const deleteMessageSeconds = info.dms;

            if (preserveMessages == true) {
                deleteMessageSeconds = 0;
            };

            if (isNaN(parseInt(duration)) && duration != null && duration != 'Permanent') {
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

                addLog('ban', targetMember.user.id, interaction.guildId, user.user.id, reason);

                await interaction.reply({ embeds: [createBanEmbed(targetMember.user.username, user.user.username, reason)] });

                createBanLog(interaction.guild.id, info, client);
            } else {
                const time = new Date().getTime() / 1000;
                const expiration = await convertTime(duration) + time;
                

                if (directMessage == true) {
                    await sendDirectMessage(targetMember.user, reason, interaction.guild.name, await convertTimeToReadable(duration));
                };

                addLog('tempBan', targetMember.user.id, interaction.guildId, user.user.id, reason, expiration);

                await interaction.reply({ embeds: [createBanEmbed(targetMember.user.username, user.user.username, reason)] });

                createBanLog(interaction.guild.id, info, client);
            };

            console.log('[DEBUG COMMANDS]', user.user.username, "just used the ban command");
        } catch (err) {
            console.log(`Unexpected error occured, try again later. | ${err}`);
        };
	}
};