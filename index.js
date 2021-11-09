#!/usr/bin/env node

const pump = require('pump');
const Pino = require('pino');
const split = require('split2');
const through = require('through2');
const argv = require('args-parser')(process.argv);
const LogTail = require('./logtail');
const { Writable } = require('stream');

const token = process.env.LOGTAIL_TOKEN || argv.token || '';
if (token === '') {
  console.warn('Missing API Token. Use --token=xxxx');
  process.exit();
}

const logger = new LogTail(token, { debug: argv.debug });
const levels = Pino.levels.labels;

function safeParse(src) {
  try {
    return JSON.parse(src);
  } catch (error) {
    return { msg: src, level: '10' };
  }
}

function handleLog(log, cb) {
  const { level, msg = '', ...params } = log;
  logger.log(msg, levels[level] || 'info', params);
  cb();
}

const transport = through.obj((log, _enc, callback) => {
  handleLog(log, callback);
});

const nullStream = new (class extends Writable {
  _write = () => {};
})();
const next = argv.passThrough ? process.stdout : nullStream;

pump(process.stdin, split(safeParse), transport);
pump(process.stdin, next);
