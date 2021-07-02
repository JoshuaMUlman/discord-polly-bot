const Discord = require('discord.js'); //Install discord bot stuff

const client = new Discord.Client(); //Creating discord bot

const config = require('./config.json'); //Gets login token for channel

client.once('ready', () => { //When bot is turned online (aka whe bot is ready)
    console.log('Polly is online'); //Display message in console
});

const prefix = '-'; //Prefix to look for when message is sent

var optionArray = [];
var choiceArray = [];
var userArray = [];

client.on('message', message => { //When message is typed
    if(!message.content.startsWith(prefix) || message.author.bot) return; //If message doesn't start with - or if message was from the bot

    const args = message.content.slice(prefix.length).split(/ +/); //removes the - from the command the bot needs to read
    const command = args.shift().toLowerCase(); //sets message to lower case

    var delimiter = ",";
    var pollTitle;
    var shortenedString = message.content.slice(6,message.content.length); // removes polly & space
    var delimiterCounter = 0;
    const minDelimNum = 2;
    var lastDelimPos = 0;
    var valid;

    //For creating a poll
    if(command.toLowerCase() == "polly") {

        //Assume input is valid
        valid = true;

        //Clear Arrays as a new poll is being created
        optionArray.length = 0;
        choiceArray.length = 0;
        userArray.length = 0;

        //Parse input for poll title and choices and put into variable and array
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

        //Creation of parallel array for storing answers
        //Starts at 0 votes for each spot
        for(j=0; j < 5; j++) {
            choiceArray[j] = 0;
        }

        //Print error message if incorrect format
        if(delimiterCounter < minDelimNum){
            message.channel.send("Incorrect format! Please view https://github.com/JoshuaMUlman/discord-polly-bot for instructions!");
            valid = false;
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
        
        if(valid){
            //Send embed to discord
            message.channel.send(pollEmbed);    
        }
        else{
            //Clear optionArray of junk data
            optionArray.length = 0;
        }
    }

    //For collecting answers
    if(command.toLowerCase() == "vote") {
        shortenedString = message.content.slice(6,message.content.length); //removes command (answer)
    
        //check if user has already voted
        var userFound = false;
        for(i=0; i < userArray.length; i++){
            if(userArray[i] == message.author.id){
                userFound = true;
                break;
            }
        }

        var vote = parseInt(shortenedString);

        //If user has not voted yet and vote is an integer and vote is in range of options
        if(!userFound && Number.isInteger(vote) && vote <= optionArray.length){
            //Add vote
            choiceArray[parseInt(shortenedString) - 1]++;
            //Add voted user to array of users that already voted
            userArray.push(message.author.id);
        }
        //If a poll hasn't been created
        else if(optionArray.length == 0){
            message.channel.send("A poll must be created before voting!");
        }
        //If vote is not a number
        else if(!Number.isInteger(vote)){
            message.channel.send("Vote must be a number!");
        }
        //If vote is not in range
        else if(!(vote <= optionArray.length)){
            message.channel.send("Vote must be in range of available options!");
        }
        //If user already voted
        else if(userFound){
            message.channel.send("Error: You've already voted!")
        }
        else{
            message.channel.send("Error: Unknown error!")
        }
    }

        //For displaying results
        if(command.toLowerCase() == "results") {

            //Creation of embed
            const resultsEmbed = new Discord.MessageEmbed()
	        .setColor('#0099ff')
	        .setTitle("Results")
	        .setTimestamp()
            
            //Collect highest vote value found
            var highestVoteCount = 0;
            for(i=0; i < choiceArray.length; i++){
                if(choiceArray[i] > highestVoteCount){
                    highestVoteCount = choiceArray[i];
                }
            }

            //Choice text for creation of a bar graph and default value
            var graphString = "[]";
            //Determines when to change text for bar graph
            const voteLimit1 = 10;
            const voteLimit2 = 40;
            const voteLimit3 = 88;
            if(highestVoteCount > voteLimit3){
                message.channel.send("Error: Too many votes for one option for graph to format correctly!");
            }
            else if(highestVoteCount > voteLimit2){
                graphString = ")";
            }
            else if(highestVoteCount > voteLimit1){
                graphString = "[]";
            }
            else{
                graphString = "[][][]  ";
            }
            //Stores string of graph for visual output
            var graphBar;

            //Generate bar graph text and add to embed
            for(i=0; i < optionArray.length; i++){
                if(choiceArray[i] > 0){
                    graphBar = graphString.repeat(choiceArray[i]);
                }
                else {
                    graphBar = "";
                }
                //Add choice fields to embed
                resultsEmbed.addField(optionArray[i] + ": " + choiceArray[i] + " votes", "|" + graphBar, false);
            }

            
            //If a poll hasn't been created
            if(optionArray.length == 0){
                message.channel.send("A poll must be created before voting!");
            }
            else{
                //Send embed to discord
                message.channel.send(resultsEmbed);
            }

        }

});

client.login(config.token);