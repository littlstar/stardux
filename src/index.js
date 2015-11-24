'use strict';

/**
 * Module dependencies.
 */

import { combineReducers, createStore } from 'redux';
import { Parser, Template } from 'starplate';
import esprima from 'esprima';
import extend from 'extend';
import domify from 'domify';

/**
 * Container symbols.
 *
 * @private
 */

const $domElement = Symbol('Element');
const $reducers = Symbol('reducers');
const $children = Symbol('children');
const $UPDATE = Symbol('UPDATE');
const $pipes = Symbol('pipes');
const $model = Symbol('model');
const $store = Symbol('store');
const $uid = Symbol('uid');

/**
 * Private stardux data attached to
 * traversed DOM elements.
 *
 * @private
 * @const
 * @type {String}
 */

const STARDUX_PRIVATE_ATTR = '__starduxData';

/**
 * Known container map by ID
 *
 * @private
 * @const
 * @type {Map}
 */

const CONTAINERS = new Map();

/**
 * Clones an object.
 *
 * @private
 * @function
 * @name clone
 * @param {Object}
 * @return {Object}
 */

const clone = object => extend(true, {}, object);

/**
 * Detects if input is "like" an array.
 *
 * @private
 * @function
 * @name isArrayLike
 * @param {Mixed} a
 * @return {Boolean}
 */

const isArrayLike = a => {
  if ('object' != typeof a) return false;
  else if (null == a) return false;
  else return Boolean( Array.isArray(a)
                    || null != a.length
                    || a[0] );
};

/**
 * Make stardux data object on a
 * node if not already there.
 *
 * @private
 * @function
 * @name mkdux
 * @param {Object} node
 * @param {Object} [data = {}]
 * @return {Object}
 */

const mkdux = (node, data = {}) => {
  return node[STARDUX_PRIVATE_ATTR] = ( node[STARDUX_PRIVATE_ATTR] || data );
}

/**
 * UPDATE event type.
 *
 * @public
 * @const
 * @type {Symbol}
 */

export const UPDATE = $UPDATE;

/**
 * Create a new Container instance.
 *
 * @public
 * @function
 * @name createContainer
 * @param {Element} domElement
 * @param {Object} [initialState = null]
 * @param {Function} [...reducers]
 * @return {Container}
 */

export default createContainer;
export function createContainer (domElement, initialState = null, ...reducers) {
  const container = ( Container.get(domElement)
                   || new Container(domElement, ...reducers) );
  return container.update(initialState);
}

/**
 * Create or restore a Container instance
 * from a JSON object.
 *
 * @public
 * @function
 * @name restoreContainerFromJSON
 * @param {Object} json
 * @param {Object} [initialState = null]
 * @param {Function} [...reducers]
 * @return {Container}
 */

export function restoreContainerFromJSON (json, initialState = null, ...reducers) {
  const id = json.id;
  const src = json.src;
  let data = null;
  let children = [];
  let container = Container.get(id);
  let domElement = null;

  if (null == container)
    container = new Container(null, ...reducers);

  container[$uid] = id;
  domElement = container.domElement;
  data = mkdux(domElement);

  Container.save(container);

  if (src != data.src)
    data.src = src;

  if (initialState)
    container.update(initialState);

  for (let child of json.children)
    children.push(restoreContainerFromJSON(child, initialState));

  realignContainerTree(container);

  for (let child of children)
    if (false == container.contains(child))
      container.appendChild(child, false);

  return container.update();
}

/**
 * Compose a container from containers or DOM elements.
 * If a Container or Element is given as first argument then
 * it is treated as the root and all subsequent arguments are
 * treated as direct descendants of the root. If the second
 * argument is an array or an "array like" object then it is
 * treated as direct descendants of the root and all subsequent
 * arguments are ignored. If an array or "array like" object is
 * passed as the first argument a new root container is created
 * and the first argument is treated as direct descendants of
 * the newly created root container. The root container, newly
 * created or restored is returned.
 *
 * @public
 * @function
 * @name compose
 * @param {Element|Container} root
 * @param {Element|Container|String} ...containers
 * @return {Container}
 */

