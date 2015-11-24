'use strict';
const main = document.querySelector('#main');
const containerA = stardux.createContainer(main.querySelector('.a'));
const containerB = stardux.createContainer(main.querySelector('.b'));
function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}

function text (domElement) {
  return String(domElement.textContent).trim();
}

containerA.update({ b: "BBB" });
assert(text(main.querySelector('.b')) == 'BBB',
      "containerA with containerB update assertion failed.");

containerB.update({ b: "bbb" });
assert(text(main.querySelector('.b')) == 'bbb',
      "containerB update assertion failed");

containerA.update({ a: "AAA" });
assert(text(main.querySelector('.a')).match('AAA'),
       "containerA assertion failed");

// fin
containerA.update({ a: "OK", b: "OK" });
