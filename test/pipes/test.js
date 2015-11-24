'use strict';
const main = document.querySelector('#main');
const a = stardux.createContainer(main.querySelector('#a'));
const b = stardux.createContainer(main.querySelector('#b'));
function assert (cond, message) {
  if (false == Boolean(cond)) {
    const err = new Error( "AssertionError: "+ message );
    if (Error.captureStackTrace) Error.captureStackTrace(err);
    throw err;
  }
}
function text (domElement) {
  return String(domElement.textContent).trim();
}

a.pipe(b);

a.update({value: 123});
assert(123 == Number(text(b.domElement)));

a.update({value: 456});
assert(456 == Number(text(b.domElement)));

a.update({value: 'hello'});
assert('hello' == text(b.domElement));

a.update({value: 'world'});
assert('world' == text(b.domElement));

b.update({value: 'kinkajou'});
assert('kinkajou' == text(b.domElement));