export function compose (root, ...containers) {
  let composed = null;
  let updateChildren = false;
  const children = [];

  // array of containers
  if (isArrayLike(root)) {
    containers = [ ...root ].map(createContainer);
    root = null;
  }

  containers = [ ...containers ].map(createContainer);
  composed = createContainer(root || document.createElement('div'));

  // derive containers from arguments
  if (isArrayLike(containers[0]))
    containers = [ ...containers[0] ];

  // create composite
  let composite = composed;
  for (let child of containers)
    composite = composite.pipe(child);

  // realign root tree
  realignContainerTree(composed, true);

  // allow consumer to unwind composition
  composed.decompose = _ => {
    let composite = composed
    for (let child of containers)
      composite = composite.unpipe(child);
    // remove this function
    delete composed.decompose;
    return composed;
  };

  return composed;
}

/**
 * Returns immutable private stardux data for a given
 * input. Input can be a container, an Element,
 * or a string representing a container ID. If data is
 * not found then null is returned.
 *
 * @public
 * @function
 * @name getContainerData
 * @param {Container|Element|String} arg
 * @return {Object}
 */

export function getContainerData (arg) {
  let data = null;
  let container = null;
  let domElement = null;

  if (arg instanceof Container) {
    domElement = arg.domElement;
  } else if (arg instanceof Element) {
    data = domElement[STARDUX_PRIVATE_ATTR];
  } else if ('string' == typeof arg) {
    container = Container.get(arg);
    domElement = container.domElement;
    data = domElement[STARDUX_PRIVATE_ATTR];
  } else {
    throw new TypeError( "Unexpected input for getContainerData. "
                       + "Expecting an instance of a Container or Element, "
                       + "or a string." );
  }

  return data ? Object.freeze(data) : null;
}

/**
 * Restores orphaned children containers
 * still attached to a container.
 *
 * @public
 * @function
 * @name restoreOrphanedTree
 * @param {Container|Element} container
 * @param {Boolean} [recursive = false]
 */

export function restoreOrphanedTree (container, recursive = false) {
  if (container instanceof Element)
    container = Container.get(container);

  if (null == container)
    return;

  const domElement = container.domElement;
  const children = container[$children];

  for (let child of [ ...children ]) {
    const childDomElement = child.domElement;
    const parentElement = childDomElement.parentElement;

    if (recursive)
      restoreOrphanedTree(child, true);

    if (null == parentElement)
      continue;

    if (domElement.contains(childDomElement))
      domElement.appendChild(childDomElement);
  }
}

/**
 * Realign container DOM tree.
 *
 * @public
 * @function
 * @name realignContainerTree
 * @param {Container}
 * @param {Boolean} [recursive = false]
 * @param {Boolean} [forceOrphanRestoration = false]
 */

export function realignContainerTree (container,
                                      recursive = false,
                                      forceOrphanRestoration = false) {
  const domElement = container.domElement;
  const children = container[$children];

  if (null == domElement.children)
    return;

  if (true === forceOrphanRestoration)
    restoreOrphanedTree(container, recursive);

  // clear existing
  children.clear();

  // traverse children
  for (let childElement of [ ...domElement.children ]) {
    const data = childElement[STARDUX_PRIVATE_ATTR];
    const child = 'object' == typeof data ? Container.get(data.id) : null;
    if (null == child) continue;
    if (false == children.has(child)) children.add(child);
    if (true === recursive) realignContainerTree(child, true, forceOrphanRestoration);
  }
}

/**
 * Container class.
 *
 * @public
 * @class Container
 */

export class Container {

  /**
   * Creates a DOM tree from a string.
   *
   * @public
   * @static
   * @method
   * @name createDOM
   * @param {String} html
   * @return {Element}
   */

