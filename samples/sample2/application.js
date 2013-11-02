var express = require('express');
var app = express();
var port = process.env.port || 1337;
var KallyRazor = require('../../lib/main');

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    var razor = KallyRazor({ root: __dirname, layout: 'views/_Layout.cshtml' , baseUrl:''});
    var result = razor.render('views/index.html', {
        name: 'My Test Name',
    });
    res.send(result);
});

app.listen(port);
console.log('Listening on port ' + port);