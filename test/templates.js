var libPath = process.env['KALLY_RAZOR_COV'] ? '../lib-cov/' : '../lib/';
var chai = require('chai');
var KallyRazor = require(libPath + 'main');
var Parser = require(libPath + 'parser');
var fs = require('fs');

var should = chai.should();

describe('Templating', function() {
    describe('compiles', function() {
        it('with basic layout', function() {
            var razor = KallyRazor({
                root: __dirname,
                layout: "input/_test-basic-layout.html"
            });
            var result = razor.render('input/test-basic-layout.html');
            result.should.equal(fs.readFileSync(__dirname + '/output/test-basic-layout.html').toString());
        });

        it('with layout sections', function() {
            var razor = KallyRazor({
                root: __dirname,
                layout: "input/_test-layout-sections.html"
            });
            var result = razor.render('input/test-layout-sections.html');
            result.should.equal(fs.readFileSync(__dirname + '/output/test-layout-sections.html').toString());
        });
    });
});