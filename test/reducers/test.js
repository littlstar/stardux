'use strict';
function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message );
}
const main = document.querySelector('#main');
const container = stardux.createContainer(main, null,
                                          (state, action) => {
                                            const value = 123;
                                            switch (action.type) {
                                              case stardux.UPDATE:
                                                if (state && state.value)
                                                  assert(value == state.value,
                                                         "Reducer 1 didn't equal expected value.");
                                                return {value: value};
                                            }

                                            return state || {};
                                          },
                                          (state, action) => {
                                            const value = 456;
                                            switch (action.type) {
                                              case stardux.UPDATE:
                                                if (state && state.value)
                                                  assert(value == state.value,
                                                         "Reducer 2 didn't equal expected value.");
                                                return {value: value};
                                            }

                                            return state || {};
                                          });
