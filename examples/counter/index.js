'use strict';
const createContainer = stardux.createContainer;
const UPDATE = stardux.UPDATE;
const domElement = document.querySelector('#counter');
const container = createContainer(domElement, { total: 0 });

function increment () {
  const total = container.state.total;
  container.update({total: total + 1});
}

function decrement () {
  const total = container.state.total;
  container.update({total: total - 1});
}

function minimum (value) {
  const max = Math.max;
  return (state, action) => {
    const total = action.data.total;
    if (UPDATE == action.type) {
      action.data.total = max(value, max(value, total));
    }
  };
}

container.use(minimum(0));
