# webhook-tester
Simple express app to use for automated testing of webhooks

Use this package to test webhook calls that your app API is supposed to make.
A test sequence could be
 * register a webhook using your app API
 * register a webhook test on webhook-tester, this request will be pending
 * make a call to your API that is supposed to trigger the webhook call
 * the webhook test request will be called. If the webhook had a request body, you will get it as a response body

## Install
`npm install webhook-tester`

## Use
### Launching webhook-tester
You can either start webhook-tester on a separate terminal window, or require it in your tests. Don't do both :-)

#### Start in the terminal
`npm start`

#### Require in your test files
You only need to start it once but it doesn't matter if you call start multiple times.

```javascript
const webhookTester = require('webhook-tester');
webhookTester.port = 4003; // Optional. 4003 is the default
webhookTester.timeout = 10000; // in ms. Optional. 10000 is the default
webhookTester.verbose = false, // Boolean. Optional. Defaults to true. If true logs every register and webhook call
webhookTester.start(); // Required. You can optionnally pass a function to get the register and call urls
```


### Registering a webhook test

`GET http://localhost:4003/register/:webhook_id`

where `:webhook_id` is a unique id you assign to this webhook
This request will timeout after a maximum of a minute if the webhook is never called

### Registering a webhook on your app API
The Webhook url that needs to be called to get a successful response from the above test registered is

`http://localhost:4003/webhooks/:webhook_id`

where `:webhook_id` is the same unique id that you have registered above.
This url will accept `GET` and `POST` requests.
It can only be called one time per webhook test.
