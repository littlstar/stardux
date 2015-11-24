'use strict';
const main = document.querySelector('#main');
function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}
function text (domElement) {
  return String(domElement.textContent).trim();
}
const json = {
  "id": ".9855624e",
  "src": "${ a }\n        <div class=\"b\"> ${ b } </div>",
  "children":[
    {"id":".de0278b8",
     "src":" ${ b } ",
     "children":[]}
  ]
};
const container = stardux.restoreContainerFromJSON(json);
const child = container.children()[0];
container.render(main);

child.update({a: 'beep', b: 'boop'});
assert(!text(container.domElement).match('beep'));
assert(text(child.domElement) == 'boop');

container.update({a: 'BEEP'});
assert(text(container.domElement).match('BEEP'));
assert(text(child.domElement) == 'boop');


container.update({a: 'BAA', b: 'CCD'});
assert(text(container.domElement).match('BAA'));
assert(text(child.domElement) == 'CCD');

container.update({a: 'OK', b: 'OK'});
