import * as routes from './routes.js'
import * as constants from './constants.js'
import * as door from './door.js'
import schedule from 'node-schedule'
import request from 'request'
import express from 'express'

const app = express()

// Update the network's public IP on the server side every day at midnight.
// This ensures the server always has the latest IP address even after the ISP renews it.
schedule.scheduleJob('0 0 * * *', () => {
    request(
        { url: `https://jlemon.org/garage/updateip/${constants.OTHER_TOKEN}` },
        (error, response, body) => {
            if (error || response.statusCode != 200) {
                console.log("could not send update ip request")
                return
            }

            console.log("sent update ip request")
        })
})

setInterval(door.checkForLongOpen, 30000)

app.get('/status/:token', routes.auth, routes.status)
app.get('/move/:token', routes.auth, routes.move)

const server = app.listen(4055, function () {
    console.log(`Listening on port ${server.address().port}`)
})