Getting Started
===============

* [Intro](#intro)
* [Containers](#containers)
* [Templating](#templating)
* [Pipes](#pipes)
* [Middleware](#middleware)
* [Reducers](#reducers)
* [Composition](#composition)
* [Nesting](#nesting)
* [Manipulation](#manipulation)
* [JSON](#json)
* [Advanced](#advanced)

## Intro

*stardux* builds upon the container concept introduced in
[redux](https://github.com/rackt/redux). Containers provide
a predictable interface around DOM elements. State is represented
in objects and expressed in the DOM with ES6 template notation.

Containers use reducers and middleware to transform input
into state. If you are familiar with
[redux](https://github.com/rackt/redux) and reducers then this should be
easy for you. DOM updates are made possible with
[starplate](https://github.com/littlstar/starplate) and it's internal
patching algorithm built on
[IncrementalDOM](https://github.com/google/incremental-dom).

## Containers

Containers are created with the
[`createContainer(domElement[,initialState = null, ...reducers])`]
(api.md#createContainer) function.

```js
import { createContainer } from 'stardux';
const domElement = document.querySelector('#dom-element');
const container = createContainer(domElement);
```

Once created, containers provide mechanisms for
[composition](api.md#compose), [manipulation](api.md#appendChild),
[state pipes](api.md#pipe), and more.

## Templating

Containers provide a way to express state to the DOM. A containers DOM
can be expressed with ES6 template notation and thefore make it easy to
create resuable dynamic views.

```js
import { createContainer } from 'stardux';
const hello = document.createElement('div');
const container = createContainer(hello);

// Define the innerHTML as a template
hello.innerHTML = 'Hello ${ name }';
container.update({ name: 'kinkajou' });

// realize DOM change
console.log(hello.innerHTML); // "Hello kinkajou"
```

Functions can even be used in templates. However, functions will lose
scope when they are referenced in template strings as they are executed
in a sandboxed environment. Consider the following example of a function
named `now()` that simple returns a string representation of a `Date`
object. We'll define the function for the container at initialization.
You can define the initial state of a container by passing an object to
the second argument of the `createContainer()` function.

```js
const date = document.createElement('div');
const container = createContainer(date, { now: _ => Date() });
date.innerHTML = '${ now() }';
container.update();
console.log(date.innerHTML); // "Tue Nov 24 2015 08:41:00 GMT-0500 (EST)"
```

## Pipes

Container pipes, much like node streams provide a mechanism for data
propagation. Containers consume updates, transform data with middleware,
and reduce into state. This processes is repeated for each container in
a pipeline.

Here 3 containers are constructed into a pipeline `A -> B -> C`.

```js
containerA.pipe(containerB).pipe(containerC);
```

When an update occurs on `containerA`, is propagated to `containerB` and
then to `containerC`. This is effectively the samething as
[composition](#composition).

## Middleware

Middleware provides a way of tapping into the root reducer of a
container and allows consumers to transform the current state and action
objects in the reducer chain.

They are installed with the `.use(fn)` method.

```js
container.use((state, action) => {
  // middleware here ...
});
```

## Reducers

Reducers are constructed and passed to the `createContainer()` function
or to the `Container` constructor.
[Reducers](http://rackt.org/redux/docs/basics/Reducers.html) are passed
directly to the internal [redux](https://github.com/rackt/redux) store.

Middleware is always invoked before reducers.

```js
const container = new Container(domElement, (state, action) => {
  // reducer here ...
});
```

## Composition

Containers can be composed together for update propagation and data
filtering. Container composition allows for powerful, flexible, and reusable
container pipelines.


```js
import { createContainer, compose } from 'stardux';
const input = document.createElement('input');
const output = document.createElement('div');
const container = createContainer(input);

// DOM template
output.innerHTML = '${ value }';

// compose containers
compose(container, output);

// update container when user input changes
input.onchange = _ => container.update({ value: input.value });

// render to DOM
document.appendChild(input);
```

When user input changes the `innerHTML` of the `output` DOM element is
updated as well.

The `compose()` function accepts `n` DOM elements or `Container`
instances and composes an update pipe line in the order they were
given.

**NOTE-** A `.decompose()` method is attched to the returned composite
container object. Once called it is deleted with `delete
composed.decompose`.

## Manipulation

Container manipulation is made possible by a similar API to that of the
DOM. Methods like `appendChild()`, `removeChild()`, and `contains()` are
available on call containers. They accept instances of a `Container` or
a DOM element. When an insert or removal occurs the container and its
children are realigned. DOM patches also occur to align DOM tree with
container tree.

```js
const container = new Container();
const childA = new Container();
const childB = new Container();
const childAa = new Container();
const childAb = new Container();
const childBa = new Container();
const childBb = new Container();

container.appendChild(childA);
container.appendChild(childB);

childA.appendChild(childAa);
childA.appendChild(childAb);

childB.appendChild(childBa);
childB.appendChild(childBb);
```

We can check if a container is a descendant of another container with
the `contains()` method.

```js
container.contains(childBb); // true
```

Passing `false` as a second argument forces the method to check only
direct descendants of the container.

```js
container.contains(childBb, false); // false
```

Containers can be removed with the `removeChild()` method. Child DOM
nodes are also removed.

```js
container.removeChild(childB);
container.contains(childB); // false
```

## Nesting

Containers can be nested and still act independent of each other.
Containers can propagate updates to their child containers. This makes
updating multiple contains who share similar data easy.

The following DOM structure yields a container with two child
containers.

```html
<div class="parent">
  <div class="a">${ value }</div>
  <div class="b">${ value }</div>
</div>
```

The containers can be implemented with the following Javascript.
`childA` and `childB` are implicit children of `parent` and therefore do
not need to explicitly added with `appendChild()`.

```js
const parent = createContainer(document.querySelector('.parent'));
const childA = createContainer(document.querySelector('.a'));
const childB = createContainer(document.querySelector('.b'));
```

Both `childA` and `childB` share the variable `value`. Updates to
`parent` will propagate to `childA` and `childB`.

```js
parent.update({value: 'hello'});
```

This makes updates to many containers easy. However, `childA` and `childB`
are still independent containers. Updates to `childA` are made possible
by a simple call to `childA.update({value: 'world'})`. `childB` remains
unchanged while `childA` has.

## JSON

Containers can be serialized 

## Advanced


