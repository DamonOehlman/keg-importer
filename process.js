var pull = require('pull-stream');

module.exports = pull.Sink(function(read) {

  function next(end, data) {
    if (end) {
      return;
    }

    console.log(data.doc.versions);
    read(null, next);
  }

  read(null, next);
});
