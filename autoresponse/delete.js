const fs = require('fs');
let dataPath = "./autoresponse/_data.json"

module.exports = {
  async execute(message, autoResponsesList, updateAutoResopnseData, responseTimeout) {
    //Delete an autoresponse
    if (!message.content.startsWith("+autoresponse delete")) return;

    let pattern;
    const msg_filter = (m) => m.author.id === message.author.id;

    var deleteIndex = message.content.replace("+autoresponse delete", "").trim()
    if (deleteIndex.length && !isNaN(deleteIndex)) {
      pattern = Object.keys(autoResponsesList)[parseInt(deleteIndex)];
      if (!pattern) return await message.reply("Failed to delete autoresponse! Reason: Non existent index")

    } else {

      await message.reply(`Please send the \`Pattern\` of the autoresponse you want to delete.`);

      const collectedPattern = await message.channel.awaitMessages({ filter: msg_filter, max: 1, time: responseTimeout });

      if (!collectedPattern.first()) return message.reply('Autoresponse deletion failed! Reason: Timeout');

      pattern = collectedPattern.first().content

      if (!autoResponsesList[pattern]) return await message.reply("Failed to delete autoresponse! Reason: Pattern not found")
    }

    let autoResponse = autoResponsesList[pattern].response
    await message.reply(`Received Pattern \`${pattern}\`, Which has the following response:\n \`${autoResponse}\`\nDelete it?  \`Y\` / \`N\``);
    const collectedConfirmation = await message.channel.awaitMessages({ filter: msg_filter, max: 1, time: responseTimeout })

    if (!collectedConfirmation.first()) return message.reply('Autoresponse deletion failed! Reason: Timeout');

    let confirmation = collectedConfirmation.first().content
    if (confirmation.toUpperCase() == "Y") {

      delete autoResponsesList[pattern]
      fs.writeFile(dataPath, JSON.stringify(autoResponsesList), async function(err) {
        if (err) {
          await message.reply("Autoresponse deletion failed! Reason: Error")
          autoResponsesList[pattern] = {
            "response": autoResponse
          }
          return console.log(err)
        }
        updateAutoResopnseData()
        return await message.reply("Autoresponse deleted.")
      });

    } else {
      return await message.reply("Autoresponse deletion Aborted")
    }
  }
}