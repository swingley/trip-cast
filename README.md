A simple react-based web app to get weather forecasts in multiple places. Auto-complete made possible with the [Mapbox Geocoding API](https://www.mapbox.com/api-documentation/#geocoding) and weather forecasts are from [version 3 of the National Weather Service's API](https://forecast-v3.weather.gov/documentation). More info in a [blog post](https://derekswingley.com/2017/10/26/building-a-multi-city-weather-forecast-app-with-react/) (and a follow-up outlining [the move from Mapzen to Mapbox for place search](https://derekswingley.com/2018/01/10/migrating-from-mapzen-search-to-mapbox-geocoding/)) or [try the app](https://derekswingley.com/lab/trip-cast/).

To run locally, you need a Mapbox API key in a file named `keys.js` in the `src` folder. The file should look something like this:

```js
export default {
  mapbox: "pk.blahblehblah.fakekeykey"
}
```

Deployment is straightforward. Run `npm run build`. Then move the contents of `build/` to a webserver. Voilà.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
