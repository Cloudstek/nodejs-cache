# @cloudstek/cache
> Simple key/value (cache) store.

It doesn't do anything fancy and it doesn't have a fancy name. Yet I needed a simple key/value store with optional support for expiration of items.

### Features

* Optional expiration of items (without expiration it works as a simple k/v store)
* Per-item configurable TTL.
* Iterable storage
* Written in typescript
* Support writing to JSON or in-memory.

## Requirements

* NodeJS >= 8
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

## Also check out

 [sindresorhus/conf](https://github.com/sindresorhus/conf): Simple config handling for your app or module