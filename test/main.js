var libPath = process.env['KALLY_RAZOR_COV'] ? '../lib-cov/' : '../lib/';
var chai = require('chai');
var KallyRazor = require(libPath + 'main');
var Parser = require(libPath + 'parser');
var fs = require('fs');

var razor = new KallyRazor({
    root: __dirname
});
var parser = new Parser();

var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

chai.Assertion.includeStack = true;

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

        it('when a null file name is passed', function() {
            should.Throw(function() { razor.renderFromFile(); });
        });

        it('when a razor token doesnt start with @', function() {
            should.Throw(function() { parser.parseRazorToken({ currentChar: function() { return 't'; } }); });
        });

        it('when starting a section without ( or {', function() {
            should.Throw(function() { parser.parseRazorSection({ currentChar: function() { return 't'; }, pos: 0 }); });
        });

        it('when render body is called without being opened', function() {
            should.Throw(function() { parser.parseRazorToken(parser.createIterator('@renderBody')); }, 'Expected "(" after "renderBody".');
        });
        
        it('when render body is called without being closed', function() {
            should.Throw(function() { parser.parseRazorToken(parser.createIterator('@renderBody(')); }, 'Expected ")" after "renderBody".');
        });

        it('when a large depth is reached', function() {
            var razor = KallyRazor({
                root: __dirname,
                layout: 'input/test-basic-layout.html'
            })
            should.Throw(function() { razor.renderFromString('Test', null, null); }, 
                'More than 50 layers of layouts.  Make sure the parent layout has "@{ layout = null; }" at the beginning of the file.');
        });
    });

    describe('compiles', function() {
        describe('from a file', function() {
            it('using the exact file name', function() {
                var result = razor.render(__dirname + '/input/test-no-razor.html');
                result.should.equal(fs.readFileSync(__dirname + '/output/test-no-razor.html').toString());
            });

            it('using relative file names', function() {
                var result = razor.render('input/test-no-razor.html');
                result.should.equal(fs.readFileSync(__dirname + '/output/test-no-razor.html').toString());
            });
        });

        describe('using razor', function() {
            it('wth a basic model', function() {
                var result = razor.render('input/test-basic-model.html', { name: 'Testy Tester' });
                result.should.equal(fs.readFileSync(__dirname + '/output/test-basic-model.html').toString());
            });

            it('with multiple references', function() {
                var result = razor.render('input/test-multiple-references.html', { name: 'Testy Tester', title: 'my title' });
                result.should.equal(fs.readFileSync(__dirname + '/output/test-multiple-references.html').toString());
            })

            it('with a razor section', function() {
                var result = razor.render('input/test-razor-section.html');
                result.should.equal(fs.readFileSync(__dirname + '/output/test-razor-section.html').toString());
            });

            it('with a razor section respecting scope', function() {
                var result = razor.render('input/test-razor-section-scope.html');
                result.should.equal(fs.readFileSync(__dirname + '/output/test-razor-section-scope.html').toString());
            });

            it('with unicode identifiers', function() {
                var result = razor.render('input/test-unicode-names.html', { ಠ_ಠ: 'Unicode' });
                result.should.equal(fs.readFileSync(__dirname + '/output/test-unicode-names.html').toString());
            });

            it('with only a razor token', function() {
                var result = razor.renderFromString('@model.name', { name: 'Only Razor' });
                result.should.equal('Only Razor');
            });

            it('with razor token as last token', function() {
                var result = razor.renderFromString('Test @model.name', { name: 'Make it up' });
                result.should.equal('Test Make it up');
            });

            it('with razor token as first token', function() {
                var result = razor.renderFromString('@model.name rules', { name: 'KallyRazor' });
                result.should.equal('KallyRazor rules');
            });

            describe('with only a razor section', function() {
                it('using ()', function() {
                    var result = razor.renderFromString('@(model.name + " yep")', { name: 'KallyRazor' });
                    result.should.equal('KallyRazor yep');
                });

                it('using {}', function() {
                    var result = razor.renderFromString('@{model.name = model.name + " yep";}', { name: 'KallyRazor' });
                    result.should.equal('');
                });
            });

            describe('with razor section as last token', function() {
                it('using ()', function() {
                    var result = razor.renderFromString('Testing @(model.name + " yep")', { name: 'KallyRazor' });
                    result.should.equal('Testing KallyRazor yep');
                });

                it('using {}', function() {
                    var result = razor.renderFromString('Testing @{model.name = model.name + " yep";}', { name: 'KallyRazor' });
                    result.should.equal('Testing ');
                });
            });

            describe('with razor section as first token', function() {
                it('using ()', function() {
                    var result = razor.renderFromString('@(model.name + " yep") Testing', { name: 'KallyRazor' });
                    result.should.equal('KallyRazor yep Testing');
                });

                it('using {}', function() {
                    var result = razor.renderFromString('@{model.name = model.name + " yep";} Testing', { name: 'KallyRazor' });
                    result.should.equal(' Testing');
                });
            });
        });
    });

    describe('parses', function() {
        it('double @@', function() {
            var result = parser.parseRazorToken({ 
                contents: '@@',
                pos: 0,
                currentChar: function() { return this.contents[this.pos]; }, 
                next: function() { return ++this.pos < this.contents.length; } 
            });
            result.contents.should.equal('@');
        });
    });
});
