var KallyRazor = require('../lib/main');
var Parser = require('../lib/parser');

var razor = KallyRazor();
var parser = Parser();
var start;
var contents;
var i;

start = Date.now();
contents = "This is a very small test @model.name";
for (i = 0; i < 1000000; i++) {
    parser.parseRazorContents(contents);
}
console.log('Parsing razor contents ' + i + ' times in ' + (Date.now() - start) + ' ms');