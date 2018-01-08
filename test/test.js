const webhookTester = require('../app')
webhookTester.start(function(urls) {
  console.log("I got called back", urls)
  process.exit(0)
})
