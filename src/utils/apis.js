import keys from '../keys'

// National Weather Service API root.
let nws = `https://api.weather.gov/points/`
// What does the NWS API call for this look like?
// https://api.weather.gov/points/40.5865,-122.3917/forecast

let mapboxSearch = `https://api.mapbox.com/geocoding/v5/mapbox.places/`
let mapboxToken = `?access_token=${keys.mapbox}`

export default {
  getForecast: function(stop) {
    return fetch(`${nws}${stop.xy[1]},${stop.xy[0]}/forecast`)
      .then(response => response.json())

  },
  getPlaces: function(place) {
    return fetch(`${mapboxSearch}${encodeURIComponent(place)}.json${mapboxToken}`)
      .then(response => response.json())
  }
}
