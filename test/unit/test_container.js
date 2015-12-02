'use strict';

/**
 * Module dependencies.
 */

const restoreContainerFromJSON = stardux.restoreContainerFromJSON;
const realignContainerTree = stardux.realignContainerTree;
const restoreOrphanedTree = stardux.restoreOrphanedTree;
const createContainerUid = stardux.createContainerUid;
const replaceDOMElement = stardux.replaceDOMElement;
const composeContainers = stardux.composeContainers;
const traverseContainer = stardux.traverseContainer;
const forEachContainer = stardux.forEachContainer;
const replaceContainer = stardux.replaceContainer;
const getContainerData = stardux.getContainerData;
const getAllContainers = stardux.getAllContainers;
const createContainer = stardux.createContainer;
const fetchContainer = stardux.fetchContainer;
const removeContainer = stardux.removeContainer;
const clearContainers = stardux.clearContainers;
const makeContainer = stardux.makeContainer;
const saveContainer = stardux.saveContainer;
const Container = stardux.Container;

/**
 * Simple assert helper.
 *
 * @public
 * @function
 * @name assert
 * @param {Boolean} cond
 * @param {String} message
 */

function assert (cond, message) {
  if (false == Boolean(cond)) {
    const err = new Error( "AssertionError: "+ (message || ''));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err);
    }
    throw err;
  }
}

/**
 * Ensure function is called once.
 * This is useful for wrapping the
 * `done()` callback provided by `it()
 * blocks. Mulitple calls to `done()`
 * creates false failures to mocha's
 * UI reporter.
 *
 * @public
 * @function
 * @name once
 * @param {Function} fn
 * @return {Function}
 */

function once (fn) {
  let called = false;
  let arg = null;
  return function () {
    if (false == called) {
      arg = fn.apply(this, arguments);
      called = true;
    }

    return arg;
  };
}

/**
 * Test cleanup
 */

afterEach(() => clearContainers() );

