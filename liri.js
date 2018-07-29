require("dotenv").config();
var keys = require("./keys");
var request = require("request");
const fs = require("fs");
var inquirer = require("inquirer");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');

var s = keys.spotify;
var t = keys.twitter;
var omdb = keys.omdb;

var divider = (`\n----------------------------------------------------------\n\n`);

inquirer
    .prompt([
        {
            type: "input",
            message: "What topic would you like LIRI to search?",
            name: "command"
        }
    ])
    .then(function (response) {
        var userCommand = response.command;
        if (userCommand === 'my-tweets') {
            myTweets(userCommand);
        } else if (userCommand === 'do-what-it-says') {
            logger(`Command: ${userCommand}`);
            fs.readFile("random.txt", "utf8", function (error, data) {
                if (error) {
                    return console.log(error);
                }
                var fileArray = data.split(',');
                command = fileArray[0];
                input = fileArray[1];
                if (command === "spotify-this-song") {
                    logger(`Command: ${command}`);
                    spotifySearch(input);
                } else if (command === "movie-this") {
                    orders(command, input);
                } else {
                    myTweets(command);
                }
            })
        } else {
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "Enter the search title: ",
                        name: "item"
                    }
                ])
                .then(function (res) {
                    var input = res.item;
                    orders(userCommand, input);
                })
        }
    })

function myTweets(command) {
    logger(`Command: ${command}`);
    var client = new Twitter({
        consumer_key: t.consumer_key,
        consumer_secret: t.consumer_secret,
        access_token_key: t.access_token_key,
        access_token_secret: t.access_token_secret
    });

    var params = {
        screen_name: 'nodejs',
        count: 21
    };

    try {
        client.get('favorites/list', params, function (error, tweets, response) {
            if (!error && response.statusCode === 200) {
                tweets.forEach(function (element) {
                    console.log('  * Created at: ', element.created_at);
                    console.log(`  * Tweeted: ${element.text}\n\n`);
                    console.log(divider);
                    logger(`  * Created at: ${element.created_at}`);
                    logger(`  * Tweeted: ${element.text}`);
                })
            } else {
                throw error;
            }
        });
    } catch (e) {
        console.log(e);
    }
}

function orders(command, input) {
    switch (command) {
        case "spotify-this-song": {
            logger(`Command: ${command}`);
            if (!input || input.trim() === '') {
                input = "The Sign";
            }
            spotifySearch(input);
            break;
        }
        case "movie-this": {
            logger(`Command: ${command}`);
            logger(`Movie: ${input}`);
            if (!input || input.trim() === "") {
                input = "Mr. Nobody";
            }
            var queryURL = "https://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=" + omdb.id;

            try {
                request(queryURL, function (error, response, body) {
                    var b = JSON.parse(body);
                    console.log(divider);
                    if (error || b.Response === "False") {
                        console.log(`Aw snap!  We cannot locate your movie.  Please try again...`);
                        logger(`Aw snap!  We cannot locate your movie.  Please try again...`);
                    } else if (b.Response === "True") {
                        console.log('  * Title of the movie: ', b.Title);
                        console.log('  * Year the movie came out: ', b.Year);
                        console.log('  * IMDB Rating of the movie: ', b.imdbRating);

                        var rottenTomatoesRating = 'N/A';
                        b.Ratings.forEach(function (element) {
                            if (element.Source === 'Rotten Tomatoes') {
                                rottenTomatoesRating = element.Value;
                            }
                        })
                        console.log('  * Rotten Tomatoes Rating of the movie: ', rottenTomatoesRating);
                        console.log('  * Country where the movie was produced: ', b.Country);
                        console.log('  * Language of the movie: ', b.Language);
                        console.log('  * Plot of the movie: ', b.Plot);
                        console.log('  * Actors in the movie: ', b.Actors);

                        logger(`  * Rotten Tomatoes Rating of the movie: ${rottenTomatoesRating}`);
                        logger(`  * Country where the movie was produced: ${b.Country}`);
                        logger(`  * Language of the movie: ${b.Language}`);
                        logger(`  * Plot of the movie: ${b.Plot}`);
                        logger(`  * Actors in the movie: ${b.Actors}`);
                    } else {
                        console.log(`Aw snap!  We cannot locate your movie.  Please try again...`);
                        logger(`Aw snap!  We cannot locate your movie.  Please try again...`);
                    }
                    console.log(divider);
                });
            } catch (e) {
                console.log(e);
                logger(`${e}`);
            }
            break;
        }
        default: {
            console.log('Please choose from one of the following commands: my-tweets, do-what-it-says, spotify-this-song, or movie-this.');
            logger(`Command: ${command}`);
            logger(`Please choose from one of the following commands: my-tweets, do-what-it-says, spotify-this-song, or movie-this.`);
        }
    }
}

function spotifySearch(song) {
    logger(`${song}`);
    var spotify = new Spotify({
        id: s.id,
        secret: s.secret
    });

    console.log(`\n****************************\nSpotify! Search this => ${song}`);
    logger(`\n****************************\nSpotify! Search this => ${song}`);

    spotify.search({ type: 'track', query: song, limit: 10 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var info = data.tracks.items;
        if (info.length === 0) {
            console.log('Oops!  Spotify cannot find your song.  Please try again.');
            logger(`Oops!  Spotify cannot find your song.  Please try again.`);
        } else {
            console.log(`Spotify found ${info.length} ${info.length === 1 ? 'search result.' : 'search results.'}\n****************************\n`);
            logger(`Spotify found ${info.length} ${info.length === 1 ? 'search result.' : 'search results.'}\n****************************`);
            info.forEach(function (item) {
                console.log('Artists: ', item.album.artists[0].name);
                console.log('Album name: ', item.album.name);
                console.log('Song name: ', item.name);
                console.log('Preview link: ', item.preview_url);
                console.log(divider);
                logger(`Artists: ${item.album.artists[0].name}`);
                logger(`Album name: ${item.album.name}`);
                logger(`Song name: ${item.name}`);
                logger(`Preview link: ${item.preview_url}`);
            })
        }
    });
}

function logger(line) {
    var dateTimeStamp = new Date().toGMTString();  // date time stamp in GMT
    try {
        fs.appendFileSync('log.txt', `${dateTimeStamp}: ${line}\n`);
    } catch (err) {
        console.log(err);
    }
}
