kally-razor
===========

[![Build Status](https://travis-ci.org/nufyoot/kally-razor.png?branch=master)](https://travis-ci.org/nufyoot/kally-razor) [![Coverage Status](https://coveralls.io/repos/nufyoot/kally-razor/badge.png?branch=master)](https://coveralls.io/r/nufyoot/kally-razor?branch=master)

Moving from C# and MVC in the .NET world, I've grown quite fond of using Razor.  Sure, there are other view engines for Node.js, but none of them quite hit what I needed.

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
