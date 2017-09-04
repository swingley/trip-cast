import keys from '../keys'

// National Weather Service API root.
let nws = `https://api.weather.gov/points/`
// What does the NWS API call for this look like?
// https://api.weather.gov/points/40.5865,-122.3917/forecast

// Only search administrative areas in the US.
let mapzenSearch = `https://search.mapzen.com/v1/autocomplete?boundary.country=US&layers=coarse&api_key=${keys.mapzen}`

export default {
  getForecast: function(stop) {
    return fetch(`${nws}${stop.xy[1]},${stop.xy[0]}/forecast`)
      .then(response => response.json())

  },
  getPlaces: function(place) {
    return fetch(`${mapzenSearch}&text=${place}`)
      .then(response => response.json())
  }
}