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

```js
import { createContainer } from 'stardux';
const container = createContainer(domElement);
container.update();
```
