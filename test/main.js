var chai = require('chai');
var KallyRazor = require('../lib/main');

var razor = KallyRazor();

chai.should();

describe('KallyRazor', function() {
    describe('compiles', function() {
        it('from a file', function() {
            var result = razor.render('view', 'blah');
            result.should.equal('blah');
        });
    });
});
