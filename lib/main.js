var fs = require('fs');
var Parser = require('./parser.js');
var parser = Parser();

module.exports = function(config) {
    config = config || {
        root: __dirname
    };

    return {
        render: function(view, model) {
            if (!view) {
                throw new Error("You must specify the view to be rendered.");
            }

            if ('string' === typeof view) {
                return this.renderFromFile(view, model)
            }

            throw new Error("I've not implemented another path for views.  Please specify a file name for the view as a string.");
        },

        renderFromFile: function(fileName, model) {
            if (!fileName) {
                throw new Error("You must specify the file name to be rendered.");
            }

            var checkedFiles = [];
            if (!fs.existsSync(fileName)) {
                checkedFiles.push(fileName);

                fileName = config.root + (fileName[0] == '/' ? '' : '/') + fileName;
                if (!fs.existsSync(fileName)) {
                    checkedFiles.push(fileName);

                    throw new Error("No such view found.  Searched paths: \n" + checkedFiles.join('\n'));
                }
            }

            return this.renderFromString(fs.readFileSync(fileName).toString(), model);
        },

        renderFromString: function(contents, model) {
            var funcResult = this.parse(contents);
            return funcResult.render(model);
        },

        parse: function(contents) {
            var tokens = parser.parseRazorContents(contents);
            var result = '(function() { return { render: function(model) { var r = "";';

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (token.type == 'string') {
                    var temp = token.contents.replace(/\"/gm, '\\"').replace(/\n/gm, '\\n');
                    if (temp) result += 'r+="' + temp + '";';
                } else if (token.type == 'razor') {
                    result += 'r+=' + token.token + ';';
                }
            }

            result += 'return r; } } })();';

            return eval(result);
        }
    }
}
