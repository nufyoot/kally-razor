kally-razor
===========

[![Build Status](https://travis-ci.org/nufyoot/kally-razor.png?branch=master)](https://travis-ci.org/nufyoot/kally-razor) [![Coverage Status](https://coveralls.io/repos/nufyoot/kally-razor/badge.png?branch=master)](https://coveralls.io/r/nufyoot/kally-razor?branch=master)

Moving from C# and MVC in the .NET world, I've grown quite fond of using Razor.  Sure, there are other view engines for Node.js, but none of them quite hit what I needed.

### Installing KallyRazor
Probably the easiest method is to use npm.
```
npm install kally-razor
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
  root: <directory you want to be the root for all file references.
}
```
The root is the directory you want to be used as the root for all views.  We'll first try to do an exact lookup in the event that you've decided to pass in an absolute file path.  Otherwise, we'll prepend this root parameter to all file references.
