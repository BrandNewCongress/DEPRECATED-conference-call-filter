"use strict";

var monthNames = ["Invalid", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

var MaestroConference = class {
  constructor(conferenceData) {
    // parse conference Id
    this.conferenceId = conferenceData.value.UID;

    // parse name
    this.name = conferenceData.value.name;

    // parse date
    var conferenceDateTimeParts = conferenceData.value.scheduledStartTime.split(' ');
    this.date = conferenceDateTimeParts[0] + ", " + conferenceDateTimeParts[1] + " " + parseInt(conferenceDateTimeParts[2]) + ", " + conferenceDateTimeParts[5];

    // parse time
    var conferenceTimeParts = conferenceDateTimeParts[3].split(':');
    var conferenceHourPst = parseInt(conferenceTimeParts[0]);
    var conferenceHourEst = conferenceHourPst + 3;
    var conferenceMinutePst = conferenceTimeParts[1];
    this.time = from24hourFormatTo12hourFormat(conferenceHourEst) + ":" + conferenceMinutePst + getPeriodFrom24hour(conferenceHourEst) + " ET / " + from24hourFormatTo12hourFormat(conferenceHourPst) + ":" + conferenceMinutePst + getPeriodFrom24hour(conferenceHourPst) + " PT";

    // parse signups count
    var participantsCount = 0;
    var persons = conferenceData.value.person;
    if (typeof persons !== "undefined") {
      persons.forEach(function(person) {
        if (person.role == "PARTICIPANT") {
          participantsCount++;
        }
      });
    }

    this.currentSignups = participantsCount;

    // set conference registration link
    this.registrationLink = "http://myaccount.maestroconference.com/conference/register/" + this.conferenceId;

    // set creation time
    this.creationTimeInSeconds = new Date().getTime() / 1000;

    // set js datetime
    var monthNum = monthNames.indexOf(conferenceDateTimeParts[1]);
    var monthDate = parseInt(conferenceDateTimeParts[2]);
    var year = parseInt(conferenceDateTimeParts[5]);
    var hour = conferenceHourPst;
    var minute = parseInt(conferenceMinutePst);
    this.timeInSeconds = new Date(year, monthNum, monthDate, hour, minute, 0, 0).getTime() / 1000;
  }
}

function from24hourFormatTo12hourFormat(hour) {
    var h = hour;
    if (h >= 12) {
        h = hour-12;
    }
    if (h == 0) {
        h = 12;
    }

    return h;
}

function getPeriodFrom24hour(hour) {
    var dd = "am";
    if (hour >= 12) {
        dd = "pm";
    }

    return dd;
}

module.exports = MaestroConference;
