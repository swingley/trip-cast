import React, { Component } from 'react'
import debounce from 'lodash.debounce'
import moment from 'moment'
import LocationsMap from './locations-map'
import Location from './location'
import Spinner from './spinner'
import apis from '../utils/apis'
// import { empty, twoStops } from './stateOptions';
import { twoStops } from '../stateOptions'

import '../css/react-datepicker-customized.css'

let dateForamt = 'YYYY-MM-DD'
let nwsDateFormat = 'YYYY-MM-DDThh:mm:ssZ'
let reExtreme = /(low|high).*?[0-9]{1,3}/

class LocationsContainer extends Component {
  state = twoStops

  componentWillMount() {
    // Dont' hammer the place search service.
    this.placeSearch = debounce(this.placeSearch.bind(this), 200);
  }
  componentDidMount() {
    // Figure out how to give focus to first Location component.
    // this.Autocomplete0.focus(); 
    // The line above doesn't work since refactoring.
  }
  appendLocation = () => {
    this.setState({
      stops: this.state.stops.concat({ place: '', when: moment().add(1, 'days'), xy: [], suggestions: [] })
    })
  }
  placeChange = (e, index, search) => {
    // console.log('place changed', e);
    if ( e.target.value.length < 3 ) {
      search = false;
    }
    let updated = this.state.stops.slice(0)
    updated[index].place = e.target.value
    delete updated[index].missing
    delete updated[index].summary
    if ( e.target.coordinates && e.target.coordinates.length === 2 ) {
      updated[index].xy = e.target.coordinates
    }
    this.setState({
      stops: updated
    })
    if ( search ) {
      this.placeSearch(index);
    }
  }
  dateChange = (date, index) => {
    let updated = this.state.stops.slice(0)
    updated[index].when = date
    // Change the forecast too.
    if ( updated[index].forecastResponse ) {
      this.findStopPeriods(updated[index])
    }
    this.setState({
      stops: updated
    })
  }
  placeSearch = (index) => {
    let { place } = this.state.stops[index]
    apis.getPlaces(place)
      .then(json => {
        let labels = json.features.map(f => { 
          return { name: f.place_name, coordinates: f.geometry.coordinates }
        })
        let updated = this.state.stops.slice(0)
        updated[index].suggestions = labels
        this.setState({
          stops:updated
        })
      })
  }
  validateStops = () => {
    // Places and dates:
    // Check if any boxes are empty.
    // Call forecast() if all is right.
    // If not, set new state with 'missing': true on each empty stop.
    // Make input border red if they're empty. 
    
    let missingPlaces = []
    this.state.stops.forEach((stop, index) => {
      if ( !stop.place.trim() ) {
        missingPlaces.push(index)
      } 
    })
    // console.log('validating...', missingPlaces)
    if ( missingPlaces.length > 0 ) {
      let updated = this.state.stops.slice(0)
      missingPlaces.forEach(index => {
        updated[index].missing = true
      })
      this.setState({
        stops: updated
      })
      return
    } else {
      this.forecast()
    } 
  }
  findStopPeriods = (stop) => {
    stop.summary = []
    stop.weather = []
    let stopDate = stop.when.format(dateForamt)
    // Loop through periods, find matches.
    stop.forecastResponse.properties.periods.forEach(period => {
      // console.log(stop.place, period.shortForecast)
      let periodMoment = moment(period.endTime, nwsDateFormat)
      if ( periodMoment.format(dateForamt) === stopDate ) {
        stop.weather.push(period)

        // Pull out text like:  "low around 69" or "high near 78".
        let periodHasHighOrLow = period.detailedForecast.toLowerCase().match(reExtreme)
        if ( periodHasHighOrLow ) {
          stop.summary.push({
            icon: period.icon,
            info: `${period.shortForecast}, ${periodHasHighOrLow[0]}`
          })
        }
      }
    })
  }
  forecast = () => {
    // All stops have places, get forecasts.
    let stopCount = this.state.stops.length
    let forecastsRetrieved = 0
    let forecasts = {}
    this.state.stops.forEach(stop => {
      // console.log('forecast', stop.place, stop.xy)
      // console.log(stop.xy, 'on', stop.when.format(dateForamt))
      // parse date from NWS response:
      // let startDate = '2017-07-18T18:00:00-07:00'
      // let startFormat = 'YYYY-MM-DDThh:mm:ssZ'
      // moment(startDate, startFormat).format('MM-DD-YYYY')
      apis.getForecast(stop)
        .then(json => {
          // Increment forecastsRetrieved and save info in forecasts object.
          forecasts[stop.place] = json
          forecastsRetrieved += 1
          if (forecastsRetrieved === stopCount ) {
            // Match a stop with its forecast:
            let updated = this.state.stops.slice(0)
            updated.forEach(stop => {
              if ( forecasts[stop.place] ) {
                stop.forecastResponse = forecasts[stop.place]
                this.findStopPeriods(stop)
              }
            })
            // console.log('updated', updated)
            this.setState({
              isFetching: false,
              stops: updated
            })
          }
        })
    })
    this.setState({
      isFetching: true
    })
  }
  removeStop = (stopId) => {
    let updated = this.state.stops.slice(0)
    // Remove the stop.
    updated = updated.slice(0, stopId).concat(updated.slice(stopId + 1))
    this.setState({
      stops: updated
    })
  }
  render() {
    let loading = null
    if ( this.state.isFetching ) {
      loading = <div><Spinner /></div>
    }

    return (
      <div className="locations-container">
        {this.state.stops.map((stop, index) => {
          let stopInfo = {
            containerKey: `container-${index}`,
            dpKey: `when-${index}`,
            stopKey: index,
            placeChange: this.placeChange,
            stop: stop,
            removeStop: () => this.removeStop(index),
            pickerStart: moment(),
            pickerEnd: moment().add(7, 'days'),
            dateChange: this.dateChange,
            inputProps: { 
              type: 'text',
              autoCapitalize: 'off',
              autoComplete: 'off',
              autoCorrect: 'off'
            },
            autoComplete: this[`Autocomplete${index}`]
          }
          return <Location key={`location-${index}`} {...stopInfo} /> 
        })}
        <button onClick={this.appendLocation} className="shadow">Add a place</button>
        <button onClick={this.validateStops} className="shadow">Get forecast</button>
        {loading}
        <LocationsMap locations={this.state.stops} height={300} />
      </div>
    );
  }
}

export default LocationsContainer;
