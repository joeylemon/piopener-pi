import * as door from './door.js'
import * as remote from './remote.js'
import * as constants from './constants.js'

export function auth(req, res, next) {
    if (req.params.token && req.params.token === constants.SECRET)
        return next()

    return res.status(401).send(constants.ERR_UNAUTHORIZED)
}

export async function status(req, res) {
    const s = await door.getStatus().catch(err => new Error(err))
    if (s instanceof Error)
        return res.status(500).send(s)

    return res.status(200).send(s)
}

export async function move(req, res) {
    const result = await remote.move().catch(err => new Error(err))
    if (result instanceof Error)
        return res.status(500).send(result)

    return res.status(200).send("200 OK")
}