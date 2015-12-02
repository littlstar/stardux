## NPM

Installation with [npm](https://www.npmjs.com) is simple. Invoke the
following command from the root of your project to install and save
Stardux as a dependency.

```sh
$ npm install stardux --save
```

## Duo

Installation with [duo](https://github.com/duojs/duo) can be achieved in
two ways. With a manifest file (`component.json`) or directly in your
`require()` or `import` statements.

### Manifest (component.json)

Add the following to your `.dependencies` object in your manifest file.

```json
{
  ...
  "dependencies": {
    "littlstar/stardux": "*"
  }
}
```

### Inline (require/import)

Add the following to your `require` or `import` statements.

```js
const stardux = require('littlstar/stardux')
```

```js
import stardux from 'littlstar/stardux'
```

## Distribution Build

You can grab a copy of the distribution build found in the
[dist/](https://github.com/littlstar/stardux/tree/master/dist)
directory.

## From Source

You can build stardux yourself by following these steps:

* `$ git clone https://github.com/littlstar/stardux.git`
* `$ cd stardux`
* `$ make`

You can build a distribution version by invoking:

```sh
$ make dist
```

You can then find a built version in the `build/` directory in your
path.