describe('class Container { ... }', () => {
  describe('#constructor([domElement = null, ...reducers]])', () => {
    it("Should create a container with a default DOM Element.", () => {
      const container = new Container();
      assert(container);
      assert(container.domElement instanceof Element);
    });

    it("Should create a container with a given DOM Element.", () => {
      const domElement = document.createElement('div');
      const container = new Container(domElement);
      assert(container);
      assert(domElement == container.domElement);
    });

    it("Should apply a given reducer.", done => {
      done = once(done);
      const container = new Container(null, () => (done(), true));
    });

    it("Should set an accessible id", () => {
      const container = new Container();
      assert(container.id);
    });

    it("Should set an accessible state.", () => {
      const container = new Container();
      assert(container.state);
    });
  });

  describe('.state', () => {
    it("Should be an object.", () => {
      const container = createContainer();
      assert('object' == typeof container.state);
    });

    it("Should be a cloned object.", () => {
      const container = createContainer();
      const a = container.state;
      const b = container.state;
      assert('object' == typeof a);
      assert('object' == typeof b);
      assert(a != b);
    });

    it("Should be immutable.", done => {
      const container = createContainer();
      const value = {foo: 'bar'};
      try { container.state = value; }
      catch (e) {
        assert(undefined === container.state.foo);
        done();
      }
    });
  });

  describe('.id', () => {
    it("Should be a string.", () => {
      const container = createContainer();
      assert('string' == typeof container.id);
    });

    it("Should be immutable.", done => {
      const container = createContainer();
      const id = container.id;
      try {  container.id = '123'; }
      catch (e) {
        assert(container.id == id);
        done();
      }
    });
  });

  describe('.parent', () => {
    it("Should be null when container is an orphaned.", () => {
      const container = createContainer();
      assert(null == container.parent);
    });

    it("Should derive parent from parent DOM element.", () => {
      const parent = createContainer();
      const child = createContainer();
      parent.appendChild(child);
      assert(parent == child.parent);
    });

    it("Should derive parent from parent DOM element from existing DOM tree.", () => {
      const tree = document.createElement('div');
      tree.innerHTML = '<div><span></span></div>';
      const container = createContainer(tree.children[0]); // div
      const child = createContainer(tree.children[0].children[0]);
      assert(container == child.parent);
    });
  });

  describe('.domElement', () => {
    it("Should be an instance of Element", () => {
      const container = createContainer();
      assert(container.domElement instanceof Element);
    });

    it("Should be mutable effectively replacing the container DOM element.", () => {
      const container = createContainer();
      const domElement = document.createElement('span');
      domElement.innerHTML = 'hello ${name}';
      container.domElement = domElement;
      assert(domElement == container.domElement);
      container.update({name: 'kinkajou'});
      assert('hello kinkajou' == domElement.innerHTML);
      assert('hello kinkajou' == container.domElement.innerHTML);
    });

    it("Should throw a TypeError when value set is not a DOM element.", done => {
      const container = createContainer();
      try {
        container.domElement = 'foo';
        throw new Error("Error not thrown.");
      } catch (e) {
        assert(e instanceof TypeError);
        done();
      }
    });
  });

  describe('.innerContents', () => {
    it("Should be a string.", () => {
      const container = createContainer();
      assert('string' == typeof container.innerContents);
    });

    it("Should be a string representation of the containers DOM element.", () => {
      const container = createContainer();
      container.domElement.innerHTML = 'hello';
      assert('hello' == container.innerContents);
    });
  });

  describe('.children', () => {
    it("Should return an array of child containers.", () => {
      const container = new Container();
      const childA = new Container();
      const childB = new Container();
      container.appendChild(childA);
      container.appendChild(childB);
      const children = container.children;
      assert(children);
      assert(childA == children[0]);
      assert(childB == children[1]);
    });
  });

  describe('#define(model)', () => {
    it("Should extend the container state object.", () => {
      const container = new Container();
      container.define({key: 'value'});
      assert('value' == container.state.key);
    });
  });

  describe('#use(...plugins)', () => {
    it("Should install reducer middleware.", done => {
      done = once(done);
      const container = new Container();
      container.use(() => done());
      container.update();
    });
  });

  describe('#update(data[, propagate = true]', () => {
    it("Should update internal state.", () => {
      const container = new Container();
      container.update({value: 123});
      assert(123 == container.state.value);
    });

    it("Should propagate changes to child containers.", () => {
      const container = new Container();
      const childA = new Container();
      const childAA = new Container();
      const childB = new Container();
      container.appendChild(childA);
      container.appendChild(childB);
      childA.appendChild(childAA);
      assert(childA.children.length)
      container.update({value: 123});
      assert(123 == container.state.value);
      assert(123 == childA.state.value);
      assert(123 == childAA.state.value);
      assert(123 == childB.state.value);
    });

    it("Should only update the container and not children when `propagate = false`.", () => {
      const container = new Container();
      const childA = new Container();
      const childB = new Container();
      container.appendChild(childA);
      container.appendChild(childB);
      container.update({value: 123}, false);
      assert(123 == container.state.value);
      assert(!childA.state.value);
      assert(!childB.state.value);
    });

    it("Should dispatch `stardux.UPDATE` event type in a reducer.", done => {
      done = once(done);
      const container = new Container(null, (state, action) => {
        if (stardux.UPDATE == action.type) done();
        return {};
      });
      container.update();
    });
  });

  describe('#render(domElement)', () => {
    it("Should render the container to a given DOM element.", () => {
      const container = new Container();
      const domElement = document.createElement('div');
      container.render(domElement);
      assert(domElement.contains(container.domElement));
    });
  });

  describe('#dispatch(type[, data = {}, args = {}])', () =>  {
    it("Should dispatch any arbitrary event type and propagate to a reducer.", done => {
      done = once(done);
      const type = Symbol('foo');
      const container = new Container(null, (state, action) => {
        if (type == action.type) done();
        return {};
      });
      container.dispatch(type);
    });
  });

  describe('#replaceChildren(children)', () => {
    it("Should remove all existing children and append new ones.", () => {
      const container = new Container();
      const childA = new Container();
      const childB = new Container();
      const childC = new Container();
      const childX = new Container();
      const childY = new Container();
      const childZ = new Container();

      container.update();
      container.appendChild(childA);
      container.appendChild(childB);
      container.appendChild(childC);

      assert(container.contains(childA));
      assert(container.contains(childB));
      assert(container.contains(childC));

      container.replaceChildren([childX, childY, childZ]);

      assert(false == container.contains(childA));
      assert(false == container.contains(childB));
      assert(false == container.contains(childC));

      assert(container.contains(childX));
      assert(container.contains(childY));
      assert(container.contains(childZ));
    });
  });

  describe('#valueOf()', () => {
    it("Should return the underlying DOM element.", () => {
      const container = new Container();
      assert(container.valueOf() instanceof Element);
    })
  });

  describe('#toString()', () => {
    it("Should return a text representation of the container contents.", () => {
      const container = new Container();
      container.innerContents = '${value}';
      container.update({value: 'hello'});
      assert('hello' == String(container));
      container.update({value: 'kinkajou'});
      assert('kinkajou' == String(container));
    });
  });

  describe('#toJSON()', () => {
    it("Should return a JSON object representation.", () => {
      const container = new Container();
      container.innerContents = 'hello ${value}';
      container.update({value: 'world'});
      const json = container.toJSON();
      assert('object' == typeof json);
      assert(json.id);
      assert(json.src);
      assert(json.state);
      assert(json.children);
    });
  });

  describe('#pipe(container)', () => {
    it("Should pipe update to another container.", done => {
      done = once(done);
      const containerA = new Container();
      const containerB = new Container();
      containerA.pipe(containerB);
      containerB.use(_ => done());
      containerA.update();
    });
  });

  describe('#unpipe(container)', () => {
    it("Should unpipe containers.", () => {
      const containerA = new Container();
      const containerB = new Container();
      containerA.pipe(containerB);
      containerB.use(_ => { throw new Error("Unpipe failed."); });
      containerA.unpipe(containerB);
      containerA.update();
    });
  });

  describe('#appendChild(child)', () => {
    it("Should append a child container.", () => {
      const container = new Container();
      const child = new Container();
      container.appendChild(child);
      assert(container.children[0] == child);
      assert(container.children[0].domElement == child.domElement);
    });
  });

  describe('#removeChild(child)', () => {
    it("Should remove a child container.", () => {
      const container = new Container();
      const child = new Container();
      container.appendChild(child);
      assert(container.children[0] == child);
      container.removeChild(child);
      assert(container.children[0] != child);
      assert(0 == container.children.length);
    });
  });

  describe('#contains(container[, recursive = true])', () => {
    it("Should return true or false if a container is a child or not.", () => {
      const container = new Container();
      const child = new Container();
      const other = new Container();
      container.appendChild(child);
      assert(container.contains(child));
      assert(false == container.contains(other));
    });

    it("Should only search direct descendants if [recursive = false].", () => {
      const container = new Container();
      const child = new Container();
      const other = new Container();
      container.appendChild(child);
      child.appendChild(other);
      assert(container.contains(child));
      assert(container.contains(other));
      assert(false == container.contains(other, false));
    });
  });

});

