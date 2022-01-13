const express = require('express')
const app = express()
const bodyParser = require('body-parser')

var config = {
  host: 'localhost',
  port: 4003,
  timeout: 10000,
  verbose: true
}
var started = false

const whStore = {}

app.use(bodyParser.json())


const whRegisterHandler = function (req, res) {
  const whid = req.params.whid
  if(whStore[whid]) {
    const message = `Webhook id ${whid} already used and still pending`
    if (config.verbose) console.log(message)
    res.status(400).send({message})
  }
  else {
    if (config.verbose) console.log(`Webhook ${whid} registered, waiting to be called on http://${config.host}:${config.port}/webhooks/${whid}`)
    const timeoutId = setTimeout(function() {
      if (config.verbose) console.log(`Webhook ${whid} timed out after ${config.timeout}`)
      delete whStore[whid]
      res.sendStatus(503)
    }, config.timeout)

    const wh = {
      res,
      timeoutId
    }
    if (req.body !== undefined && req.body.headers !== undefined && Array.isArray(req.body.headers)) {
      wh.headers = headers
    }
    whStore[whid] = wh
  }
}

app.get('/register/:whid', whRegisterHandler)
app.post('/register/:whid', whRegisterHandler) //useful to accept an Array of header names in the body of the request

const whHandler = function(req, res) {
  const whid = req.params.whid
  const wh = whStore[whid]
  if (wh) {
    delete whStore[whid]
    clearTimeout(wh.timeoutId)
    const payload = {
      body: req.body || {}
    }
    if (wh.headers) {
      const headers = {}
      for (const headerName in wh.headers) {
        headers[headerName] = req.get(headerName) 
      }
      payload.headers = headers
    }
    if (config.verbose) console.log(`Webhook ${whid} just got called, sending the payload back`, payload)
    wh.res.send(payload)
    res.sendStatus(200)
  }
  else {
    if (config.verbose) console.log(`Webhook ${whid} just got called but could not be found`)
    res.sendStatus(404)
  }
}

app.get('/webhooks/:whid', whHandler)
app.post('/webhooks/:whid', whHandler)


const start = function(done) {
  const callback = function() {
    if (done) {
      const baseUrl = `http://${config.host}:${config.port}/`
      done({
        webhookBaseUrl: baseUrl + 'webhooks/',
        registerBaseUrl: baseUrl + 'register/'
      })
    }
  }

  if (started) {
    console.log(`Webhook tester app was already running on port ${config.port}!`)
    callback()
  }
  else {
    app.listen(config.port, function() {
      console.log(`Webhook tester app listening on port ${config.port}!`)
      started = true
      callback()
    })
  }
}

if (require.main === module) {
  console.log('Launching Webhook tester')
  start((urls) => {
    console.log(urls)
  })
}

module.exports = config
module.exports.start = start
