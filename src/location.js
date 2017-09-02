import React from 'react'
import Autocomplete from 'react-autocomplete'
import DatePicker from 'react-datepicker'
import styles from './styles'

let location = (props) => {
  let { containerKey, inputProps, dpKey } = props
  let { pickerStart, pickerEnd } = props
  let { place, when, suggestions, missing } = props.stop
  inputProps.key = `location-${props.input}`
  return (
    <div key={containerKey} className="location-container shadow">
      {/*put a red outline around empty inputs */}
      <Autocomplete
        inputProps={
          missing ? 
            { className: 'missing', ...inputProps } :
            inputProps
        }
        value={place}
        items={suggestions}
        getItemValue={(item) => item.name}
        menuStyle={styles.menu}
        onSelect={(value, item) => {
          //console.log('onSelect', this, item, place)
          let selected = {
            target: {
              value: value,
              coordinates: item.coordinates
            }
          }
          props.placeChange(selected, props.input, false)
        }}
        onChange={(event, value) => {
          //this.setState({ value })
          props.placeChange(event, props.input, true)
        }}
        renderItem={(item, isHighlighted) => (
          <div
            style={isHighlighted ? {...styles.item, background: 'lightgray'} : {...styles.item, background: 'white'}}
            key={item.abbr}
          >{item.name}</div>
        )}
        ref={el => this[`Autocomplete${props.input}`] = el}
      />
      <DatePicker
        selected={when}
        onChange={e => props.dateChange(e, props.input)}
        key={dpKey}
        minDate={pickerStart}
        maxDate={pickerEnd}
      />
      {(props.stop && props.stop.weather && props.stop.weather.length > 0) ? (
        <div className="location-forecast">{props.stop.weather[0].shortForecast}</div>
      ) : (
        <div className="location-forecast">
          ...forecast will load here.
        </div>
      )}
    </div>
  )
}

export default location
