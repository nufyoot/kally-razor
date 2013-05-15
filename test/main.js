var chai = require('chai');
var KallyRazor = require('../lib/main');

var razor = KallyRazor();

var should = chai.should();

describe('KallyRazor', function() {
    describe('throws an error', function() {
        it('when not passing a view', function() { 
            should.Throw(function() { razor.render(); });
        });

        it('when not passing a string to render', function() {
            should.Throw(function() { razor.render({ File: 'test' }); });
        });
    });

    describe('compiles', function() {
        it('from a file', function() {
            var result = razor.render('view', 'blah');
            result.should.equal('blah');
        });
    });
});
