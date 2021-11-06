const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
const days_in_future = 14


const ics = require('ics')

const events = [
    {
      title: 'Lunch',
      start: [2021, 11, 5, 12, 15],
      duration: { minutes: 45 }
    },
    {
      title: 'Dinner',
      start: [2021, 11, 6, 12, 15],
      duration: { hours: 1, minutes: 30 }
    }
  ]

let now = new Date()
let date_string = now.toISOString().slice(0,4+1+2+1+2);
console.log(date_string);

http.get(`http://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=${date_string}`, (res) => {
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
})

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/calendar');
  let plain_events = ics.createEvents(events)
  res.end(plain_events.value);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
