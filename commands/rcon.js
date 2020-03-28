var discord = require("discord.js");
var rcon = require("rcon");
var mysql = require("mysql");
var sendRcon
var getMySQL

const rconServers = require('../util/serverscfg.json');
const sourcebansJson = require('../util/sourcebans.json');
const mysqlLogin = sourcebansJson.mysql
const sbDiscordtoName = sourcebansJson.users
const overrides = sourcebansJson.command_overrides
const flags = {
  // admin
  "a":0, // reserved
  "b":1, // generic
  "c":2, // kick
  "d":3, // ban
  "e":4, // unban
  "f":5, // slay
  "g":6, // change map
  "h":7, // convars
  "i":8, // configs
  "j":9, // chat
  "k":10, // vote
  "l":11, // password
  "m":12, // rcon
  "n":13, // cheats
  "z":14, // root
  // custom
  "o":15,
  "p":16,
  "q":17,
  "r":18,
  "s":19,
  "t":20
}

module.exports = class rcon {
  constructor(){
    this.name = "rcon",
    this.alias = ["console"],
    this.usage = "rcon/console server"
  }

  async run(bot, message, args) {
    // slice arguments so we don't get the server
    const fullargs = args.slice(2).join(" ");
    const user = sbDiscordtoName[`${message.author.id}`];
    const canRcon = await getMySQL(user, fullargs);
    console.log(canRcon)
    if (!canRcon) {
      return;
    }

    if (args[1] && args[2]) {
      // grab server from json
      var server = args[1];
      var ip;
      var port;
      var password;
      var servers = rconServers;
      var servera = servers[`${server}`];

      if (servera) {
        ip = servera.ip;
        port = servera.port;
        password = servera.password;
      }

      if (ip) {
        // message.channel.send("Sending `" + fullargs  + "` to " + server);
        sendRcon(ip, password, fullargs, port, message);
      }
      else {
        message.channel.send("Invalid server");
      }
    } else {
      var msg = "";
      var i = 0;
      const keys = Object.keys(rconServers);

      while(i < keys.length) {
          var server = keys[i];
          msg = msg + `\n${server}`;
          i++;
      }

      var embed = new discord.RichEmbed()
      .setTitle("RCON")
      .setDescription("Remotely run a command on servers.")
      .addField("**Usage**", "`??rcon server cmd`")
      .addField("**Valid Servers**", msg)
      .setColor('#8e44ad')
      message.channel.sendEmbed(embed);
    }
  }
}

// getMySQL
function getMySQL(user, cmd) {
  var canRcon = false;

  if (user) {
    var prefix = mysqlLogin.prefix;
    var db = mysql.createConnection({
      host: mysqlLogin.host,
      database: mysqlLogin.database,
      user: mysqlLogin.user,
      password: mysqlLogin.password,
      port: mysqlLogin.port
    })

    // connect to db and check if they have a group that can rcon
    db.connect(function(error) {
      if (error) {console.log(error); return};

      // grab group id of a user
      db.query(`SELECT gid FROM ${prefix}admins WHERE user = '${user}'`, function(error, response) {
        console.log(response)
          if (error) return;

          const gid = response[0].gid;
          if (!gid) return;

          // get flags for the group id
          db.query(`SELECT flags FROM ${prefix}groups WHERE gid = '${gid}'`, function(error, response) {
              if (error) return;
              console.log(flags.a)
              const userflags = response[0].flags;
              const flag = flags.m
              console.log(flag)
              const override = overrides[`${cmd}`]
              if (override) {
                flag = flags[`${override}`]
              }
              console.log(flag)
              console.log(userflags)
              canRcon = (userflags & flag) == flag; // check if user has flag in sourcebans
              console.log(canRcon)
          });
      });
    });
  }

  return new Promise((resolve) => {setTimeout(() => {resolve(canRcon)}, 1750)});
}

// sendRcon
// Example: sendRcon("localhost", "ModdagebeatsTitanTF", "status", "27018");
function sendRcon(ip, password, cmd, port, msg) {
  // test if values exist and are valid
  if (!ip || ip == "") return;
  if (!port || port == "") {port = 27015};
  if (!password || password == "") return;
  if (!cmd || cmd == "") return;

  // int port if it"s a string
  parseInt(port);

  var conn = new rcon(ip, port, password);
  conn.on("auth", function() { // authorization
      conn.send(cmd); // send our command
  }).on("response", function(response) { // response from server
      if (response != "") { // don"t print out RCON: for no reason
          if (msg) { // discord message
            const color = "#8e44ad"
            if (response.length >= 2048) {
              var responses = [response.substring(0, 2047), response.substring(2047, 4092)];
              var embed = new discord.RichEmbed()
              .setTitle("RCON Output")
              .setDescription(`\`\`\`css\n${responses[1]}\`\`\``)
              .setColor(color)
              var embed2 = new discord.RichEmbed()
              .setDescription(`\`\`\`css\n${responses[2]}\`\`\``)
              .setColor(color)
              msg.channel.sendEmbed(embed);
              msg.channel.sendEmbed(embed2);
            }
            else {
              var embed = new discord.RichEmbed()
              .setTitle("RCON Output")
              .setDescription(`\`\`\`css\n${response}\`\`\``)
              .setColor(color)
              msg.channel.sendEmbed(embed);
            }
          }
          // conn.disconnect();
      }
  });

  conn.connect();
}
