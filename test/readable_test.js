const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('../lib/lazystream');
const { DummyReadable } = require('./helper');

describe('readable', () => {
  test('dummy', async () => {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];

    return new Promise((resolve) => {
      new DummyReadable([].concat(expected))
        .on('data', function(chunk) {
          actual.push(chunk.toString());
        })
        .on('end', function() {
          assert.equal(actual.join(''), expected.join(''), 'DummyReadable should produce the data it was created with');
          resolve();
        });
    });
  });

  test('options', () => {
    const readable = new Readable(function(options) {
       assert.ok(this instanceof Readable, "Readable should bind itself to callback's this");
       assert.equal(options.encoding, "utf-8", "Readable should make options accessible to callback");
       this.ok = true;
       return new DummyReadable(["test"]);
    }, {encoding: "utf-8"});

    readable.read(4);

    assert.ok(readable.ok);
  });

  test('streams2', async () => {
    const expected = [ 'line1\n', 'line2\n' ];
    const actual = [];
    let instantiated = false;

    const readable = new Readable(function() {
      instantiated = true;
      return new DummyReadable([].concat(expected));
    });

    assert.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    return new Promise((resolve) => {
      readable.on('readable', function() {
        let chunk;
        while ((chunk = readable.read())) {
          actual.push(chunk.toString());
        }
      });
      readable.on('end', function() {
        assert.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
        resolve();
      });

      readable.read(0);
    });
  });

  test('resume', async () => {
    const expected = [ 'line1\n', 'line2\n' ];
    let actual = [];
    let instantiated = false;

    const readable = new Readable(function() {
      instantiated = true;
      return new DummyReadable([].concat(expected));
    });

    readable.pause();

    assert.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    return new Promise((resolve) => {
      readable.on('data', function(chunk) {
        actual.push(chunk.toString());
      });
      readable.on('end', function() {
        assert.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
        resolve();
      });

      readable.resume();
    });
  });
});
