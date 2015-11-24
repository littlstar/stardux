'use strict';
const main = document.querySelector('#main');
stardux.createContainer(main);

function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}

const a = stardux.createContainer(main.querySelector('#a'));
const a2 = stardux.createContainer(main.querySelector('#a-2'));
const b = stardux.createContainer(main.querySelector('#b'));
const b2 = stardux.createContainer(main.querySelector('#b-2'));

assert(a.contains(a2), "a does not contain a2");
assert(b.contains(b2), "b does not contain b2");

a.appendChild(b2);
assert(a.contains(b2), "a does not contain b2");

a.appendChild(b);
assert(a.contains(b), "a does not contain b");

a.parent.appendChild(b);
assert(a.parent.contains(b), "a parent does not contain b");

b.appendChild(b2);
assert(b.contains(b2), "b does not contain b2");
