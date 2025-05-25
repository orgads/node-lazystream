const { Writable } = require('../lib/lazystream');
const { DummyWritable } = require('./helper');

exports.writable = {
  options: function(test) {
    test.expect(3);

    const writable = new Writable(function(options) {
       test.ok(this instanceof Writable, "Writable should bind itself to callback's this");
       test.equal(options.encoding, "utf-8", "Writable should make options accessible to callback");
       this.ok = true;
       return new DummyWritable([]);
    }, {encoding: "utf-8"});

    writable.write("test");

    test.ok(writable.ok);

    test.done();
  },
  dummy: function(test) {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];
    test.expect(0);

    const dummy = new DummyWritable(actual);

    expected.forEach(function(item) {
      dummy.write(Buffer.from(item));
    });
    test.done();
  },
  streams2: function(test) {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];
    let instantiated = false;

    test.expect(2);

    const writable = new Writable(function() {
      instantiated = true;
      return new DummyWritable(actual);
    });

    test.equal(instantiated, false, 'DummyWritable should only be instantiated when it is needed');

    writable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Writable should not change the data of the underlying stream');
      test.done();
    });
    expected.forEach(function(item) {
      writable.write(Buffer.from(item));
    });
    writable.end();
  }
};
