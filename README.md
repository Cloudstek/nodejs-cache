# @cloudstek/cache
> Simple key/value (cache) store.

[![CircleCI](https://circleci.com/gh/Cloudstek/nodejs-cache.svg?style=svg)](https://circleci.com/gh/Cloudstek/nodejs-cache) [![Coverage Status](https://coveralls.io/repos/github/Cloudstek/nodejs-cache/badge.svg?branch=master)](https://coveralls.io/github/Cloudstek/nodejs-cache?branch=master)

It doesn't do anything fancy and it doesn't have a fancy name. Yet I needed a simple key/value store with optional support for expiration of items.

### Features

* Optional expiration of items (without expiration it works as a simple k/v store)
* Per-item configurable TTL.
* Iterable storage
* Written in typescript
* Support writing to JSON or in-memory.

## Requirements

* NodeJS >= 10
* NPM / Yarn

## Installation

Using yarn (preferred):

```sh
yarn add @cloudstek/cache
```

Using NPM:

```sh
npm install @cloudstek/cache
```

## Development

Clone this repository to get started. You can replace `yarn` in the commands below with `npm` if you use NPM.

### Build code and watch for changes

During development you can build the code once and have typescript watch for changes and recompile automatically.

```sh
yarn run watch
```

### Checking code for style

To check the code for style correctness run:

```sh
yarn run lint
```

### Running tests

Tests are run using [Ava](https://github.com/avajs/ava) and coverage is generated using [Istanbul](https://istanbul.js.org/). To run the tests run:

```sh
yarn run build
yarn run test
```

### Building the code for release

To build the code for release (e.g. npm publish), run:

```sh
yarn run build:dist
```

## Also check out

 [sindresorhus/conf](https://github.com/sindresorhus/conf): Simple config handling for your app or module
