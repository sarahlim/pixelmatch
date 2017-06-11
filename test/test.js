'use strict';

var PNG = require('pngjs').PNG,
  fs = require('fs'),
  test = require('tap').test,
  path = require('path'),
  match = require('../.');

diffTest('1a', '1b', '1diff', 0.05, false, 143);
diffTest('2a', '2b', '2diff', 0.05, false, 12439);
diffTest('3a', '3b', '3diff', 0.05, false, 212);
diffTest('4a', '4b', '4diff', 0.05, false, 36089);
diffTest('big1', 'big4', 'bigdiff', 0.05, false, 0, 0);

test('throws error if image sizes do not match', function(t) {
  t.throws(function() {
    match({
      img1: [1, 2, 3],
      img2: [1, 2, 3, 4],
      output: null,
      width: 2,
      height: 1,
    });
  }, /Image sizes do not match/);
  t.end();
});

function diffTest(
  imgPath1,
  imgPath2,
  diffPath,
  threshold,
  includeAA,
  expectedMismatch,
  maxDiff
) {
  var name =
    'comparing ' +
    imgPath1 +
    ' to ' +
    imgPath2 +
    ', threshold: ' +
    threshold +
    ', includeAA: ' +
    includeAA;

  test(name, function(t) {
    var img1 = readImage(imgPath1, function() {
      var img2 = readImage(imgPath2, function() {
        var expectedDiff = readImage(diffPath, function() {
          var diff = new PNG({ width: img1.width, height: img1.height });

          var mismatch = match({
            img1: img1.data,
            img2: img2.data,
            output: diff.data,
            width: diff.width,
            height: diff.height,
            options: {
              threshold: threshold,
              includeAA: includeAA,
              maxDiff: maxDiff,
            },
          });

          var mismatch2 = match({
            img1: img1.data,
            img2: img2.data,
            output: null,
            width: diff.width,
            height: diff.height,
            options: {
              threshold: threshold,
              includeAA: includeAA,
            },
          });

          t.same(diff.data, expectedDiff.data, 'diff image');
          t.same(mismatch, expectedMismatch, 'number of mismatched pixels');
          t.same(mismatch, mismatch2, 'number of mismatched pixels');

          t.end();
        });
      });
    });
  });
}

function readImage(name, done) {
  return fs
    .createReadStream(path.join(__dirname, '/fixtures/' + name + '.png'))
    .pipe(new PNG())
    .on('parsed', done);
}
