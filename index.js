var express = require('express');
var requestModule = require("request");
var MaestroConference = require("./maestroConference");
var async = require("async");

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


var getConferenceData = function (conferenceId, callback) {
  console.log('calling getConferenceData for: ' + conferenceId);
  requestModule(
    {
      method: 'GET',
      uri: process.env.MAESTRO_API_URL + '/getConferenceData',
      json: true,
      qs: {
        type: 'json',
        customer: process.env.MAESTRO_CUSTOMER_UID,
        key: process.env.MAESTRO_SECURITY_TOKEN,
        conferenceUID: conferenceId
      }
    },
    function (maestroError, maestroResponse, maestroBody) {
      var responseData;
      if (!maestroError && maestroResponse.statusCode == 200 && maestroBody.code == 0) {
        responseData = maestroBody;
      } else {
        var errorMessage = 'error: ' + maestroResponse.statusCode + " " + JSON.stringify(maestroResponse.body);
        console.log(errorMessage);
        responseData = null;
      }

      callback(responseData);
    })
};

var getUpcomingConferences = function (nameContains, callback) {
  console.log('calling getUpcomingConferences, nameContains: ' + nameContains);
  requestModule(
    {
      method: 'GET',
      uri: process.env.MAESTRO_API_URL + '/getUpcomingConference',
      json: true,
      qs: {
        type: 'json',
        customer: process.env.MAESTRO_CUSTOMER_UID,
        key: process.env.MAESTRO_SECURITY_TOKEN
      }
    },
    function (maestroError, maestroResponse, maestroBody) {
      var responseData;
      if (!maestroError && maestroResponse.statusCode == 200 && maestroBody.code == 0) {
        var upcomingConferenceIds = [];
        console.log('getUpcomingConferences successful');
        maestroBody.value.conference.forEach(function(entry) {
          if (entry.name.includes(nameContains)) {
            upcomingConferenceIds.push(entry.UID);
          }
        });

        responseData = upcomingConferenceIds;
      } else {
        var errorMessage = 'error: ' + maestroResponse.statusCode + " " + JSON.stringify(maestroResponse.body);
        console.log(errorMessage);
        responseData = null;
      }

      callback(responseData);
    })
};

// get upcoming conferences REST call
// path/maestro/upcomingConferences
// Usage:
//   nameContains : filter for conferences that contain value of "nameContains"
app.get('/maestro/upcomingConferences', function(request, response) {
    var nameContains = (typeof request.query.nameContains === "undefined") ? "": unescape(request.query.nameContains);
    console.log('nameContains: ' + nameContains);

    var upcomingConferences = {
      conferences : []
    };

    var upcomingConferenceIds = getUpcomingConferences(nameContains, function (upcomingConferenceIds) {
      // todo: check upcoming conferences for null
      async.each(
        upcomingConferenceIds,
        function(upcomingConferenceId, callback) {
          console.log("getting data for: " + upcomingConferenceId)
          getConferenceData(upcomingConferenceId, function (conferenceData) {
            var newMaestroConference = new MaestroConference(conferenceData);
            console.log("created new conference data for: " + newMaestroConference.conferenceId);
            upcomingConferences.conferences.push(newMaestroConference);
            callback();
          });
        },
        function(err) {
          response.send(upcomingConferences);
        }
      );
    });
});
