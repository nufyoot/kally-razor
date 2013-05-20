var fs = require('fs');
var Parser = require('./parser.js');
var parser = Parser();

module.exports = function(config) {
    config = config || {
        root: __dirname,
        layout: null
    };

    return {
        render: function(view, model, body, depth) {
            if (!view) {
                throw new Error("You must specify the view to be rendered.");
            }

            depth = depth || 0;
            if (depth > 50) {
                // Seriously, if you're doing a template system that is 50 layouts deep you're doing something wrong...
                throw new Error('More than 50 layers of layouts.  Make sure the parent layout has "@{ layout = null; }" at the beginning of the file.')
            }

            if ('string' === typeof view) {
                return this.renderFromFile(view, model, body, depth)
            }

            throw new Error("I've not implemented another path for views.  Please specify a file name for the view as a string.");
        },

        renderFromFile: function(fileName, model, body, depth) {
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

            return this.renderFromString(fs.readFileSync(fileName).toString(), model, body, depth);
        },

        renderFromString: function(contents, model, body, depth) {
            var funcResult = this.parse(contents);
            var result = funcResult.render(model, body);

            if (result.layout) {
                return this.render(result.layout, model, function() {
                    return result.contents;
                }, depth + 1);
            }
            return result.contents;
        },

        parse: function(contents) {
            var tokens = parser.parseRazorContents(contents);
            var result = '(function() { return { render: function(model, renderBody) { var r = "";';

            // Add the default layout
            if (config.layout) {
                result += 'layout = "' + config.layout + '";'
            } else {
                result += 'layout = null;';
            }

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (token.type == 'string') {
                    var temp = token.contents.replace(/\"/gm, '\\"').replace(/\n/gm, '\\n');
                    if (temp) result += 'r+="' + temp + '";';
                } else if (token.type == 'razor') {
                    result += 'r+=' + token.token + ';';
                } else if (token.type == 'razor section') {
                    result += token.section;
                }
            }

            result += 'return { contents: r, layout: layout }; } } })();';

            return eval(result);
        }
    }
}
