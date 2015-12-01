Stardux API Reference
=====================

* [createContainer](createContainer)

## createContainer(domElement: Element, initialState: Object, reducers: ...Function): Container <a name="createContainer"></a>

Create a new Container instance with optional initial state and n reducers.

## clearContainers(): undefined <a name="clearContainers"></a>

Clears all saved containers.

## composeContainers(root: Element | Container, containers: ...Element | Container | String): Container <a name="composeContainers"></a>

Compose a container from containers or DOM elements.

## createContainerUid(): String <a name="createContainerUid"></a>

Generates a unique hex ID for Container instances.

## fetchContainer(arg: String | Element | Object): class Container <a name="fetchContainer"></a>

Fetch a saved container by container ID, DOM element, or by a container instance.

## forEachContainer(fn: Function, scope: Object) <a name="forEachContainer"></a>

Execute a function for each container.

## getAllContainers(): Array <a name="getAllContainers"></a>

Returns an interator for all containers.

## getContainerData(arg: Container | Element | String): Object <a name="getContainerData"></a>

Returns immutable private stardux data for a given input.

## makeContainer(domElement: Element): Container <a name="makeContainer"></a>

Creates a or returns a new Container instance from a given DOM element.

## realignContainerTree(container: Container, recursive: Boolean, forceOrphanRestoration: Boolean) <a name="realignContainerTree"></a>

Realign container DOM tree by removing containers not found in container DOM tree.

## removeContainer(arg: String | Container | Element): Boolean <a name="removeContainer"></a>

Removes a container from the internal tree.

## replaceContainer(existing: String | Container | Element, replacement: String | Container | Element, create: Boolen): Container <a name="replaceContainer"></a>

Replace a container with another.

## replaceDOMElement(container: Container, domElement: Element): Container <a name="replaceDOMElement"></a>

Replace container element with another.

## restoreContainerFromJSON(json: Object, initialState: Object, reducers: ...Function): Container <a name="restoreContainerFromJSON"></a>

Create or restore a Container instance from a JSON object with an optional state object a reducers.

## restoreOrphanedTree(container: Container | Element, recursive: Boolean) <a name="restoreOrphanedTree"></a>

Restores orphaned children containers still attached to a container.

## saveContainer(container: Container | Element): Boolean <a name="saveContainer"></a>

Save a container to the known containers map.

## traverseContainer(container: Container, fn: Function, scope: Object) <a name="traverseContainer"></a>

Traverse a container's tree recursively.

## class Container <a name="class-container"></a>

###  Members <a name="class-container-members"></a>

#### .children: Array: Container <a name="class-container-children"></a>

Child containers

#### .domElement: Element <a name="class-container-domElement"></a>

Internal DOM element

#### .id: String <a name="class-container-id"></a>

Container id.

#### .innerContents: String <a name="class-container-innerContents"></a>

Inner contents of the container.

#### .parent: Container | null <a name="class-container-parent"></a>

Parent container if available.

#### state: Object <a name="class-container-state"></a>

Copy of the internal state object.

### Methods <a name="class-container-methods"></a>

#### #appendChild(child: Container | Element | Text | String, update: Boolean, realign: Boolean): Container <a name="class-container-appendChild"></a>

Append a child container.

#### #contains(container: Container | Element, recursive: Boolean): Boolean <a name="class-container-contains"></a>

Predicate to determine if a container or its DOM element is a child of the container.

#### #define(model: Object): Container <a name="class-container-define"></a>

Extend view model.

#### #dispatch(type: Mixed, data: Object, args: Object): Container <a name="class-container-dispatch"></a>

Dispatch an event with type, optional data and optional arguments to the internal redux store.

#### #pipe(container: Container): Container <a name="class-container-pipe"></a>

Pipe container updates to a given container.

#### #removeChild(child: Container | Element, update: Boolean, realign: Boolean): Container <a name="class-container-removeChild"></a>

Remove a child container.

#### #render(domElement: Element): Container <a name="class-container-render"></a>

Render container to a DOM element.

#### #replaceChildren(children: Array): Container <a name="class-container-replaceChildren"></a>

Replace child tree with new children.

#### #toJSON(): Object <a name="class-container-toJSON"></a>

Converts container to a JSON serializable object.

#### #toString(): String <a name="class-container-toString"></a>

Returns the string reprenstation of this container.

#### #unpipe(container: Container): Container <a name="class-container-unpipe"></a>

Unpipe container updates for a given container.

#### #update(data: Object, propagate: Boolean): Container <a name="class-container-update"></a>

Updates container and all child containers.

#### #use(plugins: ...Function): Container <a name="class-container-use"></a>

Consume reducer middleware.

#### #valueOf(): Element <a name="class-container-valueOf"></a>

Returns the associated value of the container.
