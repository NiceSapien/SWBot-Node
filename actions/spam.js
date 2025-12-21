const { MessageEmbed } = require('discord.js');
const recentMessages = new Map();
const SPAM_CHANNEL_ID = '814828261044650064';
const TIMEOUT_DURATION = 2 * 60 * 1000;

module.exports = {
    name: "Spam",
    description: "Advanced AI Algorithms to automatically prevent spam in the server.",
    async execute(message) {
        const member = message.member;
        const now = Date.now();
        const hasHyperlink = message.content.includes('http://') || message.content.includes('https://');

        if (hasHyperlink) {
            const userId = message.author.id;
            const messageData = {
                content: message.content,
                channelId: message.channel.id,
                timestamp: now,
                id: message.id
            };

            if (!recentMessages.has(userId)) {
                recentMessages.set(userId, []);
            }

            const userMessages = recentMessages.get(userId);
            userMessages.push(messageData);

            const recentSpams = userMessages.filter(msg => now - msg.timestamp <= 30 * 1000);
            const uniqueLinks = new Set(recentSpams.map(msg => msg.content));

            if (uniqueLinks.size === 1 && recentSpams.length >= 6) {
                const promises = recentSpams.map(async (spamMsg) => {
                    try {
                        await message.channel.messages.delete(spamMsg.id);
                    } catch (deleteError) {
                        console.error(`Failed to delete message: ${deleteError}`);
                    }
                });

                await Promise.all(promises); // Delete all spam messages first

                const embed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setDescription(`User ${member} was timed out for 2 minutes for: Spamming`)
                    .setFooter('NikaTech Spam Protection Gen 2');

                try {
                    await member.timeout(TIMEOUT_DURATION, 'Spamming');
                    message.guild.channels.cache.get(SPAM_CHANNEL_ID).send({ embeds: [embed] });
                } catch (timeoutError) {
                    embed.setDescription(`Mute and Delete messages permission not found. Unable to timeout ${member} for spamming.`);
                    message.guild.channels.cache.get(SPAM_CHANNEL_ID).send({ embeds: [embed] });
                    console.error(`Timeout failed for ${member.user.tag}:`, timeoutError);
                }

                recentMessages.delete(userId);
            }
        }
    }
};
