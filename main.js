import { io } from 'socket.io-client'

import { SERVER_URL, SECRET } from './constants.js'
import * as door from './door.js'
import * as remote from './remote.js'

setInterval(door.checkForLongOpen, 30000)

const socket = io(SERVER_URL, {
    auth: {
        token: SECRET
    }
})

socket.on('connect', () => {
    console.log(`established connection to ${SERVER_URL}`)
})

socket.on('connect_error', err => {
    console.error(`could not connect to ${SERVER_URL}: ${err}`)
})

socket.on('move', async callback => {
    console.log("move garage")

    const result = await remote.move().catch(err => new Error(err))
    if (result instanceof Error)
        return callback(result.toString())

    callback("200 OK")
})

socket.on('get status', async callback => {
    console.log("retrieve garage status")

    const s = await door.getStatus().catch(err => new Error(err))
    if (s instanceof Error)
        return callback(s.toString())

    callback(s)
})