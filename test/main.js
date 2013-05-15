var should = require('should');
var kallyRazor = require('../lib/main');

describe('kallyRazor', function() {
    describe('with no arguments', function() {
        it('returns an empty array', function() {
            var result = kallyRazor();
            result.should.eql([]);
        });
    });
});
