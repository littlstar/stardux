'use strict';
const main = document.querySelector('#main');

function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}

const containerA = stardux.createContainer(main.querySelector('.a'));
const containerB = stardux.createContainer(main.querySelector('.b'));
const containerC = stardux.createContainer(main.querySelector('.c'));

const containerOne = stardux.createContainer(main.querySelector('.one'));
const containerTwo = stardux.createContainer(main.querySelector('.two'));
const containerThree = stardux.createContainer(main.querySelector('.three'));

containerA.update({value: 'beep'});
assert('beep' == containerC.domElement.textContent.trim());

containerOne.update({value: 'boop'});
assert('boop' == containerThree.domElement.textContent.trim());

let expected = 6;
let n = 0;
stardux.Container.traverse((id, container) => {
  n++;
  assert(id);
  assert(container);
});

assert(n == expected);
