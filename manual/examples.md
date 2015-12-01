Examples
========

All examples are fully implemented in the [examples/](../examples)
directory.

* [Counter](#counter)
* [Clock](#clock)
* [Mouse Reporter](#mouse-reporter)

## Counter

In our counter example we define a simple DOM tree in the body of our
document as such:

```html
<section id="counter"> Counter: ${ total } </section>
```

The innerHTML of the DOM element `section#counter` represent the source
template of our container. A single identifier `total` is referenced.

A container for this DOM element can be created with
[createContainer()][createContainer()]

```js
```

and
can be defined with calls to the [update({total: value})][.update()] method for a
[Container][Container()] instance.

The [innerContents][.innerContents] of the 

Our container will keep track of a variable `total`.

## Clock

## Mouse Reporter



[createContainer()]: api.md#createcontainerdomelement-element-initialstate-object-reducers-function-container
[Container()]: api.md#class-container
[.update()]: api.md#updatedata-object-propagate-boolean-container
[.innerContents]: api.md#innercontents-string
