# Stardux

Functional DOM containers based on Starplate and Redux.

[![Build
Status](https://travis-ci.org/littlstar/stardux.svg?branch=master)](https://travis-ci.org/littlstar/stardux)

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

```html
<div id="counter">
  Seconds Elapsed: ${ elapsed }
</div>
```

```js
import { createContainer } from 'stardux'
const counter = createContainer(document.querySelector('#counter'))
let elapsed = 0
setInterval(_ => counter.update({elapsed: ++elapsed}), 1000)
```

## Documentation

* [Getting Started](manual/usage.md)
* [API](manual/api.md)
* [Examples](manual/examples.md)
* [FAQ](manual/faq.md)

## License

MIT
