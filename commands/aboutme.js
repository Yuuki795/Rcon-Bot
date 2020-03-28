const Discord = require('discord.js');
module.exports = class test {
    constructor(){
            this.name = 'aboutme',
            this.alias = ['t'],
            this.usage = `??aboutme`
    }
 
    async run(bot, message, args) {
    var embed = new Discord.RichEmbed()

    .setTitle("About Me!")
    .setDescription("Hello, Im a Discord.js Rcon Bot.")
    .setColor('#FF0000')
    .setFooter("If you run into any problems please contact:    Yukki#2356 or Lead#2546")

    message.channel.sendEmbed(embed);
    }
}
