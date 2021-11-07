const http = require('http');
const ical = require('ical-generator');

const hostname = '127.0.0.1';
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
    busystatus: ical.ICalEventBusyStatus.OOF,
    alarms : [10* 60]
  },
  {
    summary: 'Outdoor activity',
    days_of_the_week: [1, 2, 3, 4, 5], // 0 represents sunday
    reference: 'sunset',
    start_time: -2 * 60 * 60 * 1000,
    end_time: -0.5 * 60 * 60 * 1000,
    busystatus: ical.ICalEventBusyStatus.OOF
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

const server = http.createServer(async (req, res) => {
  let calendar = ical({ name: 'my first iCal' });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/calendar');
  for (const day of Array(days_in_future).keys()) {
    let date = new Date()
    date.setDate(date.getDate() + day)
    result = await getSunInfo(date);
    for (const event of events) {
      if (event.days_of_the_week.indexOf(date.getDay()) != -1) {
        //console.log(result['results']);
        reference_date = new Date(result['results'][event.reference]);
        let ical_event = {
          start: new Date(reference_date.getTime() + event.start_time),
          end: new Date(reference_date.getTime() + event.end_time),
          summary: event.summary
        }
        if (typeof event.busystatus !== 'undefined') ical_event.busystatus = event.busystatus
        let calendar_event = calendar.createEvent(ical_event);
        if (typeof event.alarms !== 'undefined')
        {
          for (const alarm of event.alarms) {
            calendar_event.createAlarm({type : ical.ICalAlarmType.audio,
              trigger: alarm})          
          }
        }

      }
    }
  }
  calendar.serve(res);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

async function getSunInfo(date) {
  return new Promise((resolve, reject) => {
    let date_string = date.toISOString().slice(0, 4 + 1 + 2 + 1 + 2);
    http.get(`http://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date_string}&formatted=0`, (res) => {
      data = ''
      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });
  })
}

// (async () => {
//   let events = []
//   for (const day of Array(days_in_future).keys()) {
//     let date = new Date()
//     date.setDate(date.getDate() + day)
//     result = await getSunInfo(date);
//     date = Date.parse(result['results']['sunrise'])
//     events.push(createEvent(date, 15, 'sunrise'))
//   }
//   ics.createEvents(events)
//   console.log(events);
// })();
