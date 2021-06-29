const Discord = require('discord.js'); //Install discord bot stuff

const client = new Discord.Client(); //Creating discord bot

const config = require('./config.json'); //Gets login token for channel

client.once('ready', () => { //When bot is turned online (aka whe bot is ready)
    console.log('Polly is online'); //Display message in console
});

const prefix = '-'; //Prefix to look for when message is sent

client.on('message', message => { //When message is typed
    if(!message.content.startsWith(prefix) || message.author.bot) return; //If message doesn't start with - or if message was from the bot

    const args = message.content.slice(prefix.length).split(/ +/); //removes the - from the command the bot needs to read
    const command = args.shift().toLowerCase(); //sets message to lower case

    var delimiter = ",";
    var pollTitle;
    var optionArray = [];

    var shortenedString = message.content.slice(6,message.content.length); // removes polly & space
    var delimiterCounter = 0;
    const minDelimNum = 2;
    var lastDelimPos = 0;

    if(command.toLowerCase() == "polly") {

        for(i=0; i < shortenedString.length; i++) {
            if(shortenedString.charAt(i) == delimiter){
                delimiterCounter++;
                //Title
                if(delimiterCounter == 1){
                    pollTitle = shortenedString.slice(lastDelimPos + 1,i);
                    lastDelimPos = i;
                    
                    
                } else if(delimiterCounter > 1) { //For every comma after 1, add an option
                    optionArray.push(shortenedString.slice(lastDelimPos + 2,i));
                    lastDelimPos = i;
                }
            } 
        }
        //final option has no delimiter
        optionArray.push(shortenedString.slice(lastDelimPos + 2,shortenedString.length));
    }

    //Creation of embed
    const pollEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(pollTitle)
	.setTimestamp()
    
    //Add choice fields to embed
    for(i=0; i < optionArray.length; i++){
        pollEmbed.addField("Option: " + (i+1), optionArray[i], false);
    }

    //Send embed to discord
    message.channel.send(pollEmbed);


    if(delimiterCounter < minDelimNum){
        errorMessage();
    }

});

function errorMessage(){
    message.channel.send("Incorrect format! Please use -help for instructions!");
}

client.login(config.token);