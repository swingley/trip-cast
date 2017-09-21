import React from 'react'
import FaTimesCircle from 'react-icons/lib/fa/times-circle'

import '../css/close.css'

let close = (props) => {
  return (
    <div onClick={props.onClick} className="location-remove">
      <FaTimesCircle />
    </div>
  )
}

export default close
