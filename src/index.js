function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

const defaultOptions = {
  debug: false,
  automaticOpen: true,
  reconnectOnError: false,
  reconnectInterval: 1000,
  maxReconnectInterval: 30000,
  reconnectDecay: 1.5,
  timeoutInterval: 2000,
  maxReconnectAttempts: null,
  randomRatio: 3,
  binaryType: 'blob',
  reconnectOnCleanClose: false,
};

class ReconnectableWebSocket {
  CONNECTING = 0;

  OPEN = 1;

  CLOSING = 2;

  CLOSED = 3;

  FINAL_CLOSE = 4;

  constructor(url, protocols = [], options = {}) {
    this._url = url;
    this._protocols = protocols;
    this._options = { ...defaultOptions, ...options };
    this._messageQueue = [];
    this._reconnectAttempts = 0;
    this.readyState = this.CONNECTING;

    this.timeout = null;

    if (typeof this._options.debug === 'function') {
      this._debug = this._options.debug;
    } else if (this._options.debug) {
      this._debug = console.log.bind(console);
    } else {
      this._debug = function () { };
    }

    if (this._options.automaticOpen) this.open();
  }

  open = () => {
    this._socket = new WebSocket(this._url, this._protocols);
    const socket = this._socket;
    socket.binaryType = this._options.binaryType;

    if (this._options.maxReconnectAttempts && this._options.maxReconnectAttempts < this._reconnectAttempts) {
      return;
    }

    this._syncState();

    socket.onmessage = this._onmessage.bind(this);
    socket.onopen = this._onopen.bind(this);
    socket.onclose = this._onclose.bind(this);
    socket.onerror = this._onerror.bind(this);
  };

  send = (data) => {
    if (this._socket && this._socket.readyState === WebSocket.OPEN && this._messageQueue.length === 0) {
      this._socket.send(data);
    } else {
      this._messageQueue.push(data);
    }
  };

  close = (code, reason, finalClose = false) => {
    if (finalClose) {
      this.readyState = this.FINAL_CLOSE;
    }
    if (typeof code === 'undefined') code = 1000;

    if (this._socket) this._socket.close(code, reason);
  };

  heartbeatFailed = () => {
    this._syncState();
    this._tryReconnect({ wasClean: false });
  }

  _onmessage = (message) => {
    this.onmessage && this.onmessage(message);
  };

  _onopen = (event) => {
    this._syncState();
    this._flushQueue();

    if (!this._options.reconnectOnCleanClose) {
      this._reconnectAttempts = 0;
    }

    this.onopen && this.onopen(event);
  };

  _onclose = (event) => {
    const shouldTryReconnect = this.readyState !== this.FINAL_CLOSE;

    this._syncState();
    this._debug('WebSocket: connection is broken', event);

    this.onclose && this.onclose(event);

    if (shouldTryReconnect) {
      this._tryReconnect(event);
    }
  };

  _onerror = (event) => {
    // To avoid undetermined state, we close socket on error
    this._socket.close();

    this._debug('WebSocket: error', event);
    this._syncState();

    this.onerror && this.onerror(event);

    if (this._options.reconnectOnError) this._tryReconnect(event);
  };

  _tryReconnect = (event) => {
    if (event.wasClean && !this._options.reconnectOnCleanClose) {
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (this.readyState === this.CLOSING || this.readyState === this.CLOSED) {
        this._reconnectAttempts++;
        this.open();
      }
    }, this._getTimeout());
  };

  _flushQueue = () => {
    while (this._messageQueue.length !== 0) {
      const data = this._messageQueue.shift();
      this._socket.send(data);
    }
  };

  _getTimeout = () => {
    let timeout = this._options.reconnectInterval * Math.pow(this._options.reconnectDecay, this._reconnectAttempts);
    timeout = timeout > this._options.maxReconnectInterval ? this._options.maxReconnectInterval : timeout;
    return this._options.randomRatio ? getRandom(timeout / this._options.randomRatio, timeout) : timeout;
  };

  _syncState = () => {
    this.readyState = this._socket.readyState;
  };
}

export default ReconnectableWebSocket;
