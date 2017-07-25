import React, { Component } from 'react';
import Locations from './locations';
import Junk from './junk';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Road<strong>trip</strong> Fore<strong>cast</strong></h2>
        </div>
        <Locations />
        <Junk />
      </div>
    );
  }
}

export default App;
