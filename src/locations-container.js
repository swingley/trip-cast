import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment'
import Location from './location'
import apis from './utils/apis'
import Spinner from './spinner'
// import { empty, twoStops } from './stateOptions';
import { twoStops } from './stateOptions'

import '../node_modules/react-datepicker/dist/react-datepicker.css'

let stopLabels = [
  '1st', '2nd', '3rd', '4th', '5th', 
  '6th', '7th', '8th', '9th', '10th'
]

let dateForamt = 'YYYY-MM-DD'
let nwsDateFormat = 'YYYY-MM-DDThh:mm:ssZ'

class LocationsContainer extends Component {
  state = twoStops

  componentWillMount() {
    // Dont' hammer the place search service.
    this.placeSearch = _.debounce(this.placeSearch.bind(this), 200);
  }
  componentDidMount() {
    // Figure out how to give focus to first Location component.
    // this.Autocomplete0.focus(); 
    // The line above doesn't work since refactoring.
  }
  appendLocation = () => {
    let { length } = this.state.inputs;
    this.setState({
      ...this.state,
      inputs: this.state.inputs.concat([length]),
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
    if ( e.target.coordinates && e.target.coordinates.length === 2 ) {
      updated[index].xy = e.target.coordinates
    }
    this.setState({
      ...this.state,
      stops: updated
    })
    if ( search ) {
      this.placeSearch(index);
    }
  }
  dateChange = (date, index) => {
    let updated = this.state.stops.slice(0)
    updated[index].when = date
    this.setState({
      ...this.state,
      stops: updated
    })
  }
  placeSearch = (index) => {
    let { place } = this.state.stops[index]
    apis.getPlaces(place)
      .then(json => {
        let labels = json.features.map(f => { 
          return { name: f.properties.label, coordinates: f.geometry.coordinates }
        })
        let updated = this.state.stops.slice(0)
        updated[index].suggestions = labels
        this.setState({
          ...this.state,
          stops:updated
        })
      })
  }
  validateStops = () => {
    // Places and dates:
    // Check if any boxes are empty.
    // Call forecast() if all is right.
    // If not, set new state with a missing: true on each empty stop.
    // Make input border red if they're empty. 
    // TODO:  check dates too.
    
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
        ...this.state,
        stops: updated
      })
      return
    } else {
      this.forecast()
    } 
  }
  forecast = () => {
    // All stops have places, get forecasts.
    let stopCount = this.state.stops.length
    let forecastsRetrieved = 0
    let forecasts = {}
    this.state.stops.forEach(stop => {
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
                stop.weather = []
                let stopDate = stop.when.format(dateForamt)
                // Loop through periods, find matches.
                let { periods } = stop.forecastResponse.properties
                periods.forEach(period => {
                  // console.log(stop.place, period.shortForecast)
                  let periodMoment = moment(period.endTime, nwsDateFormat)
                  if ( periodMoment.format(dateForamt) === stopDate ) {
                    stop.weather.push(period)
                  }
                })
              }
            })
            // console.log('updated', updated)
            this.setState({
              ...this.state,
              isFetching: false,
              stops: updated
            })
          }
        })
    })
    this.setState({
      ...this.state,
      isFetching: true
    })
  }
  render() {
    let stopsHaveForecast = this.state.stops.reduce((forecastsExist, stop) => {
      return stop.hasOwnProperty('weather') && stop.weather[0]
    }, true)
    let loading = null
    if ( this.state.isFetching ) {
      loading = <Spinner />
    }

    return (
      <div className="locations-container">
        <div className="locations-header">
          <h2>Wheres</h2>
          {this.state.inputs.map((input, index) => {
            let stopInfo = {
              containerKey: `container-${input}`,
              label: `${stopLabels[input]}:`,
              dpKey: `when-${input}`,
              input: input,
              placeChange: this.placeChange,
              stop: this.state.stops[input],
              pickerStart: moment(),
              pickerEnd: moment().add(10, 'days'),
              dateChange: this.dateChange,
              inputProps: { type: 'text' },
              autoComplete: this[`Autocomplete${input}`]
            }
            // console.log(`${label} suggestions:  ${JSON.stringify(suggestions)}`)
            return <Location key={`location-${index}`} {...stopInfo} /> 
          })}
          <button onClick={this.appendLocation}>Add a place</button>
          <button onClick={this.validateStops}>Get forecast</button>
          {loading} 
          {stopsHaveForecast && 
            <div className='lefty'>
              <div>Weather</div>
              {this.state.stops.map((stop,index) => {
                return (
                  <div key={index}>{stop.place}: {stop.weather[0].shortForecast}</div>
                )
              })}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default LocationsContainer;
