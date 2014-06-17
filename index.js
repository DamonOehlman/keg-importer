var request = require('request');
var JSONStream = require('JSONStream');
var toPullStream = require('stream-to-pull-stream');
var pull = require('pull-stream');
var res = request({ url: 'http://localhost:5984/npm/_all_docs?include_docs=true' });

pull(
  toPullStream.source(res.pipe(JSONStream.parse('rows.*'))),
  require('./process')()
);
