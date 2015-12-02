Examples
========

All examples are fully implemented in the [examples/](../examples)
directory.

* [Counter](#counter)

## Counter

In our counter example we define a simple DOM tree in the body of our
document as such:

```html
<section id="counter"> Counter: ${ total } </section>
```

The innerHTML of the DOM element `#counter` represent the source
template of our container. A single identifier `total` is referenced.

A container for this DOM element can be created with
[createContainer()][createContainer()]. We will provide an initial
state object where with the value of `{ total: 0 }`.

```js
import { createContainer } from 'stardux'
const domElement = document.querySelector('#counter')
const container = createContainer(domElement, { total: 0 })
```

The `createContainer()` [claims](container.md#dom-element-relationship)
the given DOM element and updates its `innerHTML` providing initial
state.

The DOM of the container should match the following:

```html
<section id="counter"> Counter: 0 </section>
```

When updates occur to a container's DOM element tree, child nodes are
diffed and patched when required. This is made possible with
[starplate](starplate) templating and patching. At the core, diffs and
patches are implemented with [IncrementalDOM](incremental-dom) and based
upon a DOM tree provided by starplate.

The [.update()](.update()) method on a `Container` instance updates the
container state. In this example our concernis the value of `total`. We
can update the value of `total` by passing an object to the `.update()`
method.

```js
container.update({total: 1})
```

The DOM of the container should match the following:

```html
<section id="counter"> Counter: 1 </section>
```

We can retrieve the value of `total` by inspecting the [.state](.state)
object of a container.

```js
const total = container.state.total
```

The state object returned when accessing the [.state](.state) property
is a copy of the internal state represented in the container. You can
modify the object, but it will not affect the state of the container.

We now know the state of the container externally. We can now create two
functions for incrementing and decrementing the `total` value.

```js
function increment () {
  const total = container.state.total
  container.update({total: total + 1})
}

function decrement () {
  const total = container.state.total
  container.update({total: total - 1})
}
```

Calling either of these functions updates the state of the container.
We can now increment or decrement the value of the counter by updating
its internal container state.

Suppose we want to ensure that our counter has a minimum value. We want
to impose that all values are greater than or equal to `0`. We can
achieve this with [middleware][middleware]. Middleware is a function
that can manipulate [state][redux-state] and [action][redux-action]
objects. It is executed before [user reducers][reducers] and will
therefore affect the values on the `state` and `action` objects.
Reducers and middleware are called for any type of action dispatched on
a container. Our concern is only updates. When an action is dispatched
on a container the `.type` value is defined on the `action` object. The
[UPDATE][UPDATE] type is the action type dispatched when `.update()` is
called. When an object is given to the `update()` method it is defined on the
action object as the `.data` property.

We now need to `import` `UPDATE` type from the stardux module.
Our import statement needs to change to the following:

```js
import {
  UPDATE,
  createContainer
} from 'stardux'
```

Our middleware for imposing a minimum counter value could be
defined as such:

```js
function minimum (value) {
  const max = Math.max
  return (state, action) => {
    const total = action.data.total
    if (UPDATE == action.type) {
      action.data.total = max(value, max(value, total))
    }
  }
}
```

Middleware is mostly concerned with modifying the `action` object.
Again, data given to the `.update()` method is set on the action object
as the `.data` property.

Middleware is consumed with the [.use()][.use()] method on a container.
We can install the `minimum()` middleware with a minimum value set to
`0`.

```js
container.use(minimum(0))
```

All calls to `decrement()` should decrement the total but never let the
value be less than `0`.

Our counter, now with middleware and an API (`increment()`,
`decrement()`) is ready for interaction. We can modify our document by
adding two buttons that, when clicked, increment or decrement the
counter.

```html
<button type="button" onclick="increment()"> ( + ) Increment </button>
<button type="button" onclick="decrement()"> ( - ) Decrement </button>
```

Our counter now has a UI interaction allowing the container to be
updated.

See [examples/counter](../examples/counter) for the complete working
example.

[createContainer()]: api.md#createcontainer
[Container()]: api.md#container
[.update()]: api.md#update
[.use()]: api.md#use
[.innerContents]: api.md#containerinnercontents
[.state]: api.md#containerstate

[UPDATE]: api.md#update
[middleware]: usage.md#middleware
[reducers]: usage.md#reducers

[starplate]: https://github.com/littlstar/starplate
[incremental-dom]: https://github.com/google/incremental-dom

[redux-state]: https://github.com/rackt/redux/blob/master/docs/basics/Reducers.md#designing-the-state-shape
[redux-action]: https://github.com/rackt/redux/blob/master/docs/basics/Reducers.md#handling-actions

