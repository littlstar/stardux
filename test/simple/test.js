'use strict';
const main = document.querySelector('#main');
const containerA = stardux.createContainer(main.querySelector('.a'));
function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}
containerA.update({ value: "Hello World" });
assert(main.querySelector('.a').textContent == "Hello World");
