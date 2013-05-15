var fs = require('fs');

function KallyRazor(config) {
    config = config || {
        root: __dirname
    };

    return {
        render: function(view) {
            if (!view) {
                throw new Error("You must specify the view to be rendered.");
            }

            if ('string' === typeof view) {
                return this.renderFromFile.apply(this, arguments);
            }

            throw new Error("I've not implemented another path for views.  Please specify a file name for the view as a string.");
        },

        renderFromFile: function(fileName) {
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

            var contents = fs.readFileSync(fileName).toString();

            return contents;
        }
    }
}

module.exports = KallyRazor;
