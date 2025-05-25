const { Readable, Writable } = require('readable-stream');

class DummyReadable extends Readable {
  constructor(strings) {
    super();
    this.strings = strings;
    this.emit('readable');
  }

  _read(n) {
    if (this.strings.length) {
      this.push(new Buffer(this.strings.shift()));
    } else {
      this.push(null);
    }
  }
}

class DummyWritable extends Writable {
  constructor(strings) {
    super();
    this.strings = strings;
    this.emit('writable');
  }

  _write(chunk, encoding, callback) {
    this.strings.push(chunk.toString());
    if (callback) callback();
  }
}

module.exports = {
  DummyReadable,
  DummyWritable
};

