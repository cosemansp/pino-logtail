# pino-logtail

THIS IS WORK IN PROGRESS

## Usage:

```bash
# install globally
npm install @codevco/pino-logtail --global

# pipe stdio to pino-logtail
node app.js | pino-logtail --token=xxxxxx
```

## Options:

| Options       | Description              |
| ------------- | ------------------------ |
| --token       | the Logtail access token |
| --passThrough | pipe to stdout           |
| --debug       | dump raw logs messages   |

## Environment variables

You can also set the token via the following env var.

```bash
# pipe stdio to pino-logtail
export LOGTAIL_TOKEN=xxxxxx
node app.js | pino-logtail --passThrough | pino-pretty
```
