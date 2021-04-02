import * as constants from './constants.js'
import gpiop from 'rpi-gpio'
import request from 'request'

// How often to send request to server with new state (milliseconds)
const UPDATE_FREQ = 4000

// The last time the garage door has been observed to be open
let lastClosedTime = Date.now()

// The last time a long open notification was sent
let lastNotification = 0

class Switch {
    constructor(pin) {
        this.pin = pin
        this.lastChange = 0
        this.lastState = true
        this.setup()
    }

    setup() {
        gpiop.setup(this.pin, gpiop.DIR_IN, gpiop.EDGE_BOTH, err => {
            if (err && err !== null && err !== "") {
                console.error(err)
                process.exit(1)
            }
        })
    }

    value() {
        return new Promise((resolve, reject) => {
            gpiop.read(this.pin, (err, val) => {
                if (err && err !== null && err !== "")
                    return reject(err)

                resolve(val)
            })
        })
    }

    onChange(newValue) {
        if (Date.now() - this.lastChange < UPDATE_FREQ || newValue === null)
            return

        this.lastChange = Date.now()

        // Don't send request if state hasn't changed
        if (this.lastState === newValue)
            return

        console.log(`pin ${this.pin} changed from ${this.lastState} to ${newValue}`)

        this.lastState = newValue

        request(`https://jlemon.org/garage/history/add/${constants.OTHER_TOKEN}/${newValue ? "open" : "closed"}`, (error, response, body) => {
            if (error || response.statusCode != 200)
                console.error(error)
        })
    }
}

// Switches on the GPIO pins corresponding to position on garage door frame
const switches = {
    open: new Switch(11),
    closed: new Switch(15)
}

// Listen for new readings on the switch
gpiop.on('change', (channel, value) => {
    if (channel !== switches.closed.pin) return
    switches.closed.onChange(value)
})

export async function getStatus() {
    const closed = await switches.closed.value().catch(err => new Error(err))
    if (closed instanceof Error) return closed
    else if (closed) return "closed"

    const open = await switches.open.value().catch(err => new Error(err))
    if (open instanceof Error) return open
    else if (!open) return "open"

    return "between"
}

export async function checkForLongOpen() {
    const closed = await switches.closed.value().catch(err => new Error(err))
    if (closed instanceof Error) {
        lastClosedTime = Date.now()
        return console.error(`couldn't check for long open status: ${closed.toString()}`)
    }

    const openDuration = Date.now() - lastClosedTime
    const lastAlertDuration = Date.now() - lastNotification

    // Send a notification if the door has been open for more than the specified duration
    // and there hasn't been too many notifications recently
    if (!closed && openDuration > constants.LONG_OPEN_DURATION && lastAlertDuration > constants.LONG_OPEN_DURATION * 2) {
	console.log("send long open notification")
        request(`https://jlemon.org/garage/sendopenalert/${openDuration}/${constants.OTHER_TOKEN}`, (error, response, body) => {
            if (error || response.statusCode != 200)
                console.error(error)
        })
        lastNotification = Date.now()
    } else if (closed) {
        lastClosedTime = Date.now()
        lastNotification = 0
    }
}
