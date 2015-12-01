# Stardux

Functional DOM containers based on Starplate and Redux.

## About

*stardux* makes it easy to create predictable and functional DOM containers.
A `Container` is a wrapper around a DOM element and its state. State is
represented in objects and expressed in the DOM with ES6 template
notation. Containers use reducers and middleware to transform input
into state. If you are familiar with
[redux](https://github.com/rackt/redux) and reducers then this should be
easy for you. DOM updates are made possible with
[starplate](https://github.com/littlstar/starplate) and it's internal
patching algorithm built on
[IncrementalDOM](https://github.com/google/incremental-dom).

*stardux* manages an internal `Map` of containers allowing for container
traversal. Containers are aware of nested (child) containers and are
made available through [traversal mechanisms](manual/advanced.md#traversal).

## Installation

```js
$ npm install stardux --save
```

## Example

Consider the following simple DOM container that renders seconds elapsed
since the moment it was renderer.

The HTML can simply be expressed with a `div` tag and a child `span` node
with text content.

```html
<div id="counter">
  <span>Seconds Elapsed: ${ elapsed }</span>
</div>
```

Creating a container for this DOM element is achieved by passing the DOM
element object to the `createContainer()` method.

```js
import { createContainer } from 'stardux';
let domElement = document.querySelector('#counter');
let elapsed = 0;
let counter = createContainer(domElement);
// update elapsed seconds every second
setInterval(_ => counter.update({elapsed: ++elapsed}), 1000);
```

## Documentation

* [Getting Started](manual/usage.md)
* [API](manual/api.md)
* [Examples](manual/examples.md)
* [FAQ](manual/faq.md)

## License

MIT