  static createDOM (...args) {
    return domify(...args);
  }

  /**
   * Generates a unique hex ID.
   *
   * @public
   * @static
   * @method
   * @name uid
   * @return {String}
   */

  static uid () {
    return ( Math.random() ).toString('16').slice(1);
  }

  /**
   * Save a container to the known
   * containers map.
   *
   * @public
   * @static
   * @method
   * @name save
   * @param {Container} container
   * @return {class Container}
   */

  static save (container) {
    CONTAINERS.set(container.id, container);
    return container;
  }

  /**
   * Fetch a saved container by id.
   *
   * @public
   * @static
   * @method
   * @name load
   * @param {Mixed} arg
   * @return {class Container}
   */

  static get (arg) {
    let id = ( arg && arg.id
             ? arg.id
             : ( arg && arg[STARDUX_PRIVATE_ATTR] )
               ? arg[STARDUX_PRIVATE_ATTR].id
               : arg );
    return id ? CONTAINERS.get(id) : null;
  }

  /**
   * Returns an interator of all containers.
   *
   * @public
   * @static
   * @method
   * @name all
   * @return {Array}
   */

  static all () {
    return CONTAINERS.entries();
  }

  /**
   * Run fn on each container.
   *
   * @public
   * @static
   * @method
   * @name each
   * @param {Function} fn
   * @return {class Container}
   */

  static each (fn) {
    fn = 'function' == typeof fn ? fn : _ => void 0;
    for (let kv of Container.all())
      fn(kv[0], kv[1]);
    return Container;
  }

  /**
   * Traverse container tree.
   *
   * @public
   * @static
   * @method
   * @name traverse
   * @param {Function} fn
   * @param {Array|Iterator} [set = Container.all()]
   */

  static traverse (fn, set = Container.all(), parent = null) {
    if (set) {
      for (let kv of [ ...set ]) {
        const container = kv[1]
        const children = container.children;
        const scope = parent || container.parent || null;
        const id = kv[0];

        fn(id, container, parent);

        if (children)
          for (let child of [ ...children ])
            traverse(fn, child.chiildren, child);
      }
    }
  }

  /**
   * Remove a container by id or the
   * instance itself.
   *
   * @public
   * @static
   * @method
   * @name remove
   * @param {String|Container} arg
   * @return {undefined}
   */

  static remove (arg) {
    const id = arg instanceof Container ? arg.id : arg;
    CONTAINERS.delete(id);
  }

  /**
   * Replace container with another
   *
   * @public
   * @static
   * @method
   * @name replace
   * @param {String|Container} existing
   * @param {String|Container} replacement
   */

  static replace (existing, replacement) {
    const deriveID = c => 'string' == typeof c ? c : c.id || '';
    const existingID = deriveID(existing);
    const replacementID = deriveID(replacement);
    replacement = ( replacement instanceof Container
                  ? replacement
                  : Container.get(replacement) );
    if (replacement) {
      CONTAINERS.set(existingID, replacement);
      return replacement;
    }
    return null;
  }

  /**
   * Clears all saved containers.
   *
   * @public
   * @static
   * @method
   * @name clear
   * @return {undefined}
   */

  static clear () {
    CONTAINERS.clear();
  }

  /**
   * Returns an array of known tokens
   * in a javascript string.
   *
   * @public
   * @static
   * @method
   * @name getTokens
   * @param {String} string
   * @return {Array}
   */

  static getTokens (string) {
    let tokens = null;
    try { tokens = esprima.tokenize('`'+ string +'`'); }
    catch (e) { tokens = []; }
    return tokens;
  }

  /**
   * Returns an object of identifiers with
   * empty string or NO-OP function
   * values.
   *
   * @public
   * @static
   * @method
   * @name getIdentifiersFromTokens
   * @param {Array} tokens
   * @return {Object}
   */

