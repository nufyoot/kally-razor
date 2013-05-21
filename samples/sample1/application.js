var Express = require('express');
var app = Express();
var port = process.env.port || 1337;
var KallyRazor = require('../../lib/main');

app.get('/', function(req, res) {
    var razor = KallyRazor({ root: __dirname });
    var result = razor.render('views/index.html', {
        name: 'My Test Name',
        title: 'This is the page title'
    });
    res.send(result);
});

app.listen(port);
console.log('Listening on port ' + port);