describe('createContainer([domElement = null, initialState = {}, ...reducers]', () => {

  it("Should create an instance of a Container", () => {
    assert(createContainer() instanceof Container);
  });

  it("Should create a container with a default DOM Element.", () => {
    const container = createContainer();
    assert(container);
    assert(container.domElement instanceof Element);
  });

  it("Should create a container with a given DOM Element.", () => {
    const domElement = document.createElement('div');
    const container = createContainer(domElement);
    assert(container);
    assert(domElement == container.domElement);
  });

  it("Should create a container with initial state.", () => {
    const container = createContainer(null, {value: 123});
    assert(container);
    assert(123 == container.state.value);
  });

  it("Should return an existing container for an already wrapped " +
     "DOM Element.", () => {
    const domElement = document.createElement('div');
    const container = createContainer(domElement);
    const duplicate = createContainer(domElement);
    assert(container);
    assert(duplicate);
    assert(duplicate.domElement == container.domElement);
    assert(duplicate === container);
  });

  it("Should return an existing container for an already existing " +
     "container.", () => {
    const container = createContainer();
    const duplicate = createContainer(container);
    assert(container);
    assert(duplicate);
    assert(duplicate.domElement == container.domElement);
    assert(duplicate === container);
  });

  it("Should apply a set of given reducers.", done => {
    done = once(done);
    const called = [0, 0, 0, 0];
    const container = createContainer(null, null,
                                      (state, action) => (called[0] = true),
                                      (state, action) => (called[1] = true),
                                      (state, action) => (called[2] = true),
                                      (state, action) => (called[3] = true),
                                      (state, action) => {
                                        assert(called.every(Boolean),
                                               "Missing reducer call.");
                                        done();
                                        return {};
                                      });

  });
});

