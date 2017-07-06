import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import _ from 'underscore';
import moment from 'moment';
import keys from './keys';

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
    this.state = { 
      inputs: [0, 1], 
      stops: [{ 
        place: 'San Diego, CA', when: moment(), xy: [-122.3917, 40.5865]
      }, { 
        place: 'Redding, CA', when: moment(), xy: [-117.1611, 32.7157]
      }], 
      startDate: moment() 
    };
    this.appendInput = this.appendInput.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.forecast = this.forecast.bind(this);
    this.autoComplete = _.debounce(this.autoComplete.bind(this), 200);
  }
  appendInput() {
    let { length } = this.state.inputs;
    console.log('appending...length is', length);
    this.setState({
      ...this.state,
      inputs: this.state.inputs.concat([length]),
      stops: this.state.stops.concat({ place: '', when: moment(), xy: [] })
    });
  }
  placeChange(e, index) {
    // console.log('place changed', e);
    let updated = this.state.stops.slice(0);
    updated[index].place = e.target.value;
    this.setState({
      ...this.state,
      stops: updated
    })
    this.autoComplete(index);
  }
  dateChange(date, index) {
    let updated = this.state.stops.slice(0);
    updated[index].when = date;
    this.setState({
      ...this.state,
      stops: updated
    })
  }
  autoComplete(index) {
    let { place } = this.state.stops[index];
    console.log('autoComplete', place, 'mapzen key', keys.mapzen);
    fetch(`${mapzenSearch}&text=${place}`)
      .then(response => response.json())
      .then(json => {
        // console.log('...mapzen search results', json);
        json.features.forEach(f => {
          console.log(f.properties.label);
        });
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
            let where = this.state.stops[input].place
            let when = this.state.stops[input].when;
            return <div key={containerKey}>
              <label htmlFor={key}>{label}</label>
              <input type="text" id={key} key={key} value={where} 
                onChange={e => this.placeChange(e, input)} 
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
