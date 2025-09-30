import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, Droplets, Eye, Thermometer } from 'lucide-react';

// Weather condition types
type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'drizzle' | 'windy';

interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  location: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
}

interface WeatherWidgetProps {
  compact?: boolean;
}

// Icon mapping for weather conditions
const getWeatherIcon = (condition: WeatherCondition) => {
  const iconClass = "w-12 h-12";
  switch (condition) {
    case 'sunny':
      return <Sun className={`${iconClass} text-yellow-400`} />;
    case 'cloudy':
      return <Cloud className={`${iconClass} text-gray-400`} />;
    case 'rainy':
      return <CloudRain className={`${iconClass} text-blue-400`} />;
    case 'snowy':
      return <CloudSnow className={`${iconClass} text-blue-200`} />;
    case 'drizzle':
      return <CloudDrizzle className={`${iconClass} text-blue-300`} />;
    case 'windy':
      return <Wind className={`${iconClass} text-gray-500`} />;
    default:
      return <Sun className={`${iconClass} text-yellow-400`} />;
  }
};

// Get background gradient based on condition
const getWeatherGradient = (condition: WeatherCondition) => {
  switch (condition) {
    case 'sunny':
      return 'from-yellow-400 to-orange-400';
    case 'cloudy':
      return 'from-gray-400 to-gray-500';
    case 'rainy':
      return 'from-blue-400 to-blue-600';
    case 'snowy':
      return 'from-blue-200 to-blue-400';
    case 'drizzle':
      return 'from-blue-300 to-blue-500';
    case 'windy':
      return 'from-gray-300 to-gray-400';
    default:
      return 'from-blue-400 to-blue-600';
  }
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ compact = false }) => {
  // Mock weather data (in production, fetch from API)
  const [weather, setWeather] = useState<WeatherData>({
    condition: 'sunny',
    temperature: 72,
    location: 'San Francisco',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    feelsLike: 70,
  });

  // Simulate weather updates (in production, this would be real API calls)
  useEffect(() => {
    const updateWeather = () => {
      // Mock data rotation
      const conditions: WeatherCondition[] = ['sunny', 'cloudy', 'rainy', 'drizzle'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      setWeather(prev => ({
        ...prev,
        condition: randomCondition,
        temperature: 65 + Math.floor(Math.random() * 20),
      }));
    };

    // Update every 30 seconds in demo
    const interval = setInterval(updateWeather, 30000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getWeatherIcon(weather.condition)}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {weather.temperature}°
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {weather.location}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 min-w-[280px]"
    >
      {/* Main Weather Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <div className={`p-4 rounded-full bg-gradient-to-br ${getWeatherGradient(weather.condition)} bg-opacity-20`}>
            {getWeatherIcon(weather.condition)}
          </div>
        </div>
        
        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
          {weather.temperature}°F
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-1">
          {weather.condition}
        </div>
        
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {weather.location}
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Feels Like */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Feels Like</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {weather.feelsLike}°F
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {weather.humidity}%
            </div>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <Wind className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {weather.windSpeed} mph
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <Eye className="w-4 h-4 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Visibility</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {weather.visibility} mi
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast (Mock) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          Hourly Forecast
        </div>
        <div className="flex justify-between gap-2">
          {[
            { time: '12 PM', temp: 72, icon: 'sunny' as WeatherCondition },
            { time: '3 PM', temp: 75, icon: 'sunny' as WeatherCondition },
            { time: '6 PM', temp: 68, icon: 'cloudy' as WeatherCondition },
            { time: '9 PM', temp: 62, icon: 'cloudy' as WeatherCondition },
          ].map((hour, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">{hour.time}</div>
              <div className="scale-50">{getWeatherIcon(hour.icon)}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {hour.temp}°
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center">
        <button className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          Updated just now
        </button>
      </div>
    </motion.div>
  );
};

// Compact weather for system tray
export const CompactWeather: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <Sun className="w-4 h-4 text-yellow-400" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">72°</span>
    </div>
  );
};
