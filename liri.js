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

function spotifyAPI() {

  inquirer.prompt([
    {
      type: "input",
      name: "song",
      message: "What's the song's name?"
    }
  ]).then(function (user) {

    var spotify = new Spotify(keys.spotify);
    spotify.search({ type: 'track', query: user.song }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }

      console.log(JSON.stringify(data, null, 2));
    })




    axios.get("https://rest.bandsintown.com/artists/" + user.name + "/events?app_id=codingbootcamp").then(
      function (response) {

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