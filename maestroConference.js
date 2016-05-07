"use strict";

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
    this.time = conferenceHourEst + ":" + conferenceMinutePst + " ET / " + conferenceHourPst + ":" + conferenceMinutePst + " PT";

    // parse signups count
    var persons = conferenceData.value.person;
    this.currentSignups = (typeof conferenceData.value.person === "undefined") ? 0: conferenceData.value.person.length;

    // set conference registration link
    this.registrationLink = "http://myaccount.maestroconference.com/conference/register/" + this.conferenceId;

    // set creation time
    this.creationTimeInSeconds = new Date().getTime() / 1000;
  }
}

module.exports = MaestroConference;
