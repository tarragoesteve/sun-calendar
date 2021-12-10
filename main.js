//dependencies
const express = require('express')
const ical = require('ical-generator');
const suncalc = require('suncalc');
const lzstring = require('lz-string')
//constants
app = express()
const hostname = '0.0.0.0';
const port = 3000;
//input
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

app.get('*', function (req, res) {
  console.log(req.query);
  let input = JSON.parse(lzstring.decompressFromEncodedURIComponent(req.query.calendar))
  console.log(input);
  let calendar = ical({ name: 'My sun calendar' });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/calendar');
  for (const day of Array(input['days_in_future']).keys()) {
    let date = new Date()
    date.setDate(date.getDate() + day)
    result = suncalc.getTimes(date, latitude, longitude);
    for (const event of input['events']) {
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





let encoded = lzstring.compressToEncodedURIComponent(JSON.stringify(
  {
    days_in_future : days_in_future,
    latitude : latitude,
    longitude : longitude,
    events : events,
  }
))
//console.log(encoded);
//let input = JSON.parse(lzstring.decompressFromEncodedURIComponent(encoded));

console.log(`Server running at http://${hostname}:${port}?calendar=${encoded}`);
