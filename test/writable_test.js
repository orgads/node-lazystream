const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { Writable } = require('../lib/lazystream');
const { DummyWritable } = require('./helper');

describe('writable', () => {
  test('options', () => {
    const writable = new Writable(function(options) {
       assert.ok(this instanceof Writable, "Writable should bind itself to callback's this");
       assert.equal(options.encoding, "utf-8", "Writable should make options accessible to callback");
       this.ok = true;
       return new DummyWritable([]);
    }, {encoding: "utf-8"});

    writable.write("test");

    assert.ok(writable.ok);
  });

  test('dummy', () => {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];
    const dummy = new DummyWritable(actual);

    expected.forEach(function(item) {
      dummy.write(Buffer.from(item));
    });
  });

  test('streams2', async () => {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];
    let instantiated = false;

    const writable = new Writable(function() {
      instantiated = true;
      return new DummyWritable(actual);
    });

    assert.equal(instantiated, false, 'DummyWritable should only be instantiated when it is needed');

    return new Promise((resolve) => {
      writable.on('end', function() {
        assert.equal(actual.join(''), expected.join(''), 'Writable should not change the data of the underlying stream');
        resolve();
      });
      expected.forEach(function(item) {
        writable.write(Buffer.from(item));
      });
      writable.end();
    });
  });
});
