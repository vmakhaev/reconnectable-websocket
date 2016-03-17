# reconnectable-websocket

Reconnectable websocket

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


## Installation

```
npm install reconnectable-websocket
```

## Usage

```js
import ReconnectableWebSocket from 'reconnectable-websocket'

let socket = new ReconnectableWebSocket(url, protocols, options)
```


#### `url`
- The URL you are connecting to.
- http://dev.w3.org/html5/websockets/#the-websocket-interface

#### `protocols`
- Optional string or array of protocols per the WebSocket spec.
- [http://dev.w3.org/html5/websockets/#refsWSP

#### `options`
- Options (see below)

### Options

Options can either be passed as the 3rd parameter upon instantiation or set directly on the object after instantiation:

```js
let socket = new ReconnectableWebSocket(url, null, {reconnectInterval: 3000});
```

#### `debug`
- Whether this instance should log debug messages or not. Debug messages are printed to `console.debug()`.
- Accepts `true` or `false`
- Default value: `false`

#### `automaticOpen`
- Whether or not the websocket should attempt to connect immediately upon instantiation. The socket can be manually opened or closed at any time using ws.open() and ws.close().
- Accepts `true` or `false`
- Default value: `true`

#### `reconnectOnError`
- Whether or not the websocket tries to reconnect on error
- Accepts `true` or `false`
- Default value: `false`

#### `reconnectInterval`
- The number of milliseconds to delay before attempting to reconnect.
- Accepts `integer`
- Default: `1000`

#### `maxReconnectInterval`
- The maximum number of milliseconds to delay a reconnection attempt.
- Accepts `integer`
- Default: `30000`

####`reconnectDecay`
- The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
- Accepts `integer` or `float`
- Default: `1.5`

#### `timeoutInterval`
- The maximum time in milliseconds to wait for a connection to succeed before closing and retrying.
- Accepts `integer`
- Default: `2000`

#### `maxReconnectAttempts`
- The maximum number of reconnection attempts that will be made before giving up. If null, reconnection attempts will be continue to be made forever.
- Accepts `integer` or `null`.
- Default: `null`

#### `randomRatio`
- Actual timeout is calculation like `randomBetween(timeout / randomRatio, timeout)`. If null, just uses non-random timeout.
- Accepts `integer`.
- Default: `3`

#### `binaryType`
- The binary type is required by some applications.
- Accepts strings `'blob'` or `'arraybuffer'`.
- Default: `'blob'`

#### `reconnectOnCleanClose`
- Should the connection attempt to reconnect on a clean close. This is used in the case of a server initiated close event.
- Accepts `true` or `false`
- Default: `false`
---

### Methods

#### `ws.open()`
- Open the Reconnecting Websocket

#### `ws.close(code, reason)`
- Closes the WebSocket connection or connection attempt, if any. If the connection is already CLOSED, this method does nothing.
- `code` is optional the closing code (default value 1000). [https://tools.ietf.org/html/rfc6455#section-7.4.1](https://tools.ietf.org/html/rfc6455#section-7.4.1)
- `reason` is the optional reason that the socket is being closed. [https://tools.ietf.org/html/rfc6455#section-7.1.6](https://tools.ietf.org/html/rfc6455#section-7.1.6)

#### `ws.send(data)`
- Transmits data to the server over the WebSocket connection.
- Accepts @param data a text string, ArrayBuffer or Blob

## License

MIT
