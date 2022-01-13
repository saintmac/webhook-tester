# 2.0.0
## New feature
When registering a webhook, you can now list headers that you want to get if they are present in the webhook call.

For that register using a `POST` instead of a `GET` and include an object as the payload of the POST.

That object should have a `headers` Array property that lists the names of the headers.
Ex: `{headers: ['Content-Type', 'Authorization']}`

## Breaking change
The response of the request to register for a webhook call doesn't return the body of the webhook call directly in the body of the response anymore.

Instead it returns an object with a `body` object property that contains that body.
That response object can also feature a `headers` object property that will contain headers that have been listed when registering the webhook