/*jslint nomen: false, sloppy: false */

var fs = require('fs');
var path = require('path');
var Parser = require('./parser.js');
var parser = new Parser();

var ViewBag = {};
var	Url = {
	baseUrl: '',
	Content : function(url) {
				return url.replace('~',Url.baseUrl).toLowerCase();
			}
		};

module.exports = function (config) {
    config = config || {
        root: __dirname,
        layout: null,
    };

    Url.baseUrl = config.baseUrl || '';

    var cachedFiles = {};

    return {
		renderCached: function(view, params) {
			return render(view, undefined, undefined, undefined, 0, usecache);
		},

        render: function(view, model, body, sections, depth, usecache) {
            if (!view) {
                throw new Error("You must specify the view to be rendered.");
            }

            depth = depth || 0;
            if (depth > 50) {
                // Seriously, if you're doing a template system that is 50 layouts deep you're doing something wrong...
                throw new Error('More than 50 layers of layouts.  Make sure the parent layout has "@{ layout = null; }" at the beginning of the file.')
            }

            if ('string' === typeof view) {
                return this.renderFromFile(view, model, body, sections, depth, usecache)
            }

            throw new Error("I've not implemented another path for views.  Please specify a file name for the view as a string.");
        },

        renderFromFile: function(fileName, model, body, sections, depth, usecache) {
            if (!fileName) {
                throw new Error("You must specify the file name to be rendered.");
            }

            var checkedFiles = [];
            if (!fs.existsSync(fileName)) {
                checkedFiles.push(fileName);

                fileName = path.join(config.root, fileName);
                if (!fs.existsSync(fileName)) {
                    checkedFiles.push(fileName);

                    throw new Error("No such view found.  Searched paths: \n" + checkedFiles.join('\n'));
                }
            }

            if (usecache) {
				var r = cachedFiles[fileName];
				if (!r) {
			     r = this.renderFromString(fs.readFileSync(fileName).toString(), model, body, sections, depth);
			     cachedFiles[fileName] = r;
				}
				return r;
			}


            return this.renderFromString(fs.readFileSync(fileName).toString(), model, body, sections, depth);
        },

        renderFromString: function(contents, model, body, sections, depth) {
            var funcResult = this.parse(contents);
            var result = funcResult.razor.render(model, body, sections);

            if (result.layout) {
                return this.render(result.layout, model,
                    function() {
                        return result.contents;
                    },
                    function(name) {
                        var tokens = funcResult.sections[name];
                        var sectionResult = "";

                        for (var i = 0; i < tokens.length; i++) {
                            var token = tokens[i];
                            if (token.type == 'string') {
                                sectionResult += token.contents;
                            } else if (token.type == 'razor') {
                                sectionResult += eval(token.token);
                            }
                        }

                        return sectionResult;
                    }, depth + 1);
            }
            return result.contents;
        },

        parse: function(contents) {
            var tokens = parser.parseRazorContents(contents);
            var result = '(function() { return { render: function(model, renderBody, renderSection) { var r = "";';
            var sections = { };

            // Add the default layout
            if (config.layout) {
                result += 'layout = "' + config.layout.replace(/\\/g, '\\\\\\\\') + '";'
            } else {
                result += 'layout = null;';
            }

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (token.type == 'string') {
                    var temp = token.contents.replace(/\"/gm, '\\"').replace(/\r/gm, '').replace(/\n/gm, '\\n');
                    if (temp) result += 'r+="' + temp + '";';
                } else if (token.type == 'razor') {
                    result += 'r+=' + token.token + ';';
                } else if (token.type == 'razor section') {
                    result += token.section;
                } else if (token.type == 'layout section') {
                    sections[token.name] = token.tokens;
                }
            }

            result += 'return { contents: r, layout: layout }; } } })();';
            return { razor: eval(result), sections: sections };
        }
    }
}
