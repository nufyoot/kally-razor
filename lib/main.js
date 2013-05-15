function KallyRazor() {
    return {
        render: function(view) {
            if ('string' === typeof view) {
                return this.renderFromFile.apply(this, arguments);
            }

            return 'empty';
        },

        renderFromFile: function(fileName) {
            return arguments[1];
        }
    }
}

module.exports = KallyRazor;
