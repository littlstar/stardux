'use strict'
const main = document.querySelector('#main')
const vector = stardux.createContainer(main.querySelector('#vector'))
const normalized = stardux.createContainer(main.querySelector('#vector-normalized'))
const expected = normalize([12, 12, 12])

function assert (cond, message) {
  if (false == Boolean(cond))
    throw new Error( "AssertionError: "+ message )
}

function normalize (v) {
  'use strict'
  let x = v[0]
  let y = v[1]
  let z = v[2]
  let u = Math.sqrt(x * x + y * y + z * z)
  let o = [x/u, y/u, z/u]
  return o
}

vector.pipe(normalized)
normalized.use((state, action) => {
  const data = action.data
  if (stardux.UPDATE == action.type) {
    const x = parseFloat(data.x || state.x) || 0
    const y = parseFloat(data.y || state.y) || 0
    const z = parseFloat(data.z || state.z) || 0
    const v = normalize([x, y, z])
    data.x = v[0] || 0
    data.y = v[1] || 0
    data.z = v[2] || 0
  }
});

vector.update({x: 12, y: 12, z: 12})
assert(normalized.state.x == expected[0])
assert(normalized.state.y == expected[1])
assert(normalized.state.z == expected[2])
