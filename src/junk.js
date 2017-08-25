import React, { Component } from 'react'
import { FaBolt, FaBomb } from 'react-icons/lib/fa'

class Junk extends Component {
  render() {
    return (
      <div className='junk'>Stuff from font-awesome, via react-icons: <FaBolt /><FaBomb /></div>
    )
  }
}

export default Junk
