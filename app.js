const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 4003

const timeoutDuration = 60000 // in ms
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
    console.log(`Webhook ${whid} registered, waiting to be called on http://localhost:${port}/webhooks/${whid}`)
    const timeoutId = setTimeout(function() {
      console.log(`Webhook ${whid} timed out after ${timeoutDuration}`)
      delete whStore[whid]
      res.sendStatus(503)
    }, timeoutDuration)

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

app.listen(port, function() {
  console.log("Webhook tester app listening on port 4003!")
})
