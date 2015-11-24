Getting Started
===============

* [Intro](#intro)
* [Containers](#containers)
* [Templating](#templating)
* [Composition](#composition)
* [Pipes](#pipes)
* [Middleware](#middleware)
* [Reducers](#reducers)
* [Nesting](#nesting)
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

## Composition

Containers can be composed together for update propagation and data
filtering.

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

Container composition allows for powerful, flexible, and reusable
container pipelines.

## Pipes

## Middleware

## Reducers

## Nesting

## JSON

## Advanced


