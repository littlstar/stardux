'use strict';

/**
 * Module dependencies.
 */

const restoreContainerFromJSON = stardux.restoreContainerFromJSON;
const realignContainerTree = stardux.realignContainerTree;
const restoreOrphanedTree = stardux.restoreOrphanedTree;
const getContainerData = stardux.getContainerData;
const createContainer = stardux.createContainer;
const Container = stardux.Container;
const compose = stardux.compose;

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
 * Test cleanup
 */

afterEach(() => {
  // remove existing container tree
  Container.clear();
});

/**
 * Tests Container class.
 */

describe('Container', () => {
  describe('#constructor([domElement = null[, ...reducers]])', () => {
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

  describe('#define(model)', () => {
    it("Should extend the container state object.", () => {
      const container = new Container();
      container.define({key: 'value'});
      assert('value' == container.state.key);
    });
  });

  describe('#children()', () => {
    it("Should return an array of child containers.", () => {
      const container = new Container();
      const childA = new Container();
      const childB = new Container();
      container.appendChild(childA);
      container.appendChild(childB);
      const children = container.children();
      assert(children);
      assert(childA == children[0]);
      assert(childB == children[1]);
    });
  });

  describe('#use(...plugins)', () => {
    it("Should install reducer middleware.", done => {
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
      assert(childA.children().length)
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
  });
});

/**
 * Tests container creation.
 */

describe('createContainer', () => {

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

/**
 * Tests container restoration and creation
 * from JSON objects.
 */

describe('restoreContainerFromJSON', () => {
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

/**
 * Tests container composition.
 */

describe('compose', () => {
  it("Should return a new Container instance with no arguments.", () => {
    const composite = compose();
    assert(composite);
  });

  it("Should use the first argument as the root composite.", () => {
    const container = createContainer();
    const composite = compose(container);
    assert(composite);
    assert(composite == container);
  });

  it("Should create a new container when given an array of containers.", done => {
    const containerA = createContainer();
    const containerB = createContainer();
    const composite = compose([containerA, containerB]);
    assert(composite);
    containerB.use(_ => done());
    composite.update();
  });

  it("Should return a root container with chained containers.", done => {
    const root = createContainer();
    const containerA = createContainer();
    const containerB = createContainer();
    const composite = compose(root, containerA, containerB);
    assert(composite);
    assert(composite == root);
    containerB.use(_ => done());
    root.update();
  });
});

/**
 * Tests getting container data.
 */

describe('getContainerData', () => {
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

/**
 * Tests orphaned restoration.
 */

describe('restoreOrphanedTree', () => {
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

describe('realignContainerTree', () => {
  it("Should realign an unaligned container tree", () => {
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

    domElement.removeChild(childDomElementB);
    assert(false == domElement.contains(childDomElementB));
    assert(container.contains(childContainerB, false));
    realignContainerTree(container);
    assert(false == container.contains(childContainerB, false));
  });
});
