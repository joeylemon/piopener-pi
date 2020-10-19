import gpiop from 'rpi-gpio'

class Remote {
    constructor(pin) {
        this.pin = pin
        this.setup()
    }

    // Initialize the GPIO pin
    setup() {
        gpiop.setup(this.pin, gpiop.DIR_OUT, err => {
            if (err) { console.error(err); process.exit(1) }
        })
    }

    // Send a quick signal to the GPIO pin which will trigger the door remote
    trigger() {
        return new Promise((resolve, reject) => {
            gpiop.write(this.pin, true, err => {
                if (err) return reject(err)

                setTimeout(() => {
                    gpiop.write(this.pin, false)
                }, 1000)

                resolve()
            })
        })
    }
}

// Remote controlling the garage door
const REMOTE = new Remote(37)

export function move() {
    return REMOTE.trigger()
}