import React, {PureComponent} from 'react';

export default class CityInfo extends PureComponent {

  render() {
    return (
      <div>
        {this.props.info.place}
      </div>
    );
  }
}

/*
  from react-map-gl example:
  https://github.com/uber/react-map-gl/blob/master/examples/controls/src/city-info.js
*/