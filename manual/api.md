Stardux API Reference
=====================

* [createContainer()](#createcontainer)
* [clearContainers()](#clearcontainers)
* [composeContainers()](#composecontainers)
* [createContainerUid()](#createcontaineruid)
* [fetchContainer()](#fetchContainer)
* [forEachContainer()](#forEachContainer)
* [getAllContainers()](#getAllContainers)
* [getContainerData()](#getContainerData)
* [makeContainer()](#makeContainer)
* [realignContainerTree()](#realignContainerTree)
* [removeContainer()](#removeContainer)
* [replaceContainer()](#replaceContainer)
* [replaceDOMElement()](#replaceDOMElement)
* [restoreContainerFromJSON()](#restoreContainerFromJSON)
* [restoreOrphanedTree()](#restoreOrphanedTree)
* [saveContainer()](#saveContainer)
* [traverseContainer()](#traverseContainer)

## createContainer

```js
function createContainer(domElement: Element, initialState: Object, reducers: ...Function): Container
```

Create a new Container instance with optional initial state and n reducers.

## clearContainers

```js
function clearContainers(): undefined
```

Clears all saved containers.

## composeContainers

```js
function composeContainers(root: Element | Container, containers: ...Element | Container | String): Container
```

Compose a container from containers or DOM elements.

## createContainerUid

```js
function createContainerUid(): String
```

Generates a unique hex ID for Container instances.

## fetchContainer

```js
function fetchContainer(arg: String | Element | Object): class Container
```

Fetch a saved container by container ID, DOM element, or by a container instance.

## forEachContainer

```js
function forEachContainer(fn: Function, scope: Object): undefined
```

Execute a function for each container.

## getAllContainers

```js
function getAllContainers(): Array
```

Returns an interator for all containers.

## getContainerData

```js
function getContainerData(arg: Container | Element | String): Object
```

Returns immutable private stardux data for a given input.

## makeContainer

```js
function makeContainer(domElement: Element): Container
```

Creates a or returns a new Container instance from a given DOM element.

## realignContainerTree

```js
function realignContainerTree(container: Container, recursive: Boolean, forceOrphanRestoration: Boolean)
```

Realign container DOM tree by removing containers not found in container DOM tree.

## removeContainer

```js
function removeContainer(arg: String | Container | Element): Boolean
```

Removes a container from the internal tree.

## replaceContainer

```js
function replaceContainer(existing: String | Container | Element, replacement: String | Container | Element, create: Boolen): Container
```

Replace a container with another.

## replaceDOMElement

```js
function replaceDOMElement(container: Container, domElement: Element): Container
```

Replace container element with another.

## restoreContainerFromJSON

```js
function restoreContainerFromJSON(json: Object, initialState: Object, reducers: ...Function): Container
```

Create or restore a Container instance from a JSON object with an optional state object a reducers.

## restoreOrphanedTree

```js
function restoreOrphanedTree(container: Container | Element, recursive: Boolean): undefined
```

Restores orphaned children containers still attached to a container.

## saveContainer

```js
function saveContainer(container: Container | Element): Boolean
```

Save a container to the known containers map.

## traverseContainer

```js
function traverseContainer(container: Container, fn: Function, scope: Object): undefined
```

Traverse a container's tree recursively.

## class Container

###  Members

#### .children: Array: Container

Child containers.

#### .domElement: Element

Container DOM element.

#### .id: String

Container id.

#### .innerContents: String

Inner contents of the container.

#### .parent: Container | null

Parent container if available.

#### state: Object

Copy of the internal state object.

### Method Summary

#### #appendChild(child: Container | Element | Text | String, update: Boolean, realign: Boolean): Container

Append a child container.

#### #contains(container: Container | Element, recursive: Boolean): Boolean

Predicate to determine if a container or its DOM element is a child of the container.

#### #define(model: Object): Container

Extend view model.

#### #dispatch(type: Mixed, data: Object, args: Object): Container

Dispatch an event with type, optional data and optional arguments to the internal redux store.

#### #pipe(container: Container): Container

Pipe container updates to a given container.

#### #removeChild(child: Container | Element, update: Boolean, realign: Boolean): Container

Remove a child container.

#### #render(domElement: Element): Container

Render container to a DOM element.

#### #replaceChildren(children: Array): Container

Replace child tree with new children.

#### #toJSON(): Object

Converts container to a JSON serializable object.

#### #toString(): String

Returns the string reprenstation of this container.

#### #unpipe(container: Container): Container

Unpipe container updates for a given container.

#### #update(data: Object, propagate: Boolean): Container

Updates container and all child containers.

#### #use(plugins: ...Function): Container

Consume reducer middleware.

#### #valueOf(): Element

Returns the associated value of the container.
