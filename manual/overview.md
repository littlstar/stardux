## Introduction

*stardux* builds upon the container concept introduced in
[redux](https://github.com/rackt/redux). Containers provide
a predictable interface around DOM elements. State is represented
in objects and expressed in the DOM with ES6 template notation.

A `Container` is a wrapper around a DOM element and its state. State is
represented in objects and expressed in the DOM with ES6 template
notation. Containers use reducers and middleware to transform input
into state. If you are familiar with
[redux](https://github.com/rackt/redux) and reducers then this should be
easy for you. DOM updates are made possible with
[starplate](https://github.com/littlstar/starplate) and it's internal
patching algorithm built on
[IncrementalDOM](https://github.com/google/incremental-dom).

## Hello World

Define DOM and template source body.

```html
<div><span> ${ value } </span></div>
```

Create container from DOM element and update state.

```js
import { createcontainer } from 'stardux'
const container = createContainer(document.querySelector('div'))
container.update({ value: 'hello, world' })
```

Realize patches made to wrapped DOM element.

```html
<div><span> hello, world </span></div>
```

## Containers

Containers are created with the `createContainer()` function.

```js
import { createContainer } from 'stardux'
const container = createContainer(domElement)
```

## Reducers

Containers apply reducers when an action is dispatched. When a container
is updated with a call to the `.update()` method, an `UPDATE` action is
dispatched with optional data. Every container instance has an internal
root reducer that applies middleware to the `state` and `action` values
provided by `redux`. User reducers given to `createContainer()` or the
`Container` constructor are applied after.

## Templating

Containers provide a way to express state to the DOM. A containers DOM
can be expressed with ES6 template notation making it easy to
create resuable dynamic views.

```js
const container = createContainer(domElement)
domElement.innerHTML = 'Hello ${name}'
container.update({ name: 'kinkajou' })
console.log(domElement.innerHTML) // "Hello kinkajou"
```

## Pipes and Composition

Containers can be composed into a container chain and even allow for
middleware to transform input data. Piping and middleware are provided by
familiar interfaces such as `.pipe(container)` and `.use(middleware)`
respectively. The `state` and `action` values given to a container from
a pipe are transformed by any middleware given to a container with the
`.use()` method.

Here 3 containers are constructed into a pipeline `A -> B -> C`.

```js
containerA.pipe(containerB).pipe(containerC)
```

When an update occurs on `containerA`, is propagated to `containerB` and
then to `containerC`. This is effectively the samething as container
composition.

Middleware has the following usage.

```js
container.use((state, action) => {
  // middleware here ...
})
```

## Child containers

Containers can have child containers which are added and removed with
familiar methods like `.appendChild()` and `.removeChild()`.

*Adding a child to a container.*

```js
container.appendChild(child)
```

*Removing a child to a container.*

```js
container.appendChild(child)
```