describe('makeContainer(domElement)', () => {
  it("Should make a container from a DOM element.", () => {
    const domElement = document.createElement('div');
    const container = makeContainer(domElement);
    assert(container);
    assert(container.domElement == domElement);
  });
});

describe('restoreContainerFromJSON(object)', () => {
  it("Should be able to restore a container from a JSON structure.", () => {
    const container = createContainer();
    const json = JSON.stringify(container);
    const restored = restoreContainerFromJSON(JSON.parse(json));
    assert(restored.id == container.id)
    // prevents copies and returns existing if still in memory
    assert(restored == container,
          "Failed to restore existing container.");
  });

  it("Should be able to create a new container from a JSON structure.", () => {
    const id = '.81b55b8d'
    const str = `{"id":"${id}","src":"","state":{"value":123},"children":[]}`
    const json = JSON.parse(str);
    const container = restoreContainerFromJSON(json);
    assert(container);
    assert(id == container.id);
  });

  it("Should be able to restore a container with new initial state.", () => {
    const container = createContainer(null, {value: 123});
    const json = JSON.stringify(container);
    const restored = restoreContainerFromJSON(JSON.parse(json), {other: 456});
    assert(restored.id == container.id)
    assert(restored == container, "Failed to restore existing container.");
    assert(123 == restored.state.value);
    assert(456 == restored.state.other);
  });
});

describe('composeContainers([...containers]', () => {
  it("Should return a new Container instance with no arguments.", () => {
    const composite = composeContainers();
    assert(composite);
  });

  it("Should use the first argument as the root composite.", () => {
    const container = createContainer();
    const composite = composeContainers(container);
    assert(composite);
    assert(composite == container);
  });

  it("Should create a new container when given an array of containers.", done => {
    done = once(done);
    const containerA = createContainer();
    const containerB = createContainer();
    const composite = composeContainers([containerA, containerB]);
    assert(composite);
    containerB.use(_ => done());
    composite.update();
  });

  it("Should return a root container with chained containers.", done => {
    done = once(done);
    const root = createContainer();
    const containerA = createContainer();
    const containerB = createContainer();
    const composite = composeContainers(root, containerA, containerB);
    assert(composite);
    assert(composite == root);
    containerB.use(_ => done());
    root.update();
  });
});

describe('getContainerData([container | id | domElement])', () => {
  it("Should return null for DOM Elements that have not been claimed by a container.", () => {
    const domElement = document.createElement('div');
    const data = getContainerData(domElement);
    assert(null == data);
  });

  it("Should return data for a DOM Element claimed by a container.", () => {
    const domElement = document.createElement('div');
    const container = createContainer(domElement);
    const data = getContainerData(domElement);
    assert(data);
    assert(data.id == container.id);
  });

  it("Should return data for an existing container.", () => {
    const domElement = document.createElement('div');
    const container = createContainer(domElement);
    const data = getContainerData(container);
    assert(data);
    assert(data.id == container.id);
  });

  it("Should return data for an existing container by id.", () => {
    const domElement = document.createElement('div');
    const container = createContainer(domElement);
    const data = getContainerData(container.id);
    assert(data);
    assert(data.id == container.id);
  });
});

describe('restoreOrphanedTree(container | domElement)', () => {
  it("Should restore orphaned containers DOM elements", () => {
    const domElement = document.createElement('div');
    const childDomElementA = document.createElement('div');
    const childDomElementB = document.createElement('div');

    const container = createContainer(domElement);
    const childContainerA = createContainer(childDomElementA);
    const childContainerB = createContainer(childDomElementB);

    container.appendChild(childContainerA);
    container.appendChild(childContainerB);

    assert(container.contains(childContainerA));
    assert(container.contains(childContainerB));

    domElement.removeChild(childDomElementA);
    domElement.removeChild(childDomElementB);

    assert(container.contains(childContainerA, false));
    assert(container.contains(childContainerB, false));

    assert(false == domElement.contains(childDomElementA));
    assert(false == domElement.contains(childDomElementB));

    restoreOrphanedTree(container);

    assert(domElement.contains(childDomElementA));
    assert(domElement.contains(childDomElementB));

    assert(container.contains(childContainerA));
    assert(container.contains(childContainerB));
  });
});

/**
 * Tests container tree realignment.
 */

