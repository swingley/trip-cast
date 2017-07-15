import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';
import DatePicker from 'react-datepicker';
import _ from 'underscore';
import moment from 'moment';
import keys from './keys';
import styles from './styles';
import { empty, twoStops } from './stateOptions';

import '../node_modules/react-datepicker/dist/react-datepicker.css';

let stopLabels = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth', 
  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'
];

// Only search administrative areas in the US.
let mapzenSearch = `https://search.mapzen.com/v1/autocomplete?boundary.country=US&layers=coarse&api_key=${keys.mapzen}`;

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
      stops: this.state.stops.concat({ place: '', when: moment(), xy: [], suggestions: [] })
    });
  }
  placeChange(e, index, search) {
    // console.log('place changed', e);
    let updated = this.state.stops.slice(0)
    updated[index].place = e.target.value
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
    console.log('placeSearch', place, 'mapzen key', keys.mapzen);
    console.log('this...', this);
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
        console.log(`auto complete request returned:  ${labels}`)
        let updated = this.state.stops.slice(0)
        updated[index].suggestions = labels
        this.setState({
          ...this.state,
          stops:updated
        })
      });
  }
  forecast() {
    console.log('state', this.state);
  }
  render() {
    return (
      <div className="locations-container">
        <div className="locations-header">
          <h2>Wheres</h2>
          {this.state.inputs.map(input => {
            let containerKey = `container-${input}`;
            let key = `location-${input}`;
            let label = `${stopLabels[input]}:`;
            let dpKey = `when-${input}`;
            let { place, when, suggestions } = this.state.stops[input]
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
                  console.log('onSelect', this, item, place)
                  let selected = { target: { value: value }}
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
              />
            </div>
          })}
          <button onClick={this.appendInput}>Add a place</button>
          <button onClick={this.forecast}>Get forecast</button>
        </div>
      </div>
    );
  }
}

export default Locations;
