function KallyRazor() {
    return {
        render: function(view) {
            if ('string' === typeof view) {
                return this.renderFromFile.apply(this, arguments);
            }

            throw new Error('I\'ve not implemented another path for views.  Please specify a file name for the view as a string.');
        },

        renderFromFile: function(fileName) {
            return arguments[1];
        }
    }
}

module.exports = KallyRazor;