describe('realignContainerTree(container[, recursive = false])', () => {
  it("Should realign an unaligned container tree by restoring lost DOM elements.", () => {
    const domElement = document.createElement('div');
    const childDomElementA = document.createElement('div');
    const childDomElementB = document.createElement('div');

    const container = createContainer(domElement);
    const childContainerA = createContainer(childDomElementA);
    const childContainerB = createContainer(childDomElementB);

    container.appendChild(childContainerA);
    container.appendChild(childContainerB);

    assert(container.contains(childContainerA));
    assert(container.contains(childContainerB));

    // child DOM element is removed but the container will
    // still reference a child container
    domElement.removeChild(childDomElementB);
    assert(false == domElement.contains(childDomElementB));
    assert(container.contains(childContainerB));
    // realign container tree force lost node to be restored
    realignContainerTree(container);
    assert(domElement.contains(childDomElementB));
  });

  it("Should recursively realign a container tree.", () => {
    const domElement = document.createElement('div');
    const childDomElementA = document.createElement('div');
    const childDomElementAA = document.createElement('div');

    const container = createContainer(domElement);
    const childContainerA = createContainer(childDomElementA);
    const childContainerAA = createContainer(childDomElementAA);

    container.appendChild(childContainerA);
    childContainerA.appendChild(childContainerAA);

    assert(container.contains(childContainerA));
    assert(childContainerA.contains(childContainerAA));

    childDomElementA.removeChild(childDomElementAA);
    assert(false == childDomElementA.contains(childDomElementAA));
    assert(childContainerA.contains(childContainerAA));
    realignContainerTree(container, true);
    assert(childDomElementA.contains(childDomElementAA));
  });
});

describe('replaceDOMElement(container, domElement)', () => {
  it("Should replace the internal DOM element associated witht the container.", () => {
    const domElement = document.createElement('div');
    const container = createContainer();
    assert(container.domElement);
    replaceDOMElement(container, domElement);
    assert(domElement == container.domElement);
  });

  it("Should restore existing child containers in new DOM tree", () => {
    const domElement = document.createElement('div');
    const containerA = createContainer(domElement);
    const containerB = createContainer();
    const childA1 = createContainer();
    const childA2 = createContainer();
    const childB1 = createContainer();
    const childB2 = createContainer();

    containerA.appendChild(childA1);
    containerA.appendChild(childA2);

    assert(2 == containerA.children.length);

    containerB.appendChild(childB1);
    containerB.appendChild(childB2);

    assert(2 == containerB.children.length);

    replaceDOMElement(containerA, containerB.domElement);
    assert(containerA.domElement == containerB.domElement);

    assert(2 == containerA.children.length);
    assert(2 == containerB.children.length);

    assert(childB1 == containerA.children[0]);
    assert(childB2 == containerA.children[1]);
  });
});


describe('createContainerUid()', () => {
  it("Should return a string.", () => {
    assert('string' == typeof createContainerUid());
  });

  it("Should return a UID prefixed with a '.'.", () => {
    assert('.' == createContainerUid()[0]);
  });
});

describe('getAllContainers()', () => {
  it("Should return all created containers.", () => {
    const a = createContainer();
    const b = createContainer();
    const c = createContainer();
    const containers = [ ...getAllContainers() ].map(_ => _[1]); // [id, container]
    assert(containers.indexOf(a) > -1);
    assert(containers.indexOf(b) > -1);
    assert(containers.indexOf(c) > -1);
  });
});

describe('fetchContainer(container | domElement | id)', () => {
  it("Should return a container if a container is given.", () => {
    const container = createContainer();
    assert(container == fetchContainer(container));
  });

  it("Should return a container if a DOM element is given.", () => {
    const container = createContainer();
    assert(container == fetchContainer(container.domElement));
  });

  it("Should return a container if a id is given.", () => {
    const container = createContainer();
    assert(container == fetchContainer(container.id));
  });

  it("Should return a container if an object with id is given.", () => {
    const container = createContainer();
    assert(container == fetchContainer({id: container.id}));
  });
});

describe('removeContainer(container | domElement | id)', () => {
  it("Should remove a container from its parent.", () => {
    const parent = createContainer();
    const child = createContainer();
    parent.appendChild(child);
    assert(true == removeContainer(child));
    assert(false == parent.contains(child));
  });

  it("Should remove a container from the internal tree.", () => {
    const container = createContainer();
    assert(true == removeContainer(container));
    const containers = [ ...getAllContainers() ];
    assert(0 == containers.length);
  });

  it("Should remove a container by a given DOM element.", () => {
    const container = createContainer();
    assert(true == removeContainer(container.domElement));
    const containers = [ ...getAllContainers() ];
    assert(0 == containers.length);
  });

  it("Should remove a container by a given id.", () => {
    const container = createContainer();
    assert(true == removeContainer(container.id));
    const containers = [ ...getAllContainers() ];
    assert(0 == containers.length);
  });
});

