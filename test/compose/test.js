'use strict';
const main = document.querySelector('#main');
const ul = main.querySelector('ul');
const composed = stardux.composeContainers(ul.children);
function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}
function text (domElement) {
  return String(domElement.textContent).trim();
}

composed.update({data: [1, 2, 3, 4]});

let i = 0;
for (let child of composed.children()) {
  assert(++i == Number(text(child.domElement)),
         `Failed assertion i=${i} where ` +
         `(${i} != ${Number(text(child.domElement))})`);
}

const add5 = stardux.createContainer(null, {value: 0}).use((state, action) => {
  stardux.UPDATE == action.type && action.data.value ? (action.data.value += 5) : null;
});

const multiply5 = stardux.createContainer(null, {value: 1}).use((state, action) => {
  stardux.UPDATE == action.type && action.data.value ? (action.data.value *= 5) : null;
});

const sink = stardux.createContainer();
const composite = stardux.composeContainers([add5, multiply5, sink]).update({value: 5})
assert(50 == sink.state.value);
