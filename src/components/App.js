import React, { Component } from 'react';
import LocationsContainer from './locations-container';
import '../css/App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Road<strong>trip</strong> Fore<strong>cast</strong></h2>
        </div>
        <LocationsContainer />
      </div>
    );
  }
}

export default App;
