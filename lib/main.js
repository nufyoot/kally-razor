var fs = require('fs');

function KallyRazor(config) {
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
            var result = '(function() { return { render: function(model) { var r = "";';
            var i = 0;

            while(i < contents.length) {
                var nextToken = contents.indexOf('@', i);

                if (nextToken == -1) {
                    var temp = contents.substr(i, contents.length - i).replace(/\"/gm, '\\"').replace(/\n/gm, '\\n');
                    if (temp) result += 'r+="' + temp + '";';
                    i = contents.length;
                } else {
                    var temp = contents.substr(i, nextToken - i).replace(/\"/gm, '\\"').replace(/\n/gm, '\\n');
                    if (temp) result += 'r+="' + temp + '";';
                    i = nextToken;

                    var token = '';
                    while (++i < contents.length) {
                        if (contents[i].match(/[A-Za-z\.]/)) {
                            token += contents[i];
                        } else {
                            break;
                        }
                    }
                    result += 'r+=' + token + ';';
                }
            }

            result += 'return r; } } })();';

            return eval(result);
        }
    }
}

exports.KallyRazor = KallyRazor;
