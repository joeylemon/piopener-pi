import * as constants from './constants.js'
import gpiop from 'rpi-gpio'
import request from 'request'

// How often to send request to server with new state (milliseconds)
const UPDATE_FREQ = 4000

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