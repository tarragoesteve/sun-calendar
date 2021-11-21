const http = require('http');
const express = require('express')
const ical = require('ical-generator');
var suncalc = require('suncalc');
app = express()

const hostname = '0.0.0.0';
const port = 3000;
const days_in_future = 14
const latitude = 41.43
const longitude = 2.01
const events = [
  {
    summary: 'Travel to work',
    days_of_the_week: [1, 2, 3, 4, 5], // 0 represents sunday
    reference: 'sunset',
    start_time: -11 * 60 * 60 * 1000 - 20 * 60 * 1000,
    end_time: -11 * 60 * 60 * 1000,
    busystatus: "OOF",
    alarms : [10* 60]
  },
  {
    summary: 'Outdoor activity',
    days_of_the_week: [1, 2, 3, 4, 5], // 0 represents sunday
    reference: 'sunset',
    start_time: -2 * 60 * 60 * 1000,
    end_time: -0.5 * 60 * 60 * 1000,
    busystatus: "OOF"
  },/*
  {
    summary: 'Dinner',
    days_of_the_week: [0, 1, 2, 3, 4], // 0 represents sunday
    reference: 'sunset',
    start_time: 2.5 * 60 * 60 * 1000,
    end_time: 3.5 * 60 * 60 * 1000,
  }, {
    summary: 'Sleep',
    days_of_the_week: [0, 1, 2, 3, 4], // 0 represents sunday
    reference: 'sunset',
    start_time: 4.5 * 60 * 60 * 1000 - 5 * 60 * 1000,
    end_time: 4.5 * 60 * 60 * 1000 ,
  },*/
]



const ics = require('ics')
app = express()

app.get('*', function (req, res) {
  console.log(req.params);
  let calendar = ical({ name: 'my first iCal' });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/calendar');
  for (const day of Array(days_in_future).keys()) {
    let date = new Date()
    date.setDate(date.getDate() + day)
    result = suncalc.getTimes(date, latitude, longitude);
    for (const event of events) {
      if (event.days_of_the_week.indexOf(date.getDay()) != -1) {
        reference_date = result[event.reference];
        let ical_event = {
          start: new Date(reference_date.getTime() + event.start_time),
          end: new Date(reference_date.getTime() + event.end_time),
          summary: event.summary
        }
        if (typeof event.busystatus !== 'undefined') {
          ical_event.busystatus = event.busystatus
        }
        let calendar_event = calendar.createEvent(ical_event);
        if (typeof event.alarms !== 'undefined') {
          for (const alarm of event.alarms) {
            calendar_event.createAlarm({
              type: ical.ICalAlarmType.audio,
              trigger: alarm
            })
          }
        }
      }
    }
  }
  calendar.serve(res);
})

app.listen(port)

console.log(JSON.stringify(
  {
    days_in_future : days_in_future,
    latitude : latitude,
    longitude : longitude,
    events : events,
  }
)); 

console.log(`Server running at http://${hostname}:${port}/calendar=%7B%22days_in_future%22%3A14%2C%22latitude%22%3A41.43%2C%22longitude%22%3A2.01%2C%22events%22%3A%5B%7B%22summary%22%3A%22Travel%20to%20work%22%2C%22days_of_the_week%22%3A%5B1%2C2%2C3%2C4%2C5%5D%2C%22reference%22%3A%22sunset%22%2C%22start_time%22%3A-40800000%2C%22end_time%22%3A-39600000%2C%22busystatus%22%3A%22OOF%22%2C%22alarms%22%3A%5B600%5D%7D%2C%7B%22summary%22%3A%22Outdoor%20activity%22%2C%22days_of_the_week%22%3A%5B1%2C2%2C3%2C4%2C5%5D%2C%22reference%22%3A%22sunset%22%2C%22start_time%22%3A-7200000%2C%22end_time%22%3A-1800000%2C%22busystatus%22%3A%22OOF%22%7D%5D%7D`);
