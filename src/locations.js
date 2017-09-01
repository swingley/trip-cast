import React, { Component } from 'react'
import Autocomplete from 'react-autocomplete'
import DatePicker from 'react-datepicker'
import _ from 'underscore'
import moment from 'moment'
import Spinner from './spinner'
import keys from './keys'
import styles from './styles'
// import { empty, twoStops } from './stateOptions';
import { twoStops } from './stateOptions'

import '../node_modules/react-datepicker/dist/react-datepicker.css'

let stopLabels = [
  '1st', '2nd', '3rd', '4th', '5th', 
  '6th', '7th', '8th', '9th', '10th'
]

let dateForamt = 'YYYY-MM-DD'
let nwsDateFormat = 'YYYY-MM-DDThh:mm:ssZ'

// Only search administrative areas in the US.
let mapzenSearch = `https://search.mapzen.com/v1/autocomplete?boundary.country=US&layers=coarse&api_key=${keys.mapzen}`
// National Weather Service API root.
let nws = `https://api.weather.gov/points/`

class Locations extends Component {
  state = twoStops
  
  componentDidMount(){
    this.Autocomplete0.focus(); 
  }
  appendInput = () => {
    let { length } = this.state.inputs;
    this.setState({
      ...this.state,
      inputs: this.state.inputs.concat([length]),
      stops: this.state.stops.concat({ place: '', when: moment().add(1, 'days'), xy: [], suggestions: [] })
    })
  }
  placeChange(e, index, search) {
    // console.log('place changed', e);
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
    // console.log('place search, place', place);
    // console.log('placeSearch', place, 'mapzen key', keys.mapzen);
    // console.log('this...', this);
    fetch(`${mapzenSearch}&text=${place}`)
      .then(response => response.json())
      .then(json => {
        // console.log('...mapzen search results', json);
        // json.features.forEach(f => {
        //   console.log(f.properties.label)
        // })
        let labels = json.features.map(f => { 
          // console.log(`mapzen result ${JSON.stringify(f)}`)
          return { name: f.properties.label, coordinates: f.geometry.coordinates }
        })
        // console.log(`auto complete request returned:  ${labels}`)
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
    console.log('validating...', missingPlaces)
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
    // console.log('state', this.state)

    // All stops have places, get forecasts.
    let stopCount = this.state.stops.length
    let forecastsRetrieved = 0
    let forecasts = {}
    this.state.stops.forEach(stop => {
      console.log(stop.xy, 'on', stop.when.format(dateForamt))
      // What does the NWS API call for this look like?
      // https://api.weather.gov/points/40.5865,-122.3917/forecast
      // parse date from NWS response:
      // let startDate = '2017-07-18T18:00:00-07:00'
      // let startFormat = 'YYYY-MM-DDThh:mm:ssZ'
      // moment(startDate, startFormat).format('MM-DD-YYYY')
      fetch(`${nws}${stop.xy[1]},${stop.xy[0]}/forecast`)
        .then(response => response.json())
        .then(json => {
          console.log('json forecast', stop.place, json)
          // Increment forecastsRetrieved and save info in forecasts object.
          forecasts[stop.place] = json
          forecastsRetrieved += 1
          if (forecastsRetrieved === stopCount ) {
            console.log('...all done, update state!', forecasts)
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
            console.log('updated', updated)
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
      console.log('showing a spinner...')
      loading = <Spinner />
    }

    return (
      <div className="locations-container">
        <div className="locations-header">
          <h2>Wheres</h2>
          {this.state.inputs.map((input, index) => {
            let containerKey = `container-${input}`
            let key = `location-${input}`
            let label = `${stopLabels[input]}:`
            let dpKey = `when-${input}`
            let { place, when, suggestions } = this.state.stops[input]
            let pickerStart = moment()
            let pickerEnd = moment().add(10, 'days')
            let inputProps = { id: key, type: 'text' }
            // console.log(`${label} suggestions:  ${JSON.stringify(suggestions)}`)
            return <div key={containerKey}>
              <label htmlFor={key}>{label}</label>
              {/*put a red outline around empty inputs */}
              <Autocomplete
                inputProps={
                  this.state.stops[index].missing ? 
                    { className: 'missing', ...inputProps } :
                    inputProps
                }
                value={place}
                items={suggestions}
                getItemValue={(item) => item.name}
                menuStyle={styles.menu}
                onSelect={(value, item) => {
                  //console.log('onSelect', this, item, place)
                  let selected = {
                    target: {
                      value: value,
                      coordinates: item.coordinates
                    }
                  }
                  this.placeChange(selected, input, false)
                }}
                onChange={(event, value) => {
                  //this.setState({ value })
                  this.placeChange(event, input, true)
                }}
                renderItem={(item, isHighlighted) => (
                  <div
                    style={isHighlighted ? {...styles.item, background: 'lightgray'} : {...styles.item, background: 'white'}}
                    key={item.abbr}
                  >{item.name}</div>
                )}
                ref={el => this[`Autocomplete${input}`] = el}
              />
              <DatePicker
                selected={when}
                onChange={e => this.dateChange(e, input)}
                key={dpKey}
                minDate={pickerStart}
                maxDate={pickerEnd}
              />
              {this.state.stops && this.state.stops[index] && stopsHaveForecast &&
                <span>{this.state.stops[index].weather[0].shortForecast}</span>
              }
            </div>
          })}
          <button onClick={this.appendInput}>Add a place</button>
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

export default Locations;
