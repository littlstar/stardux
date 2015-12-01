Stardux API Reference
=====================

* [createContainer()](#createcontainer)
* [clearContainers()](#clearcontainers)
* [composeContainers()](#composecontainers)
* [createContainerUid()](#createcontaineruid)
* [fetchContainer()](#fetchcontainer)
* [forEachContainer()](#foreachcontainer)
* [getAllContainers()](#getallcontainers)
* [getContainerData()](#getcontainerdata)
* [makeContainer()](#makecontainer)
* [realignContainerTree()](#realigncontainertree)
* [removeContainer()](#removecontainer)
* [replaceContainer()](#replacecontainer)
* [replaceDOMElement()](#replacedomelement)
* [restoreContainerFromJSON()](#restorecontainerfromjson)
* [restoreOrphanedTree()](#restoreorphanedtree)
* [saveContainer()](#savecontainer)
* [traverseContainer()](#traversecontainer)
* [Container](#container)
  * [Members](#container-members)
    * [.children](#container-children)
    * [.domElement](#container-domelement)
    * [.id](#container-id)
    * [.innerContents](#container-innercontents)
    * [.parent](#container-parent)
    * [.state](#container-state)
  * [Methods](#container-methods)
    * [#appendChild()](#container-appendchild)
    * [#contains()](#container-contains)
    * [#dispatch()](#container-dispatch)
    * [#pipe()](#container-pipe)
    * [#removeChild()](#container-removechild)
    * [#render()](#container-render)
    * [#replaceChildren()](#container-replacechildren)
    * [#toJSON()](#container-tojson)
    * [#toString()](#container-tostring)
    * [#unpipe()](#container-unpipe)
    * [#update()](#container-update)
    * [#use()](#container-use)
    * [#valueOf()](#container-valueOf)

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

## Container

### Container Members

#### Container.children

```js
get children(): Array<Container>
```

An array of child containers.

#### Container.domElement

```js
get domElement(): Element
set domElement(domElement: Element): Element
```

Container DOM element.

#### Container.id

```js
get id(): String
```

Container ID.

#### Container.innerContents

```js
get innerContents(): String
set innerContents(contents): String
```

Inner contents of the container.

#### Container.parent

```js
get parent(): Container | null
```

Parent container if available.

#### Container.state

```js
get state(): Object
```

Copy of the internal state object.

### Container Methods

#### Container#appendChild

```js
.appendChild(child: Container | Element | Text | String, update: Boolean, realign: Boolean): Container
```

Append a child container.

#### Container#contains

```js
.contains(container: Container | Element, recursive: Boolean): Boolean
```

Predicate to determine if a container or its DOM element is a child of the container.

#### Container#define

```js
.define(model: Object): Container
```

Extend view model.

#### Container#dispatch

```js
.dispatch(type: Mixed, data: Object, args: Object): Container
```

Dispatch an event with type, optional data and optional arguments to the internal redux store.

#### Container#pipe

```js
.pipe(container: Container): Container
```

Pipe container updates to a given container.

#### Container#removeChild

```js
.removeChild(child: Container | Element, update: Boolean, realign: Boolean): Container
```

Remove a child container.

#### Container#render

```js
.render(domElement: Element): Container
```

Render container to a DOM element.

#### Container#replaceChildren

```js
.replaceChildren(children: Array): Container
```

Replace child tree with new children.

#### Container#toJSON

```js
.toJSON(): Object
```

Converts container to a JSON serializable object.

#### Converts#toString

```js
.toString(): String
```

Returns the string reprenstation of this container.

#### Converts#unpipe

```js
.unpipe(container: Container): Container
```

Unpipe container updates for a given container.

#### Container#update

```js
.update(data: Object, propagate: Boolean): Container
```

Updates container and all child containers.

#### Container#use

```js
.use(plugins: ...Function): Container
```

Consume reducer middleware.

#### Consume#valueOf

```js
.valueOf(): Element
```

Returns the associated value of the container.
