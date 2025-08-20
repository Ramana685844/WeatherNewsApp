# WeatherNewsApp

A **Weather and News Aggregator App** built with **React Native (Bare CLI)** and **TypeScript**. The app fetches weather and news data from public APIs, and filters news headlines based on the current weather conditions.

---

## 📱 Features

* **Weather Information**

  * Current weather based on user location
  * 5-day forecast
  * Supports Celsius/Fahrenheit
* **News Headlines**

  * Latest news with headline, description, and link
  * Categories based on user preferences
* **Weather-Based News Filtering**

  * Cold → depressing news
  * Hot → fear-related news
  * Cool → happiness/winning news
* **Settings Screen**

  * Manage temperature units
  * Choose preferred news categories

---

## 🛠️ Tech Stack

* **React Native (Bare CLI)**
* **TypeScript**
* **React Navigation** for navigation
* **Redux Toolkit** (Provider) for state management
* **OpenWeatherMap API** for weather
* **NewsAPI** for news

---

## 📂 Project Structure

```
src/
├── components/
│   ├── NewsCard.tsx
│   ├── ForecastItem.tsx
│   ├── LoadingSpinner.tsx
├── screens/
│   ├── HomeScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/
│   └── AppNavigator.tsx
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── weatherSlice.ts
│   │   ├── newsSlice.ts
│   │   └── settingsSlice.ts
├── services/
│   ├── weatherApi.ts
│   ├── newsApi.ts
│   └── locationService.ts
├── types/
│   ├── weather.ts
│   ├── news.ts
│   └── settings.ts
├── utils/
│   ├── weatherNewsFilter.ts
└── App.tsx
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/WeatherNewsApp.git
cd WeatherNewsApp
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key
NEWS_API_KEY=your_newsapi_key
```

### 4. Run on Android

```bash
npm run android
```

### 5. Run on iOS (Mac only)

```bash
cd ios && pod install && cd ..
npm run ios
```

---

## ⚙️ Configuration

* Update API keys in `.env` file
* Modify `utils/weatherNewsFilter.ts` to tweak news filtering logic

---

## 📌 Notes

* Requires **Android Studio** or **Xcode** for running on simulators
* Location permission required for weather fetching
* Make sure you have valid API keys from [OpenWeatherMap](https://openweathermap.org/) and [NewsAPI](https://newsapi.org/)

---

## 📜 License

This project is licensed under the MIT License.
