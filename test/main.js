var chai = require('chai');
var KallyRazor = require('../lib/main');

var razor = KallyRazor({
    root: __dirname
});

var should = chai.should();

describe('KallyRazor', function() {
    describe('throws an error', function() {
        it('when not passing a view', function() { 
            should.Throw(function() { razor.render(); });
        });

        it('when not passing a string to render', function() {
            should.Throw(function() { razor.render({ File: 'test' }); });
        });

        it('when a file does not exist', function() {
            should.Throw(function() { razor.render('file-does-not-exist.html'); });
        });
    });

    describe('compiles', function() {
        describe('from a file', function() {
            it('using the exact file name', function() {
                var result = razor.render(__dirname + '/input/test-no-razor.html');
                result.should.equal('it exists');
            });

            it('using relative file names', function() {
                var result = razor.render('input/test-no-razor.html');
                result.should.equal('it exists');
            });
        });
    });
});
