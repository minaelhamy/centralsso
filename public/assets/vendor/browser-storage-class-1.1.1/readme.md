# Browser Storage Class

[![NPM](https://nodei.co/npm/browser-storage-class.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/browser-storage-class/)
[![js-semistandard-style](https://raw.githubusercontent.com/standard/semistandard/master/badge.svg)](https://github.com/standard/semistandard)  
  
[![npm version](https://img.shields.io/npm/v/browser-storage-class.svg?style=flat-square)](https://www.npmjs.org/package/browser-storage-class)
![Gitlab Pipeline](https://gitlab.com/aalfiann/browser-storage-class/badges/master/pipeline.svg)
![Gitlab Coverage](https://gitlab.com/aalfiann/browser-storage-class/badges/master/coverage.svg)
![NPM download/month](https://img.shields.io/npm/dm/browser-storage-class.svg)
![NPM download total](https://img.shields.io/npm/dt/browser-storage-class.svg)
[![](https://data.jsdelivr.com/v1/package/npm/browser-storage-class/badge)](https://www.jsdelivr.com/package/npm/browser-storage-class)  
A Browser Storage Class for NodeJS or Browser  

There are many library to handle local or session storage for browser out there. But many of them is too bloated for browser. Actually we just need a simple wrapper class, so your website still lightweight and running fast.

## Minimum Requirement
- Tested with NodeJS v10.
- All browsers with support ES5.

## Install using NPM
```bash
$ npm install browser-storage-class
```

**Or simply use in Browser with CDN**
```html
<!-- Always get the latest version -->
<!-- Not recommended for production sites! -->
<script src="https://cdn.jsdelivr.net/npm/browser-storage-class/dist/browser-storage-class.min.js"></script>

<!-- Get minor updates and patch fixes within a major version -->
<script src="https://cdn.jsdelivr.net/npm/browser-storage-class@1/dist/browser-storage-class.min.js"></script>

<!-- Get patch fixes within a minor version -->
<script src="https://cdn.jsdelivr.net/npm/browser-storage-class@1.1/dist/browser-storage-class.min.js"></script>

<!-- Get a specific version -->
<!-- Recommended for production sites! -->
<script src="https://cdn.jsdelivr.net/npm/browser-storage-class@1.1.1/dist/browser-storage-class.min.js"></script>
```

## Usage

### Local or Session Storage
```js
const BrowserStorageClass = require('browser-storage-class'); // in browser doesn't need this line

// Example

// Use LocalStorage
var storage = new BrowserStorageClass(localStorage);

// Use SessionStorage
var storage = new BrowserStorageClass(sessionStorage);

// If you want asynchronous
//
// Note:
// - All methods will return as promise.
var storage = new BrowserStorageClass(localStorage, true);
```

### Save or add new value
```js
storage.set('yourkeyname1', 'Saving value as string');
storage.set('yourkeyname2', ['saving', 'value', 'as', 'array']);
storage.set('yourkeyname3', {name: 'budi', address: 'jakarta', info:'saving value as object'});
```

Note: 
- You are able to save tipe data value as `string`, `array`, and `object`.
- You are able to use `set` to update the value.  
Because `Key` name is primary, it will automatically replace old value.

### Get value from key
```js
storage.get('yourkeyname2');
```

### Check value is exist or not
```js
if(storage.has('yourkeyname1')) {
    console.log('Found!');
} else {
    console.log('Not Found!');
}
```

### Remove single data
```js
storage.remove('yourkeyname2');
```

### Clear all data
```js
storage.clear();
```

### List all saved data
```js
storage.list();
```

## API
- `BrowserStorageClass(_typeStorage[, _promisify])`  
_typeStorage {WindowLocalStorage} : localStorage or sessionStorage.  
_promisify {boolean} : If set to true, all methods will return as promise. Optional, default is false.

- `has(key)`  
key {string} : Key name for your data value.  
returns {boolean}

- `set(key, value)`  
key {string} : Key name for your data value.  
value {mixed} : Value can be string / array / object.

- `get(key)`  
key {string} : Key name for your data value.  
returns {mixed} : Value can be string / array / object.

- `remove(key)`  
key {string} : Key name for your data value.  

- `clear()`  
This will clear all data storage.

- `list()`  
returns {array}  

This will show all saved data in storage.

## Unit Test
If you want to playing around with test
```bash
npm test
```
