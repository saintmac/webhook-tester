const express = require('express')
const app = express()
const bodyParser = require('body-parser')

exports.port = 4003
exports.timeout = 60000
var started = false

const whStore = {}

app.use(bodyParser.json())

app.get('/register/:whid', function (req, res) {
  const whid = req.params.whid
  if(whStore[whid]) {
    const message = `Webhook id ${whid} already used and still pending`
    console.log(message)
    res.status(400).send({message})
  }
  else {
    console.log(`Webhook ${whid} registered, waiting to be called on http://localhost:${exports.port}/webhooks/${whid}`)
    const timeoutId = setTimeout(function() {
      console.log(`Webhook ${whid} timed out after ${exports.timeout}`)
      delete whStore[whid]
      res.sendStatus(503)
    }, exports.timeout)

    whStore[whid] = {
      res,
      timeoutId
    }
  }
})

const whHandler = function(req, res) {
  const whid = req.params.whid
  const wh = whStore[whid]
  if (wh) {
    delete whStore[whid]
    clearTimeout(wh.timeoutId)
    const payload = req.body || {}
    console.log(`Webhook ${whid} just go called, sending the payload back`, payload)
    wh.res.send(payload)
    res.sendStatus(200)
  }
  else {
    console.log(`Webhook ${whid} just got called but could not be found`)
    res.sendStatus(404)
  }
}

app.get('/webhooks/:whid', whHandler)
app.post('/webhooks/:whid', whHandler)


const start = function(done) {
  const callback = function() {
    if (done) {
      const baseUrl = `http://localhost:${exports.port}/`
      done({
        webhookBaseUrl: baseUrl + 'webhooks/',
        registerBaseUrl: baseUrl + 'register/'
      })
    }
  }

  if (started) {
    console.log(`Webhook tester app was already running on port ${exports.port}!`)
    callback()
  }
  else {
    app.listen(exports.port, function() {
      console.log(`Webhook tester app listening on port ${exports.port}!`)
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

exports.start = start
