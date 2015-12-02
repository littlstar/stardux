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
import { createContainer } from 'stardux';
const domElement = document.createElement('div');
const containerA = createContainer(); // default DOM element created

// `containerA` claims `domElement`
containerA.domElement = domElement;
```

### Sharing DOM Elements

Claiming a DOM element is trivial. However, if a DOM element belongs
to an existing container, the container attempting to claim the DOM element
inherits the properties of the existing container. This can be
problematic and cause containers to become
[orphaned](#orphaned-containers).

Consider the following conflict:

```js
import { createContainer } from 'stardux';
// create containers with default DOM elements
const containerA = createContainer();
const containerB = createContainer();
containerA.domElement = containerB.domElement;
```

`containerA` has claimed the DOM element that belongs `containerB`.

## Orphaned Containers

An orphaned container 
