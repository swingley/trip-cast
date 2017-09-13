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
    place: 'Muncie, IN', when: moment().add(1, 'days'), xy: [-85.394431, 40.200456], suggestions: []
  }], 
  startDate: moment(),
  isFetching: false
};
