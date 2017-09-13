import React, {Component} from 'react';
import MapGL, {Marker, Popup} from 'react-map-gl';

import CityPin from './city-pin';
import CityInfo from './city-info';

import locationHelpers from '../utils/locations';

import keys from '../keys'

import '../../node_modules/mapbox-gl/dist/mapbox-gl.css'
import '../css/map.css';

export default class LocationsMap extends Component {

  constructor(props) {
    super(props);
    let center = locationHelpers.centerOnLocations(props.locations);
    this.state = {
      viewport: {
        latitude: center[1],
        longitude: center[0],
        zoom: 3.5,
        bearing: 0,
        pitch: 0,
        width: 800,
        height: 300,
        scrollZoom: false
      },
      popupInfo: null
    }
  }

  componentDidMount = () => {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this._resize);
  }

  componentWillReceiveProps = (nextProps) => {
    let center = locationHelpers.centerOnLocations(nextProps.locations);
    let { latitude, longitude } = this.state.viewport;
    if ( center[1] !== latitude || center[0] !== longitude ) {
      this._updateViewport({
        ...this.state.viewport,
        latitude: center[1],
        longitude: center[0]
      });
      // console.log('new center, updated state', center);
    }
  }

  _resize = () => {
    let width = this.element._eventCanvas.parentElement.offsetWidth - 20;
    // console.log('map resize', width, this.props.height);
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: width || this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

  _updateViewport = (viewport) => {
    viewport.scrollZoom = false;
    this.setState({viewport});
  }

  _renderCityMarker = (city, index) => {
    if ( city.xy.length === 0 ) {
      return;
    }
    return (
      <Marker key={`marker-${index}`}
        longitude={city.xy[0]}
        latitude={city.xy[1]} >
        <CityPin size={20} onClick={() => this.setState({popupInfo: city})} />
      </Marker>
    );
  }

  _renderPopup() {
    const {popupInfo} = this.state;

    return popupInfo && (
      <Popup tipSize={5}
        anchor="top"
        longitude={popupInfo.xy[0]}
        latitude={popupInfo.xy[1]}
        onClose={() => this.setState({popupInfo: null})} >
        <CityInfo info={popupInfo} />
      </Popup>
    );
  }

  render = () => {
    const { viewport } = this.state;
    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={keys.mapbox} 
        ref={(el) => this.element = el }
        className="location-map">

        { this.props.locations.map(this._renderCityMarker) }

        {this._renderPopup()}
      </MapGL>
    );
  }

}

/*
  from react-map-gl example:
  https://github.com/uber/react-map-gl/blob/master/examples/controls/src/app.js
*/