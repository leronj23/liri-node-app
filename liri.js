require('dotenv').config();
var inquirer = require('inquirer');
var axios = require('axios');
var moment = require('moment');
var fs = require('fs');

var Spotify = require('node-spotify-api');

var keys = require('./keys.js');

inquirer.prompt([
  {
    type: "list",
    name: "choiceMade",
    message: "What would you like to do?",
    choices: ["Get band info from Bands in Town?", "Find a song on Spotify?", "Look up a movie?", "Do what I did last!"]
  },

]).then(function (user) {

  // If the user guesses the password...
  if (user.choiceMade === "Get band info from Bands in Town?") {
    bandsInTownAPI();
  }
  else if (user.choiceMade === "Find a song on Spotify?") {
    spotifyAPI();
  }
  else if (user.choiceMade === "Look up a movie?") {
    omdbAPI();
  }
  else if (user.choiceMade === "Do what I did last!") {
    didLast();
  }
});

// Run the Bands In Town API
function bandsInTownAPI() {

  inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What's the band name?"
    }
  ]).then(function (band) {

    sendBandInTownAPI(band.name)
  })
    .catch(function (error) {
      console.log("error:", error);
    });
}

function sendBandInTownAPI(band) {

  if (band != "") {

    axios.get("https://rest.bandsintown.com/artists/" + band + "/events?app_id=codingbootcamp").then(
      function (response) {

        if (response.data.length === 0) {

          console.log("This band doesn't have any dates booked.");
          console.log("=============================")
          return
        }

        var locationString;
        response.data.forEach(element => {
          console.log("\n");

          console.log("Name of the venue:", element.venue.name);
          if (element.venue.region === "") {
            console.log("Venue location:", element.venue.city + ", " + element.venue.country);
            locationString = `Venue location: ${element.venue.city}, ${element.venue.country}`;
          }
          else {
            console.log("Venue location:", element.venue.city + ", " + element.venue.region);
            locationString = `Venue location: ${element.venue.city}, ${element.venue.region}`;
          }
          var date = moment(element.datetime).format('MM/DD/YYYY');
          console.log("Date of the Event:", date);
          console.log("=============================")

          writeToLogFile(
            `\n
              Name of the venue: ${element.venue.name}\n
              ${locationString}\n
              Date of the Event: ${date}\n
              =============================`
          );
        });

        writeToRandomFile(`concert-this,${band}`)
      }
    ).catch((error) => {
      console.log("The artist was not found")
    });
  }
  else {
    console.log("Enter a band's name.");
    console.log("=============================")
  }
}


// Run the Spotify API
function spotifyAPI() {

  inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What's the song's name?"
    }
  ]).then(function (song) {

    sendSpotifyAPI(song.name)
  })
    .catch(function (error) {
      console.log(error);
    });
}

function sendSpotifyAPI(song) {

  if (song != "") {

    var spotify = new Spotify(keys.spotify);
    spotify.search({ type: 'track', query: song, limit: 20 }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }

      if (data.tracks.items.length === 0) {
        console.log("\n");
        console.log("Artist:", "Ace of Base");
        console.log("Song Name:", "The Sign");
        console.log("Link:", "https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE");
        console.log("Album:", "The Sign (US Album) [Remastered]");
        console.log("=============================")

        writeToLogFile(
          `\n
          Artist: Ace of Base\n
          Song Name: The Sign\n
          Link: https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE\n
          Album: The Sign (US Album) [Remastered]\n
          =============================`
        );

        return
      }

      data.tracks.items.forEach(element => {
        console.log("\n");

        console.log("Artist:", element.artists[0].name);
        console.log("Song Name:", element.name);
        console.log("Link:", element.external_urls.spotify);
        console.log("Album:", element.album.name);
        console.log("=============================")

        writeToLogFile(
          `\n
          Artist: ${element.artists[0].name}\n
          Song Name: ${element.name}\n
          Link: ${element.external_urls.spotify}\n
          Album: ${element.album.name}\n
          =============================`
        );
      });

      writeToRandomFile(`spotify-this-song,${song}`)
    })
  }
  else {
    console.log("Enter a song name.");
    console.log("=============================")
  }
}


// Run the OMDB API
function omdbAPI() {

  inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What's the song's name?"
    }
  ]).then(function (movie) {

    sendOmdbAPI(movie.name)
  })
    .catch(function (error) {
      console.log(error);
    });
}

function sendOmdbAPI(movie) {

  if (movie != "") {

    axios.get(`http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`).then(
      function (response) {

        if (response.data.Response === 'False') {
          console.log("\n");
          console.log("If you haven't watched \"Mr. Nobody\", then you should: http://www.imdb.com/title/tt0485947/");
          console.log("It's on Netflix!");

          writeToLogFile(
            `\n
            If you haven't watched \"Mr. Nobody\", then you should: http://www.imdb.com/title/tt0485947/\n
            It's on Netflix!\n
            =============================`
          );

          return
        }
        console.log("\n");
        console.log("Title of the movie:", response.data.Title);
        console.log("Year the movie came out:", response.data.Year);
        console.log("IMDB Rating of the movie:", response.data.imdbRating);

        var rating = false;
        var ratingString;
        response.data.Ratings.forEach(element => {

          if (element.Source === 'Rotten Tomatoes') {

            rating = true;
            console.log("Rotten Tomatoes Rating of the movie:", element.Value);
            ratingString = `Rotten Tomatoes Rating of the movie: ${element.Value}`;
          }
        })

        if (!rating) {

          console.log("Rotten Tomatoes Rating of the movie:", "Not Available");
          ratingString = "Rotten Tomatoes Rating of the movie: Not Available";
        }

        console.log("Country where the movie was produced:", response.data.Country);
        console.log("Language of the movie:", response.data.Language);
        console.log("Plot of the movie:", response.data.Plot);
        console.log("Actors in the movie:", response.data.Actors);
        console.log("=============================")

        writeToRandomFile(`movie-this,${movie}`)

        writeToLogFile(
          `\n
          Title of the movie: ${response.data.Title}\n
          Year the movie came out: ${response.data.Year}\n
          IMDB Rating of the movie: ${response.data.imdbRating}\n
          ${ratingString}\n
          Country where the movie was produced: ${response.data.Country}\n
          Language of the movie: ${response.data.Language}\n
          Plot of the movie: ${response.data.Plot}\n
          Actors in the movie: ${response.data.Actors}\n
          =============================`
        );
      }
    );
  }
  else {
    console.log("Enter a movie name.");
    console.log("=============================")
  }
}



// Run What I did last
function didLast() {

  fs.readFile('random.txt', 'utf8', function (err, data) {

    var dataRecived = data.split(",");

    console.log(dataRecived)

    if (dataRecived[0] === 'concert-this') {
      sendBandInTownAPI(dataRecived[1])
    }

    if (dataRecived[0] === 'spotify-this-song') {
      sendSpotifyAPI(dataRecived[1])
    }

    if (dataRecived[0] === 'movie-this') {
      sendOmdbAPI(dataRecived[1])
    }
  });
}

// Write previous selections to the random.txt file
function writeToRandomFile(selected) {

  fs.writeFile("random.txt", selected, function (err) {
    if (err) {
      return console.log(err);
    }
  });
}

// Append to the log.txt file
function writeToLogFile(log) {

  fs.appendFile('log.txt', log, function (err) {
    if (err) throw err;
  });
}