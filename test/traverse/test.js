'use strict';
const main = document.querySelector('#main');

function assert (cond, message) {
  if (false == Boolean(cond)) {
    let err = new Error( "AssertionError: "+ message );
    if (Error.captureStackTrace) Error.captureStackTrace(err);
    throw err;
  }
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

testContainerTraversal(2, containerA);
testContainerTraversal(2, containerOne);

function testContainerTraversal (expected, container) {
  let n = 0;
  stardux.traverseContainer(container, (child) => {
    assert(child instanceof stardux.Container)
    n++;
  });

  assert(n == expected);
}
