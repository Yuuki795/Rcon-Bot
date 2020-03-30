//.disable
const discord = require("discord.js");
const botconfig = require("./util/botconfig.json");
const bot = new discord.Client({disableEveryone: true});
const {CommandHandler} = require("djs-commands")
const CH = new CommandHandler({
    folder: __dirname + "/commands/",
    prefix: ["??"]
  });

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag} on ${bot.guilds.size} servers`)
  bot.user.setPresence({
    activity:{name:`servers`, type:`WATCHING`}
  })
})

bot.on("message", (message) => {
  if(message.author.type === "bot") return;

  let args = message.content.split(" ");
  let command = args[0];
  let cmd = CH.getCommand(command);

  if(!cmd) return;

  try{
      cmd.run(bot,message,args)
  }catch(e){
      console.log(e)
  }
});

// Set up for Heroku Hosting. Input Token Here If Not Using Heroku.
bot.login(process.env.BOT_TOKEN);
