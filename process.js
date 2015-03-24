var async = require('async');
var pull = require('pull-stream');
var request = require('request');
var slim = require('slimver');

module.exports = pull.Sink(function(read) {

  var count = 0;

  function insertPackage(data, callback) {
    var version = slim(data.version);

    if (version === null) {
      console.log(data.name + '@' + data.version);
      return callback();
    }

    request({
      method: 'PUT',
      uri: 'http://localhost:6700/npm/' + data.name + '/' + data.version,
      body: JSON.stringify(data)
    }, function(err, res, body) {
      if (res.statusCode === 200 || res.statusCode === 412) {
        return callback();
      }
      else {
        console.log('invalid package version: ' + data.name + '@' + data.version, res.statusCode);
      }

      return callback(err);
    })
  }

  function next(end, data) {
    var doc = data && data.doc;
    var versions;

    if (end) {
      console.log('read ' + count + ' versions');
      return;
    }

    // if we have no doc, or versions, then continue to the next item
    if ((! doc) || (! doc.versions)) {
      return read(null, next);
    }

    // extract the versions
    versions = Object.keys(data.doc.versions).map(function(key) {
      return data.doc.versions[key];
    });

    count += versions.length;
    async.forEach(versions, insertPackage, function(err) {
      read(err, next);
    });
  }

  read(null, next);
});