  static getIdentifiersFromTokens (tokens) {
    const identifiers = {};

    /**
     * Predicate to determine if token is an identifier.
     *
     * @private
     * @function
     * @name isIdentifier
     * @param {Object} token
     * @return {Boolean}
     */

    const isIdentifier = token => 'Identifier' == token.type;

    /**
     * Mark token as a function identifier.
     *
     * @private
     * @function
     * @name markFunction
     * @param {Object} token
     * @param {Number} index
     * @return {Object} token
     */

    const markFunction = (token, index) => {
      const next = tokens[index + 1] || null;
      token.isFunction = ( 'Identifier' == token.type
                        && 'object' == typeof next && next
                        && 'Punctuator' == next.type
                        && '(' == next.value
                         ? true : false );
      return token;
    };

    /**
     * Mark token as a object identifier.
     *
     * @private
     * @function
     * @name markObject
     * @param {Object} token
     * @param {Number} index
     * @return {Object} token
     */

    const markObject = (token, index) => {
      const next = tokens[index + 1] || null;
      token.isObject = ( 'Identifier' == token.type
                      && 'object' == typeof next && next
                      && 'Punctuator' == next.type
                      && '.' == next.value
                       ? true : false );
      return token;
    };

    /**
     * Assign token value to identifierss map.
     *
     * @private
     * @function
     * @name assign
     * @param {Object} map
     * @param {Object} token
     * @return {Object} map
     */

    const assign = (map, token) => {
      const value = token.value;
      if (token.isFunction)
        map[value] = _ => '';
      else if (token.isObject)
        map[value] = {};
      else
        map[value] = '';
      return map;
    };

    // resolve identifierss and return map
    return ( tokens
            .map((t, i) => markFunction(t, i))
            .map((t, i) => markObject(t, i))
            .filter(t => isIdentifier(t))
            .reduce((map, t) => assign(map, t), identifiers) );
  }

  /**
   * Ensures a DOM string from a given input.
   *
   * @public
   * @static
   * @method
   * @name ensureDOMString
   * @param {String} html
   * @return {String}
   */

  static ensureDOMString (html = String()) {
    html = 'string' == typeof html ? html : String(html || '');
    return html.trim();
  }

  /**
   * Returns a template tring from a given
   * DOM Element. If the DOM Element given is a
   * string then it is simply returned.
   *
   * @public
   * @static
   * @method
   * @name getTemplateFromDomElement
   * @param {Element|String}
   * @return {String}
   */

  static getTemplateFromDomElement (domElement) {
    let data = {};
    let src = null;

    if (domElement && domElement[STARDUX_PRIVATE_ATTR])
      data = mkdux(domElement);

    if ('string' == typeof domElement)
      src = domElement;
    else if (data.src)
      src = data.src;
    else if (domElement.children && 0 == domElement.children.length)
      src = Container.ensureDOMString(domElement.textContent);
    else if (domElement.firstChild instanceof Text)
      src = Container.ensureDOMString(domElement.innerHTML);
    else if (domElement instanceof Text)
      src = Container.ensureDOMString(domElement.textContent);
    else
      src = domElement.innerHTML || domElement.textContent;

    return src || '';
  }

  /**
   * Container constructor.
   *
   * @public
   * @constructor
   * @param {Element|String} domElement
   * @param {Function} ...reducers
   */

