import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { compressToEncodedURIComponent } from "lz-string";

@Component({
  selector: 'app-url-generator',
  templateUrl: './url-generator.component.html',
  styleUrls: ['./url-generator.component.css']
})
export class UrlGeneratorComponent implements OnInit {

  time_references: string[] = ["dawn", "dusk", "goldenHour", "goldenHourEnd", "nadir",
    "nauticalDawn", "nauticalDusk", "night", "nightEnd", "solarNoon",
    "sunrise", "sunriseEnd", "sunset", "sunsetStart"];

  days_of_week: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  form_group: FormGroup = new FormGroup({})
  //input
  days_in_future = 14
  latitude = 41.43
  longitude = 2.01
  events = [
    {
      summary: 'Golden hour',
      days_of_the_week: [0, 1, 2, 3, 4, 5, 6], // 0 represents sunday
      reference: 'sunset',
      start_time: -1 * 60 * 60 * 1000,
      end_time: 0,
    }
  ]

  constructor(private form_builder: FormBuilder) { }

  ngOnInit(): void {
    const event_form = this.form_builder.array([])

    this.form_group = this.form_builder.group({
      latitude: [41.43, [Validators.min(-90),
      Validators.max(90)]],
      longitude: [2.01, [Validators.min(-90),
      Validators.max(90)]],
      events: event_form
    })
  }

  get events_form(): FormArray {
    return this.form_group.get('events') as FormArray
  }

  get_recurrence_form(i : number) : FormArray
  {
    return this.events_form.at(i).get('recurrence_form') as FormArray
  }

  addEvent() {

    const time_from = this.form_builder.group({
      before: 'before',
      hour: 1,
      minute: 0,
    });

    let array = []

    for (const i of this.days_of_week) {
      array.push(true);
    }    

    const recurrence_form = this.form_builder.array(array)



    const event = this.form_builder.group({
      summary: 'Golden hour',
      recurrence_form: recurrence_form, // 0 represents sunday
      reference: 'sunset',
      start_time: time_from,
      end_time: time_from,
    })

    this.events_form.push(event)
  }

  deleteEvent(i: number) {
    this.events_form.removeAt(i);
  }

  get encodedUrl() {

    let encoded = compressToEncodedURIComponent(JSON.stringify(
      {
        days_in_future: this.days_in_future,
        latitude: this.form_group.value.latitude,
        longitude: this.form_group.value.longitude,
        events: this.form_group.controls.events.value,
      }
    ))
    //console.log(encoded);
    const hostname = '0.0.0.0';
    const port = 3000;
    //console.log(`Server running at http://${hostname}:${port}?calendar=${encoded}`);
    return encoded

  }
}