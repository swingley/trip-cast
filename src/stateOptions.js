import moment from 'moment';

let emptyStop = { place: '', when: moment(), xy: [], suggestions: [] };
export let empty = {
  inputs:[0, 1],
  stops: [ Object.assign({}, emptyStop), Object.assign({}, emptyStop) ],
  startDate: moment()
};

export let twoStops = { 
  inputs: [0, 1], 
  stops: [{ 
    place: 'San Diego, CA', when: moment().add('days', 1), xy: [-122.3917, 40.5865], suggestions: []
  }, { 
    place: 'Redding, CA', when: moment().add('days', 1), xy: [-117.1611, 32.7157], suggestions: []
  }], 
  startDate: moment() 
};