  constructor (domElement = null, ...reducers) {
    // ensure DOM element instance
    if ('string' == typeof domElement) {
      domElement = domify(domElement) || new Text(domElement);
    } else if (null == domElement) {
      domElement = domify('<div></div>');
    }

    const self = this;

    const ensureContainerStateIdentifiers = _ => {
      const domElement = this[$domElement];
      const template = Container.getTemplateFromDomElement(domElement);
      const tokens = Container.getTokens(template);
      const identifiers = Container.getIdentifiersFromTokens(tokens);
      const update = {};
      const state = this.state;
      if (identifiers) {
        for (let key in identifiers)
          if (undefined === state[key])
            update[key] = identifiers[key];
        this.define(update);
      }
      return identifiers || null;
    };

    const rootReducer = (state = Object.create(null), action = {data: {}}) => {
      const identifiers = ensureContainerStateIdentifiers();
      const domElement = this[$domElement];
      const template = Container.getTemplateFromDomElement(domElement);
      const reducers = this[$reducers].entries();
      const isBody = domElement == document.body;

      action.data = action.data || {};

      void function next () {
        const step = reducers.next();
        const done = step.done;
        const reducer = step.value ? step.value[0] : null;
        if (done) return;
        else if (null == reducer) next();
        else if (false === reducer(state, action)) return;
        else next();
      }();

      switch (action.type) {
        case $UPDATE:
          this.define(action.data || state);
          if (!isBody && identifiers) {
            const parser = new Parser();
            const partial = new Template(template);
            const src = partial.render(this.state, this);
            const patch = parser.createPatch(src);
            patch(domElement);
          }
        break;
      }

      return extend(true, clone(state || {}), this.state);
    };

    const pipedReducer = (_, action = {data: {}}) => {
      const state = this.state;
      const pipes = this[$pipes].entries();
      void function next () {
        const step = pipes.next();
        const done = step.done;
        const pipe = step.value ? step.value[1] : null;
        if (done) return;
        else if (null == pipe) next();
        else if (false === pipe(state, action)) return;
        else next();
      }();
      return state;
    };

    /**
     * Container UID
     *
     * @private
     * @type {String}
     */

    this[$uid] = Container.uid();

    /**
     * Instance root DOM Element.
     *
     * @private
     * @type {Element}
     */

    this[$domElement] = domElement;

    /**
     * Reducers set.
     *
     * @private
     * @type {Set}
     */

    this[$reducers] = new Set();

    /**
     * Known container pipes.
     *
     * @private
     * @type {Set}
     */

    this[$pipes] = new Map();

    /**
     * View model.
     *
     * @private
     * @type {Object}
     */

    this[$model] = Object.create(null);

    /**
     * Child containers.
     *
     * @private
     * @type {Set}
     */

    this[$children] = new Set();

    /**
     * Redux store.
     *
     * @private
     * @type {Object}
     */

    this[$store] = createStore(combineReducers([ rootReducer,
                                                 ...reducers,
                                                 pipedReducer ]));

    this.replaceDOMElement(domElement);
    ensureContainerStateIdentifiers();
    Container.save(this);
  }

  /**
   * Getter to retrieve state from internal
   * redux store.
   *
   * @public
   * @getter
   * @name state
   * @return {Object}
   */

  get state () {
    return clone(this[$model]);
  }

  /**
   * Getter to retrieve container id.
   *
   * @public
   * @getter
   * @name id
   * @return {String}
   */

  get id () {
    return this[$uid];
  }

  /**
   * Getter to return parent container if
   * available.
   *
   * @public
   * @getter
   * @name parent
   * @return {Container}
   */

  get parent () {
    const domElement = this.domElement;
    let parentElement = domElement && domElement.parentElement;
    let parentContainerData = {};
    let parentElementContainer = null;
    do {
      if (null == parentElement) break;
      parentContainerData = parentElement[STARDUX_PRIVATE_ATTR] || {};
      parentElement = parentElement.parentElement;
    } while (!(parentElementContainer = Container.get(parentContainerData.id)));
    return parentElementContainer;
  }

  /**
   * Getter to return container DOm element.
   *
   * @public
   * @getter
   * @name domElement
   * @return {Element}
   */

  get domElement () {
    return this[$domElement];
  }

  /**
   * Extend view model.
   *
   * @public
   * @method
   * @name define
   * @param {Object} model
   * @return {Container}
   */

  define (model) {
    if ('object' == typeof model)
      extend(true, this[$model], model);
    return this;
  }

