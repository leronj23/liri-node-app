require('dotenv').config();
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require('moment');

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
    omdbAPI()
  }
  else if (user.choiceMade === "Do what I did last!") {

  }
});

// Run the Bands In Town API
function bandsInTownAPI() {

  inquirer.prompt([
    {
      type: "input",
      name: "band",
      message: "What's the band name?"
    }
  ]).then(function (user) {

    axios.get("https://rest.bandsintown.com/artists/" + user.band + "/events?app_id=codingbootcamp").then(
      function (response) {

        if (response.data.length === 0) {

          console.log("This band doesn't have any dates booked.");
          return
        }

        response.data.forEach(element => {
          console.log("\n");

          console.log("Name of the venue:", element.venue.name);
          if (element.venue.region === "") {
            console.log("Venue location:", element.venue.city + ", " + element.venue.country);
          }
          else {
            console.log("Venue location:", element.venue.city + ", " + element.venue.region);
          }
          var date = moment(element.datetime).format('MM/DD/YYYY');
          console.log("Date of the Event:", date);
          console.log("=============================")
        });
      }
    );
  })
    .catch(function (error) {
      console.log(error);
    });
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

    var spotify = new Spotify(keys.spotify);
    spotify.search({ type: 'track', query: song.name, limit: 20 }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }

      if (data.tracks.items.length === 0) {

        console.log("Artist:", "Ace of Base");
        console.log("Song Name:", "The Sign");
        console.log("Link:", "https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE");
        console.log("Album:", "The Sign (US Album) [Remastered]");

        return
      }

      data.tracks.items.forEach(element => {
        console.log("\n");

        console.log("Artist:", element.artists[0].name);
        console.log("Song Name:", element.name);
        console.log("Link:", element.external_urls.spotify);
        console.log("Album:", element.album.name);
        console.log("=============================")
      });
    })
  })
    .catch(function (error) {
      console.log(error);
    });
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

    axios.get(`http://www.omdbapi.com/?t=${movie.name}&y=&plot=short&apikey=trilogy`).then(
      function (response) {

        console.log("Title of the movie:", response.data.Title);
        console.log("Year the movie came out:", response.data.Year);
        console.log("IMDB Rating of the movie:", response.data.imdbRating);

        var rating = false;
        response.data.Ratings.forEach(element => {

          if (element.Source === 'Rotten Tomatoes') {

            rating = true;
            console.log("Rotten Tomatoes Rating of the movie:", element.Value);
          }
        })

        if(!rating){

          console.log("Rotten Tomatoes Rating of the movie:", "Not Available");
        }

        console.log("Country where the movie was produced:", response.data.Country);
        console.log("Language of the movie:", response.data.Language);
        console.log("Plot of the movie:", response.data.Plot);
        console.log("Actors in the movie:", response.data.Actors);

        //console.log(JSON.stringify(response.data, null, 2));
      }
    );
  })
    .catch(function (error) {
      console.log(error);
    });
}