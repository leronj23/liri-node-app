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

// Run the Spotify API
function spotifyAPI() {

  inquirer.prompt([
    {
      type: "input",
      name: "song",
      message: "What's the song's name?"
    }
  ]).then(function (user) {

    var spotify = new Spotify(keys.spotify);
    spotify.search({ type: 'track', query: user.song, limit: 20 }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }

      if (data.tracks.items.length === 0){

        console.log("Artist:", "Ace of Base");
        console.log("Song Name:", "The Sign");
        console.log("Link:", "https://open.spotify.com/track/0hrBpAOgrt8RXigk83LLNE");
        console.log("Album:", "The Sign (US Album) [Remastered]");
      }

      data.tracks.items.forEach(element => {
        console.log("\n");
        
        console.log("Artist:", element.artists[0].name);
        console.log("Song Name:", element.name);
        console.log("Link:", element.external_urls.spotify);
        console.log("Album:", element.album.name);
      });


      //console.log(JSON.stringify(data, null, 2));
    })




    // axios.get("https://rest.bandsintown.com/artists/" + user.name + "/events?app_id=codingbootcamp").then(
    //   function (response) {

    //     response.data.forEach(element => {
    //       console.log("\n");

    //       console.log("Name of the venue:", element.venue.name);
    //       if (element.venue.region === "") {
    //         console.log("Venue location:", element.venue.city + ", " + element.venue.country);
    //       }
    //       else {
    //         console.log("Venue location:", element.venue.city + ", " + element.venue.region);
    //       }
    //       var date = moment(element.datetime).format('MM/DD/YYYY');
    //       console.log("Date of the Event:", date);
    //       console.log("=============================")
    //     });
    //   }
    // );
  })
    .catch(function (error) {
      console.log(error);
    });
}