  /**
   * Getter to return an array
   * of child containers
   *
   * @public
   * @methdo
   * @name children
   * @return {Array}
   */

  children () {
    return ( [ ...this[$children].entries() ]
             .map(kv => kv[0])
             .filter(child => child instanceof Container) );
  }


  /**
   * Consume a reducer.
   *
   * @public
   * @method
   * @name use
   * @param {Function} ...reducers
   * @return {Container}
   */

  use (...args) {
    const reducers = this[$reducers];
    for (let reducer of args)
      reducers.add(reducer);
    return this;
  }

  /**
   * Updates container
   *
   * @public
   * @method
   * @name update
   * @param {Object} [data = {}]
   * @param {Boolean} [propagate = true]
   * @return {Container}
   */

  update (data, propagate = true) {
    const domElement = this.domElement;
    const template = Container.getTemplateFromDomElement(domElement);

    // init/update DOM data
    extend(mkdux(domElement), { id: this[$uid] });
    if (template) {
      extend(mkdux(domElement), {
        src: Container.getTemplateFromDomElement(domElement)
      });
    }

    // pre alignment
    realignContainerTree(this);

    // update
    this.dispatch($UPDATE, data, { propagate: propagate });

    if (propagate)
      for (let child of [ ...this.children() ])
        child.update(data);

    // post alignment
    realignContainerTree(this);
    return this;
  }

  /**
   * Render container to a DOM element.
   *
   * @public
   * @method
   * @name render
   * @param {Element} domElement
   * @return {Container}
   */

  render (domElement) {
    if (!domElement) return this;
    if (false == domElement.contains(this[$domElement]))
      domElement.appendChild(this[$domElement]);
    return this;
  }

  /**
   * Dispatch an event with type and data
   * and optional arguments.
   *
   * @public
   * @method
   * @name dispatch
   * @param {Mixed} type
   * @param {Object} [data = {}]
   * @param {Object} [args = {}]
   * @return {Container}
   */

  dispatch (type, data = {}, args = {}) {
    if (!type) throw new TypeError("Failed to dispatch event without type.");
    const store = this[$store];
    const payload = {type: type, data: data};
    for (let key in args)
      payload[key] = args[key];
    store.dispatch(payload);
    return this;
  }

  /**
   * Replace container element with another
   *
   * @public
   * @method
   * @name replaceDOMElement
   * @param {Element} domElement
   * @return {Container}
   */

  replaceDOMElement (domElement) {
    const data = mkdux(this.domElement);
    if (domElement) {
      mkdux(domElement[STARDUX_PRIVATE_ATTR], data);
      this[$domElement] = domElement;
      const sources = [];
      const childElements = [ ...domElement.children ];

      for (let childElement of childElements)
        storeChildSource(childElement);

      this.update(null, false);

      const stack = sources.slice();
      for (let childElement of [ ...domElement.children ])
        restoreChildElementSource(childElement, stack);

      function storeChildSource (node) {
        const data = mkdux(node);
        sources.push(data.src || node.innerHTML);
        for (let child of [ ...node.children ])
          storeChildSource(child);
      }

      function restoreChildElementSource (node, stack) {
        const parser = new Parser();
        const source = stack.shift();
        const data = extend(mkdux(node), {src: source});
        const patch = source ? parser.createPatch(source) : null;
        if (patch) patch(node);
        for (let child of [ ...node.children ])
          restoreChildElementSource(child, stack);
      }
    }
    return this;
  }

  /**
   * Replace child tree with new children.
   *
   * @public
   * @method
   * @name replaceChildren
   * @param {Array} children
   * @return {Container}
   */

  replaceChildren (children) {
    for (let child of this.children())
      this.removeChild(child);

    for (let child of children)
      this.appendChild(child);
    return this;
  }

  /**
   * Returns the associated value of the
   * container.
   *
   * @public
   * @method
   * @name valueOf
   * @return {Element}
   */