describe('saveContainer(container)', () => {
  it("Should save a container.", () => {
    const container = createContainer();
    // containers are saved automatically
    assert(true == removeContainer(container));
    assert(null == fetchContainer(container.id));
    assert(true === saveContainer(container));
  });
});

describe('replaceContainer(existing, replacement[, create = false])', () => {
  it("Should replace an existing container with another existing one.", () => {
    const a = createContainer();
    const b = createContainer();
    assert(replaceContainer(a, b));
    assert(1 == [ ...getAllContainers() ].length);
    assert(a.id == b.id);
    a.innerContents = 'hello';
    assert(a.innerContents == b.innerContents);
    assert(a.domElement.innerHTML == b.domElement.innerHTML);
    assert(a.domElement == b.domElement);
  });

  it("Should replace an existing container with a an existing container when given a DOM element.", () => {
    const a = createContainer();
    const b = createContainer();
    replaceContainer(a, b.domElement);
    assert(1 == [ ...getAllContainers() ].length);
    assert(a.id == b.id);
    a.innerContents = 'hello';
    assert(a.innerContents == b.innerContents);
    assert(a.domElement.innerHTML == b.domElement.innerHTML);
    assert(a.domElement == b.domElement);
  });

  it("Should replace an existing container with a new container when given a DOM element when [create = true]. ", () => {
    const domElement = document.createElement('div');
    const a = createContainer();
    const b = replaceContainer(a, domElement, true);
    assert(b.domElement == domElement);
    assert(1 == [ ...getAllContainers() ].length);
    assert(a.id == b.id);
    a.innerContents = 'hello ${value}';
    assert(a.innerContents == b.innerContents);
    assert(a.domElement.innerHTML == b.domElement.innerHTML);
    assert(a.domElement == b.domElement);
    a.update({value: 'world'});
    assert(a.innerContents == b.innerContents);
  });
});

describe('clearContainers()', () => {
  it("Should clear all existing containers.", () => {
    const count = 10;
    for (let i = 0; i < count; ++i) createContainer();
    assert(count == [ ...getAllContainers() ].length);
    clearContainers();
    assert(0 == [ ...getAllContainers() ].length);
  });
});

describe('forEachContainer(fn[, scope])', () => {
  it("Should iterate over each container in the order in which they were created.", () => {
    const a = createContainer();
    const b = createContainer();
    const c = createContainer();
    const d = createContainer();
    const seen = [];
    forEachContainer(container => seen.push(container));
    assert(seen.length);
    assert(a == seen[0]);
    assert(b == seen[1]);
    assert(c == seen[2]);
    assert(d == seen[3]);
  });

  it("Should iterate over each container with an optional scope.", () => {
    const a = createContainer();
    const b = createContainer();
    const c = createContainer();
    const seen = [];

    forEachContainer(function (container) {
      assert(this == seen);
      this.push(container);
    }, seen);

    assert(seen.length);
    assert(a == seen[0]);
    assert(b == seen[1]);
    assert(c == seen[2]);
  });
});

describe('traverseContainer(container, fn[, scope])', () => {
  it("Should traverse a container's children.", () => {
    const root = createContainer();
    const a = createContainer();
    const b = createContainer();
    const c = createContainer();
    const d = createContainer();
    const e = createContainer();
    const seen = [];
    a.appendChild(c);
    a.appendChild(d);
    traverseContainer(a, container => seen.push(container));
    assert(seen.length);
    assert(c == seen[0]);
    assert(d == seen[1]);
  });

  it("Should traverse a container's children with an optional scope.", () => {
    const root = createContainer();
    const a = createContainer();
    const b = createContainer();
    const c = createContainer();
    const d = createContainer();
    const e = createContainer();
    const seen = [];
    a.appendChild(c);
    a.appendChild(d);
    traverseContainer(a, function (container) {
      assert(this == seen);
      this.push(container);
    }, seen);
    assert(seen.length);
    assert(c == seen[0]);
    assert(d == seen[1]);
  });
});
