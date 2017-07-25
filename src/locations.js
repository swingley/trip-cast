import React, { Component } from 'react'
import Autocomplete from 'react-autocomplete'
import DatePicker from 'react-datepicker'
import _ from 'underscore'
import moment from 'moment'
import keys from './keys'
import styles from './styles'
// import { empty, twoStops } from './stateOptions';
import { twoStops } from './stateOptions'

import '../node_modules/react-datepicker/dist/react-datepicker.css'

let stopLabels = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth', 
  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'
];

let dateForamt = 'YYYY-MM-DD'
let nwsDateFormat = 'YYYY-MM-DDThh:mm:ssZ'

// Only search administrative areas in the US.
let mapzenSearch = `https://search.mapzen.com/v1/autocomplete?boundary.country=US&layers=coarse&api_key=${keys.mapzen}`;
// National Weather Service API root.
let nws = `https://api.weather.gov/points/`

class Locations extends Component {
  constructor(props) {
    super(props);
    this.state = twoStops;
    // this.state = empty;
    this.appendInput = this.appendInput.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.forecast = this.forecast.bind(this);
    this.placeSearch = _.debounce(this.placeSearch.bind(this), 200);
  }
  componentDidMount(){
    this.Autocomplete0.focus(); 
  }
  appendInput() {
    let { length } = this.state.inputs;
    this.setState({
      ...this.state,
      inputs: this.state.inputs.concat([length]),
      stops: this.state.stops.concat({ place: '', when: moment().add('days', 1), xy: [], suggestions: [] })
    });
  }
  placeChange(e, index, search) {
    // console.log('place changed', e);
    let updated = this.state.stops.slice(0)
    updated[index].place = e.target.value
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
  dateChange(date, index) {
    let updated = this.state.stops.slice(0)
    updated[index].when = date
    this.setState({
      ...this.state,
      stops: updated
    })
  }
  placeSearch(index) {
    let { place } = this.state.stops[index];
    // console.log('placeSearch', place, 'mapzen key', keys.mapzen);
    // console.log('this...', this);
    fetch(`${mapzenSearch}&text=${place}`)
      .then(response => response.json())
      .then(json => {
        // console.log('...mapzen search results', json);
        // json.features.forEach(f => {
        //   console.log(f.properties.label);
        // });
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
      });
  }
  forecast() {
    // console.log('state', this.state);
    // Places and dates:
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
          // TODO:  grap json.properties.periods for forecast stuff
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
                  console.log(stop.place, period.shortForecast)
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
              stops: updated
            })
          }
        })
    })
  }
  render() {
    let stopsHaveForecast = this.state.stops.reduce((forecastsExist, stop) => {
      return stop.hasOwnProperty('weather') && stop.weather[0]
    }, true)

    return (
      <div className="locations-container">
        <div className="locations-header">
          <h2>Wheres</h2>
          {this.state.inputs.map((input, index) => {
            let containerKey = `container-${input}`;
            let key = `location-${input}`;
            let label = `${stopLabels[input]}:`;
            let dpKey = `when-${input}`;
            let { place, when, suggestions } = this.state.stops[input]
            let pickerStart = moment()
            let pickerEnd = moment().add(10, 'days')
            // console.log(`${label} suggestions:  ${JSON.stringify(suggestions)}`)
            return <div key={containerKey}>
              <label htmlFor={key}>{label}</label>
              <Autocomplete
                inputProps={{ id: {key} }}
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
          <button onClick={this.forecast}>Get forecast</button>
          {stopsHaveForecast && 
            <div className='lefty'>
              <div>Weather</div>
              {this.state.stops.map(stop => {
                return (
                  <div>{stop.place}: {stop.weather[0].shortForecast}</div>
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