  valueOf () {
    return this.domElement;
  }

  /**
   * Returns the string reprenstation of
   * this container.
   *
   * @public
   * @method
   * @name toString
   * @return {String}
   */

  toString () {
    return this.domElement.textContent;
  }

  toJSON () {
    const root = {};
    void function traverse (container, node) {
      node.id = container.id;
      node.src = Container.getTemplateFromDomElement(container.domElement);
      node.state = JSON.stringify(node.state);
      node.children = [];
      for (let child of container.children()) {
        const next = {};
        node.children.push(next);
        traverse(child, next);
      }
    }(this, root);
    return root;
  }

  /**
   * Pipe container updates to a given container.
   *
   * @public
   * @method
   * @name pipe
   * @param {Container} container
   * @return {Container} container
   */

  pipe (container) {
    const pipes = this[$pipes];
    const middleware = (state, action) => {
      switch (action.type) {
        case $UPDATE:
          if (action.data)
            container.update(clone(action.data));
          break;
      }
    };

    if (false == pipes.has(container)) {
      pipes.set(container, middleware);
    }

    return container;
  }

  /**
   * Unpipe container updates for a given container.
   *
   * @public
   * @method
   * @name unpipe
   * @param {Container} container
   * @return {Container} container
   */

  unpipe (container) {
    const pipes = this[$pipes];
    const reducers = this[$reducers];
    const middleware = pipes.get(container);
    if (middleware) {
      pipes.delete(container);
    }
    return container;
  }

  /**
   * Append a child container. A child may be an
   * instance of a Container, Element, Text, or
   * a string. Containers are derived from their input
   * and will cause a DOM tree to be restructured.
   *
   * @public
   * @method
   * @name appendChild
   * @param {Container|Element|Text|String} child
   * @param {Boolean} [update = true]
   * @return {Container}
   */

  appendChild (child, update = true) {
    const domElement = this.domElement;
    let childDomElement = null;
    let container = null;

    if (child instanceof Container) {
      container = child;
    } else if (child instanceof Element) {
      container = createContainer(child);
    } else if ('string' == typeof child || child instanceof Text) {
      container = createContainer(child);
    } else {
      throw new TypeError( "Unexpected input for appendChild. "
                         + "Expecting an instance of a Container, Element, Text "
                         + "or a string." );
    }

    childDomElement = container.domElement;

    if (update)
      this.update();

    try {
      if (container.parent && container.parent != this) {
        container.parent.removeChild(container);
      }
      domElement.appendChild(childDomElement);
      this[$children].add(container);
    } catch (e) { console.warn(e) }

    realignContainerTree(this);

    return container;
  }

  /**
   * Remove a child container. A child may be an
   * instance of a Container or Element. Containers
   * are derived from their input and will cause a
   * DOM tree to be restructured.
   *
   * @public
   * @method
   * @name removeChild
   * @param {Container|Element} child
   * @param {Boolean} [update = true]
   * @return {Container}
   */

  removeChild (child, update = true) {
    const domElement = this.domElement;
    let childDomElement = null;
    let container = null;

    if (child instanceof Container) {
      container = child;
    } else if (child instanceof Element) {
      container = createContainer(child);
    } else {
      throw new TypeError( "Unexpected input for removeChild. "
                         + "Expeceting an instance of Container or Element." );
    }

    if (update)
      this.update();

    if (domElement.contains(childDomElement))
      domElement.removeChild(childDomElement);

    realignContainerTree(this);

    return this;
  }

  /**
   * Predicate to determine if a container or its
   * DOM element is a child of the container.
   *
   * @public
   * @method
   * @name contains
   * @param {Container|Element} container
   * @return {Boolean}
   */

  contains (container) {
    realignContainerTree(this);
    if (container instanceof Element) {
      container = Container.get(container);
      if (null == container) return false;
    } else if (container instanceof Container) {
      if (this[$children].has(container)) return true;
    }
    return false;
  }
}
