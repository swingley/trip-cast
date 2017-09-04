import React from 'react'
import { FaTimesCircle } from 'react-icons/lib/fa'

import './close.css'

let close = (props) => {
  return (
    <div onClick={props.onClick} className="location-remove">
      <FaTimesCircle />
    </div>
  )
}

export default close
