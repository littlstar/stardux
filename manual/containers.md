Containers
==========

## DOM Element Relationship

When a container is created and given a DOM element it will bind a
relationship to the container. Containers and DOM elements have a
**1:1** relationship. If a DOM element is given to a new `Container`
instance, it will be claimed by the new container.

### Claiming DOM Elements

Claiming a DOM element can be achieved by setting the
[.domElement](api.md#containerdomelement) property on a container
instance or creating a new `Container` instance and passing the DOM element
as an argument.

Consider the following example:

```js
import { createContainer } from 'stardux'
const domElement = document.createElement('div')
const containerA = createContainer() // default DOM element created

// `containerA` claims `domElement`
containerA.domElement = domElement
```

### Sharing DOM Elements

Containers cannot share DOM elements as they are share a 1:1
relationshi. Attempting to replace a container's DOM element with another
that is claimed [claimed](#claiming-dom-elements) will result in a
`TypeError`.

```js
const a = createContainer()
const b = createContainer()
a.domElement = b.domElement // TypeError("...")
```

## Orphaned Containers

An orphaned container occurs when the parent of the container loses
reference to it's DOM element due to [DOM replacement](api.md#replacedomelement).

Consider the following example where child becomes orphaned:

```js
const container = createContainer()
const child = createContainer()
container.appendChild(child)
container.domElement = document.createElement('div')
```

The child container is orphaned when the container's DOM element changes
causing it lose reference to it's child containers.
