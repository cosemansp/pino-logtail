const { Base } = require('@logtail/core');
const fetch = require('cross-fetch');
const { encode } = require('@msgpack/msgpack');

/*
  options: {
    endpoint: "https://in.logtail.com",
    // Maximum number of logs to sync in a single request to Logtail.com
    batchSize: 1000,
    // Max interval (in milliseconds) before a batch of logs proceeds to syncing
    batchInterval: 1000,
    // Maximum number of sync requests to make concurrently
    syncMax: 5,
    // If true, errors/failed logs should be ignored
    ignoreExceptions: true
    // debug
    debug: false
  }
*/
class LogTail extends Base {
  constructor(sourceToken, options) {
    super(sourceToken, options);

    const sync = async (logs) => {
      // Sync function
      if (this._options.debug) {
        console.log('logTail ', logs);
      }
      const body = this.encodeAsMsgpack(logs);
      const res = await fetch(this._options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/msgpack',
          Authorization: `Bearer ${this._sourceToken}`,
          'User-Agent': 'logtail-js(node)',
        },
        body,
      });

      if (res.ok) {
        return logs;
      }

      throw new Error(res.statusText);
    };

    // Set the throttled sync function
    this.setSync(sync);
  }

  async log(message, level, context) {
    // Process/sync the log
    const processedLog = await super.log(message, level, { context });

    // Push the processed log to the stream, for piping
    if (this._writeStream) {
      this._writeStream.write(JSON.stringify(processedLog) + '\n');
    }

    // Return the transformed log
    return processedLog;
  }

  pipe(stream) {
    this._writeStream = stream;
    return stream;
  }

  encodeAsMsgpack(logs) {
    const logsWithISODateFormat = logs.map((log) => ({ ...log, dt: log.dt.toISOString() }));
    const encoded = encode(logsWithISODateFormat);
    const buffer = Buffer.from(encoded.buffer, encoded.byteOffset, encoded.byteLength);
    return buffer;
  }
}
module.exports = LogTail;
