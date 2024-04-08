import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WeatherDetails } from '../Models/WeatherDetails';
import { LocationDetails } from '../Models/LocationDetails';
import { TemperatureData } from '../Models/TemperatureData';
import { TodayData } from '../Models/TodayData';
import { WeekData } from '../Models/WeekData';
import { TodaysHighlight } from '../Models/TodaysHighlight';
import { Observable } from 'rxjs';
import { EnvironmentalVariables } from '../Environment/EnvironmentVariables';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  cityName: string = 'Pune'
  language: string = 'en-US'
  date: string = '20200622'
  units: string = 'm';
  currentTime: Date;

  todayTab: boolean = false
  weekTab: boolean = true

  celsiusTab: boolean = true
  fahrenheitTab: boolean = false
  
  weatherDetails?: WeatherDetails
  locationDetails?: LocationDetails

  temperatureData: TemperatureData
  todayData: TodayData[]
  weekData: WeekData[]
  todayHighlight: TodaysHighlight

  constructor(private httpClient: HttpClient) {
    this.getData()
  }

  getSummaryImage(summary: string): string{

    let baseAddress = 'assets/'

    let cloudySunny = 'cloudyandsunny.png';
    let rainSunny = 'rainyandsunny.png';
    let windy = 'windy.png';
    let sunny = 'sun.png';
    let rainy = 'rainy.png';

    if(String(summary).includes("Partly Cloudy") || String(summary).includes("P Cloudy")) return baseAddress + cloudySunny;
    else if(String(summary).includes("Partly Rainy") || String(summary).includes("P Rainy")) return baseAddress + rainSunny;
    else if(String(summary).includes("wind")) return baseAddress + windy;
    else if(String(summary).includes("rain")) return baseAddress + rainy;
    else if(String(summary).includes("Sun")) return baseAddress + sunny;

    return baseAddress + cloudySunny
  }

  fillTemperatureDataModel() {
    this.currentTime = new Date()
    this.temperatureData.temperature = this.weatherDetails['v3-wx-observations-current'].temperature
    this.temperatureData.day = this.weatherDetails['v3-wx-observations-current'].dayOfWeek
    this.temperatureData.time = `${String(this.currentTime.getHours()).padStart(2, '0')}:${String(this.currentTime.getMinutes()).padStart(2, '0')}`
    this.temperatureData.rainPercent = this.weatherDetails['v3-wx-observations-current'].precip24Hour
    this.temperatureData.summaryPhrase = this.weatherDetails['v3-wx-observations-current'].wxPhraseShort
    this.temperatureData.summaryImage = this.getSummaryImage(this.temperatureData.summaryPhrase)
    this.temperatureData.location = `${this.locationDetails.location.city[0]}, ${this.locationDetails.location.country[0]}`
  }

  fillWeekData(){
    var weekCount = 0;

    while(weekCount < 7){
      this.weekData.push(new WeekData());
      this.weekData[weekCount].day = this.weatherDetails['v3-wx-forecast-daily-15day'].dayOfWeek[weekCount].slice(0,3);
      this.weekData[weekCount].tempMax = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMax[weekCount];
      this.weekData[weekCount].tempMin = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMin[weekCount];
      this.weekData[weekCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-daily-15day'].narrative[weekCount]);
      weekCount++;
    }
  }

  fillTodayData(){
    var todayCount = 0;
    while(todayCount < 7){
      this.todayData.push(new TodayData());
      this.todayData[todayCount].time = this.weatherDetails['v3-wx-forecast-hourly-10day'].validTimeLocal[todayCount].slice(11,16);
      this.todayData[todayCount].temperature = this.weatherDetails['v3-wx-forecast-hourly-10day'].temperature[todayCount];
      this.todayData[todayCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-hourly-10day'].wxPhraseShort[todayCount]);
      todayCount++;
    }
  }

  getTimeFromString(localTime:string){
    return localTime.slice(11,16);
  }

  fillTodayHighlight(){
    this.todayHighlight.airQuality = this.weatherDetails['v3-wx-globalAirQuality'].globalairquality.airQualityIndex;
    this.todayHighlight.humidity = this.weatherDetails['v3-wx-observations-current'].relativeHumidity;
    this.todayHighlight.sunrise = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunriseTimeLocal);
    this.todayHighlight.sunset = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunsetTimeLocal);
    this.todayHighlight.uvIndex = this.weatherDetails['v3-wx-observations-current'].uvIndex;
    this.todayHighlight.visibility = this.weatherDetails['v3-wx-observations-current'].visibility;
    this.todayHighlight.windStatus = this.weatherDetails['v3-wx-observations-current'].windSpeed;
  }

  prepareData(): void {
    this.fillTemperatureDataModel()
    this.fillWeekData()
    this.fillTodayData()
    this.fillTodayHighlight()
  }

  celsiusToFahrenheit(celsius: number): number {
    return +((celsius * 9/5) + 32).toFixed(2)
  }

  fahrenheitToCelsius(fahrenheit: number): number {
    return +((fahrenheit - 32) * 5/9).toFixed(2)
  }

  getLocationDetails(query: string, language: string): Observable<LocationDetails>{
    return this.httpClient.get<LocationDetails>(EnvironmentalVariables.weatherApiLocationBaseURL, {
      headers: new HttpHeaders()
      .set(EnvironmentalVariables.xRapidApiKeyName, EnvironmentalVariables.xRapidApikeyValue)
      .set(EnvironmentalVariables.xRapidApiHostName, EnvironmentalVariables.xRapidApiHostValue),
      params: new HttpParams()
      .set('query', query)
      .set('language', language)
    }
    )
  }

  getWeatherReport(date: string, latitude: number, longitude: number, language: string, units: string): Observable<WeatherDetails>{
    return this.httpClient.get<WeatherDetails>(EnvironmentalVariables.weatherApiForecastBaseURL, {
      headers: new HttpHeaders()
      .set(EnvironmentalVariables.xRapidApiKeyName, EnvironmentalVariables.xRapidApikeyValue)
      .set(EnvironmentalVariables.xRapidApiHostName, EnvironmentalVariables.xRapidApiHostValue),
      params: new HttpParams()
      .set('date', date)
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('language', language)
      .set('units', units)
    })
  }

  resetData() {
    this.temperatureData = new TemperatureData()
    this.todayHighlight = new TodaysHighlight()
    this.weekData = []
    this.todayData = []
  }

  getData(){

    this.temperatureData = new TemperatureData()
    this.todayHighlight = new TodaysHighlight()
    this.weekData = []
    this.todayData = []

    let latitude = 0
    let longitude = 0
    this.getLocationDetails(this.cityName, this.language).subscribe({
      next:(response) => {
        this.locationDetails = response
        latitude = this.locationDetails?.location.latitude[0]
        longitude = this.locationDetails?.location.longitude[0]

        this.getWeatherReport(this.date, latitude, longitude, this.language, this.units).subscribe({
          next:(response) => {
            this.weatherDetails = response
            this.prepareData()
          }
        })
      }
    })
  }
}
