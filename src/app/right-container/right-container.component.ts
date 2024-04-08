import { Component } from '@angular/core';

import { faThumbsUp, faFaceFrown, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../Services/weather.service';


@Component({
  selector: 'app-right-container',
  templateUrl: './right-container.component.html',
  styleUrls: ['./right-container.component.css']
})
export class RightContainerComponent {

  constructor(public weatherService: WeatherService) {}

  faThumbsUp = faThumbsUp
  faFaceFrown = faFaceFrown
  faThumbsDown = faThumbsDown

  onTodayTabClick(){
    this.weatherService.todayTab = true
    this.weatherService.weekTab = false
  }

  onWeekTabClick(){
    this.weatherService.todayTab = false
    this.weatherService.weekTab = true
  }

  onCelsiusTabClick(){
    this.weatherService.celsiusTab = true
    this.weatherService.fahrenheitTab = false
  }

  onFahrenheitTabClick(){
    this.weatherService.celsiusTab = false
    this.weatherService.fahrenheitTab = true
  }
}
