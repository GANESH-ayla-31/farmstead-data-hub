
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, AlertTriangle, Wind, Thermometer } from 'lucide-react';

const WeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState({
    temp: 25,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 10,
    icon: <Sun className="h-12 w-12 text-amber-500" />
  });

  // Mock forecast data
  const forecast = [
    { day: 'Tuesday', condition: 'Sunny', high: 27, low: 15, icon: <Sun className="h-6 w-6 text-amber-500" /> },
    { day: 'Wednesday', condition: 'Partly Cloudy', high: 24, low: 14, icon: <Cloud className="h-6 w-6 text-gray-500" /> },
    { day: 'Thursday', condition: 'Rain', high: 22, low: 12, icon: <CloudRain className="h-6 w-6 text-blue-500" /> },
    { day: 'Friday', condition: 'Sunny', high: 25, low: 14, icon: <Sun className="h-6 w-6 text-amber-500" /> },
    { day: 'Saturday', condition: 'Sunny', high: 28, low: 16, icon: <Sun className="h-6 w-6 text-amber-500" /> }
  ];

  const weatherAlerts = [
    { type: 'Frost Warning', message: 'Overnight temperatures expected to drop below freezing', date: 'Tomorrow' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Weather Forecast</h1>
          <p className="text-muted-foreground">Plan your farm activities with up-to-date weather information</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Current Weather</CardTitle>
              <CardDescription>Today's conditions for your farm location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {currentWeather.icon}
                <div>
                  <div className="text-3xl font-bold">{currentWeather.temp}°C</div>
                  <div>{currentWeather.condition}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                  <span>Humidity: {currentWeather.humidity}%</span>
                </div>
                <div className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Wind: {currentWeather.windSpeed} km/h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {weatherAlerts.length > 0 && (
            <Card className="bg-amber-50 border-amber-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-amber-800">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Weather Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800">
                {weatherAlerts.map((alert, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-medium">{alert.type}</div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs mt-1">Expected: {alert.date}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
            <CardDescription>Plan ahead with our extended forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="flex flex-col items-center p-2 border rounded-lg">
                  <div className="font-medium">{day.day}</div>
                  {day.icon}
                  <div className="mt-1 text-sm">{day.condition}</div>
                  <div className="mt-1 flex space-x-2 text-sm">
                    <span className="text-red-600">{day.high}°</span>
                    <span className="text-blue-600">{day.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Agricultural Weather Insights</CardTitle>
            <CardDescription>Weather-related recommendations for farming activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Based on the current forecast, the next optimal planting window is Wednesday-Friday.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Weather data is updated hourly. For more detailed agricultural weather information, check back soon for our premium weather services.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default WeatherPage;
