import React, { Component } from 'react'

class Spinner extends Component {
  render () {
    return (
      <svg width="50" height="50" className="loading">
        <line className="rotate" x1="20" y1="30" x2="30" y2="20" />
      </svg>
    )
  }
}

export default Spinner
