import moment from 'moment';

let emptyStop = { place: '', when: moment(), xy: [], suggestions: [] };
export let empty = {
  stops: [ Object.assign({}, emptyStop), Object.assign({}, emptyStop) ],
  startDate: moment(),
  isFetching: false
};

export let twoStops = { 
  stops: [{ 
    place: 'San Diego, CA', when: moment().add(1, 'days'), xy: [-117.1611, 32.7157], suggestions: []
  }, { 
    place: 'Redding, CA', when: moment().add(1, 'days'), xy: [-122.3917, 40.5865], suggestions: []
  }], 
  startDate: moment(),
  isFetching: false
};
