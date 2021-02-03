import React, { Component } from 'react'
import moment from 'moment'
import axios from 'axios'
import 'react-dates/initialize'
import { DayPickerSingleDateController } from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'
import './style.css'
import 'kbrinl-design-system/dist/css/style.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      date: null,
      err: null,
      isFetchingDates: true,
      isFetchingTimes: false,
      currentMonth: moment(),
      availableDates: [],
      availableTimes: [],
      focus: true
    }

    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleMonthChange = this.handleMonthChange.bind(this)
    this.isDayBlocked = this.isDayBlocked.bind(this)
  }

  handleDateChange (date) {
    this.setState({
      date
    })
    this.getAvailableTimes(date)
  }

  handleMonthChange (month) {
    this.setState({
      currentMonth: month.format('YYYY-MM')
    })

    this.getAvailableDates(month)
  }

  getAvailableDates (month) {
    this.setState({
      isFetchingDates: true
    })
    const getDatesUrl = `http://localhost:3000/api/v1/appointment/availability/dates?month=${month.format(
      'YYYY-MM'
    )}`
    axios
      .get(getDatesUrl)
      .then(res => {
        const { dates } = res.data
        this.setState({
          availableDates: dates.map(date => date.date),
          isFetchingDates: false
        })
      })
      .catch(err => {
        this.setState({
          err: err
        })
      })
  }

  getAvailableTimes (date) {
    this.setState({
      isFetchingTimes: true
    })
    const getTimesUrl = `http://localhost:3000/api/v1/appointment/availability/times?date=${date.format(
      'YYYY-MM-DD'
    )}`
    axios
      .get(getTimesUrl)
      .then(res => {
        const { times } = res.data
        this.setState({
          availableTimes: times.map(time => time.time)
        })
      })
      .catch(err => {
        this.setState({
          err: err
        })
      })
  }

  isDayBlocked (day) {
    if (this.state.isFetchingDates) {
      return true
    }
    return !this.state.availableDates.some(date => day.isSame(date, 'day'))
  }

  componentDidMount () {
    this.getAvailableDates(this.state.currentMonth)
  }

  render () {
    return (
      <div className="app">
        <div className="calendar">
          <div className="DayPicker__container">
            <span className="h5 DayPicker__instruction-date instruction">
              1. Pilih tanggal yang tersedia
            </span>
            <DayPickerSingleDateController
              date={this.state.date} // momentPropTypes.momentObj or null
              noBorder={true}
              onDateChange={date => this.handleDateChange(date)} // PropTypes.func.isRequired
              onNextMonthClick={month => this.handleMonthChange(month)}
              onPrevMonthClick={month => this.handleMonthChange(month)}
              isDayBlocked={day => this.isDayBlocked(day)}
              isOutsideRange={d =>
                d.isBefore(moment()) || d.isAfter(moment().add(8, 'month'))
              }
              focused={this.state.focused} // PropTypes.bool
              onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
            />
          </div>
          <div className="legend">
            <div className="legend-box__container">
              <div className="legend-box legend-box__available"></div>
              <small className="legend-box__label">Tersedia</small>
            </div>
            <div className="legend-box__container">
              <div className="legend-box legend-box__unavailable"></div>
              <small className="legend-box__label">Penuh</small>
            </div>
          </div>
        </div>
        <div className="times">
          <div className="times__container">
            <span className="h5 instruction">2. Pilih jam janji</span>
            <div className="times-list">
                {this.state.availableTimes.map((val, idx) => {
                  return <div className="time-container">
                    <input className="button__radio"
                      type="radio"
                      name="appointmentdatetime"
                      id={idx}
                      value={val}
                    />
                    <label
                      className="button button--secondary button--toggle"
                      htmlFor={idx}
                    >
                    { moment(val).format('HH:mm') }
                    </label>
                  </div>
                })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
