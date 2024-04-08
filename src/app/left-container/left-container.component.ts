import { Component, OnInit } from '@angular/core';

import { faMagnifyingGlass, faLocation, faCloud, faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../Services/weather.service';

import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { LocationDetails } from '../Models/LocationDetails';
import { WeatherDetails } from '../Models/WeatherDetails';

@Component({
  selector: 'app-left-container',
  templateUrl: './left-container.component.html',
  styleUrls: ['./left-container.component.css']
})
export class LeftContainerComponent implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass
  faLocation = faLocation
  faCloud = faCloud
  faCloudRain = faCloudRain

  private subscription: Subscription;

  constructor(public weatherService: WeatherService) { }

  ngOnInit(): void {
    this.subscription = interval(10000 * 60)
      .pipe(
        switchMap(() => this.weatherService.getLocationDetails(this.weatherService.cityName, this.weatherService.language)), // Call the first API
        switchMap((locationDetails: LocationDetails) => {
          this.weatherService.locationDetails = locationDetails;
          const latitude = this.weatherService.locationDetails?.location.latitude[0];
          const longitude = this.weatherService.locationDetails?.location.longitude[0];
          return this.weatherService.getWeatherReport(this.weatherService.date, latitude, longitude, this.weatherService.language, this.weatherService.units); // Call the second API
        })
      )
      .subscribe((weatherDetails: WeatherDetails) => {
        this.weatherService.weatherDetails = weatherDetails;
        this.weatherService.resetData();
        this.weatherService.prepareData();
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearchClick(location: string){
    this.weatherService.cityName = location;
    this.weatherService.getData();
  }
}
