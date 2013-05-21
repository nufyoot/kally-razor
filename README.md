kally-razor
===========

[![Build Status](https://travis-ci.org/nufyoot/kally-razor.png?branch=master)](https://travis-ci.org/nufyoot/kally-razor) [![Coverage Status](https://coveralls.io/repos/nufyoot/kally-razor/badge.png?branch=master)](https://coveralls.io/r/nufyoot/kally-razor?branch=master)

Moving from C# and MVC in the .NET world, I've grown quite fond of using Razor.  Sure, there are other view engines for Node.js, but none of them quite hit what I needed.

### Installing KallyRazor
Probably the easiest method is to use npm.
```
npm install kally-razor
```

### Testing KallyRazor
OSX
```
make test
```

Windows
```
./test.bat
```

### What's available?
First, there's the basic syntax:
```html
<div>@model.name</div>
```
All views are passed a variable named `model` which contains anything you pass to it.  More on this later.  There's also support for grouping a statement, in the event that it's a bit more complex.
```html
<div>@(model.firstName + ' ' + model.lastName)</div>
```
The above line of code could just be written as
```html
<div>@model.firstName @model.lasstName</div>
```
but this is just to show an example of a more complex grouping.  Now, all the examples above will evaluate the expression and immediatley output the result right into place.  But what if you need to do some calculations in the view and don't want to output anything yet?
```html
@{
  var i = 12;
}
<div>The value of i is @i</div>
```

Of course, these are all VERY basic examples.  More complex examples to come later.

Now, I mentioned above that all views have a variable named `model` passed in.  But where does the data come from?  Here's an example of how KallyRazor is called.
```javascript
var KallyRazor = require('kally-razor');
var razor = KallyRazor({
  root: __dirname
});

var contents = razor.parse('./views/index.html', { firstName: 'Test', lastName: 'Testerson' });
```
The above example pulls in the kally-razor module (assuming you've installed it using npm), then creates a new instance by calling the KallyRazor function passing in some configuration parameters (I'll provide these below).  Finally, we call `razor.parse` and pass it the file name to parse and the model to be passed in.  This will return back to us the contents of the parsed Razor file.  Simple.  Now for the configuration parameters.
```
{
  root: <directory you want to be the root for all file references>
}
```
The root is the directory you want to be used as the root for all views.  We'll first try to do an exact lookup in the event that you've decided to pass in an absolute file path.  Otherwise, we'll prepend this root parameter to all file references.

### Layouts
One of the cooles things about Razor is the ability to easily to layouts (templates).  Here's a sample call from Node.js
```javascript
var KallyRazor = require('kally-razor');
var razor = KallyRazor({
  root: __dirname + '/views/',
  layout: 'shared/_layout.html'
})
```
The above code says that the root of the razor engine should be the views sub folder of the currently executing js file.  Next we specify the default layout (template) to be used.  Let's say we have a very basic layout file so that "shared/_layout.html" looks like
```html
@{ layout = null; }
<html>
  <head>
    <title>Sample</title>
  </head>
  <body>
    <h1>Some Header</h1>
    @renderBody()
  </body>
</html>
```
The only strange part might be `@renderBody()` which just tells Razor where to place the body content.  Then, having the following line in Node.js
```javascript
razor.render('home/index.html');
```
And a file "home/index.html" that looks like
```html
<div>Yeah, it worked!</div>
```
this would all yield:
```html
<html>
  <head>
    <title>Samples</title>
  </head>
  <body>
    <h1>Some Header</h1>
    <div>Yeah, it worked!</div>
  </body>
</html>
```
That's awesome :)
