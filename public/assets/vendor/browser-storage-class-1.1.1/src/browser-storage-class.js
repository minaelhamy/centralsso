/*! BrowserStorageClass v1.1.1 | (c) 2022 M ABD AZIZ ALFIAN | MIT License | https://gitlab.com/aalfiann/browser-storage-class */

'use strict';

class BrowserStorageClass {
  /**
   * Constructor
   * @param {WindowLocalStorage} _typeStorage   It can be localStorage or sessionStorage
   * @param {boolean} _promisify                If set to true, all methods will return as promise. Default is false.
   */
  constructor (_typeStorage, _promisify) {
    this._typeStorage = _typeStorage;
    if (_promisify === undefined) {
      this._promisify = false;
    } else {
      this._promisify = _promisify;
    }
  }

  /**
   * Make asynchronous process based on promise
   * @param {Function} fn   Function callback
   * @returns {mixed}       Will return promise if _promisify set to true
   */
  _promise (fn) {
    if (this._promisify) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            return resolve(fn);
          } catch (e) {
            return reject(e);
          }
        }, 0);
      });
    } else {
      return fn;
    }
  }

  /**
   * Make List data key and value
   * @returns {array}
   */
  _makeList () {
    const list = [];
    let keyName;
    for (let i = 0; i < this._typeStorage.length; i++) {
      keyName = this._typeStorage.key(i);
      list.push({ key: keyName, value: JSON.parse(this._typeStorage.getItem(keyName)) });
    }
    return list;
  }

  /**
   * Has key
   * @param {string} key    Key name
   * @returns {boolean}
   */
  has (key) {
    return this._promise(!!this._typeStorage.getItem(key));
  }

  /**
   * Get value
   * @param {string} key    Key name
   * @returns {mixed}
   */
  get (key) {
    return this._promise(JSON.parse(this._typeStorage.getItem(key)));
  }

  /**
   * Set key and value
   * @param {string} key    Key name
   * @param {mixed} value   Array / String / Object
   */
  set (key, value) {
    return this._promise(this._typeStorage.setItem(key, JSON.stringify(value)));
  }

  /**
   * Remove single data
   * @param {string} key
   */
  remove (key) {
    return this._promise(this._typeStorage.removeItem(key));
  }

  /**
   * Clear all saved data key and value
   */
  clear () {
    return this._promise(this._typeStorage.clear());
  }

  /**
   * List all data key and value
   * @returns {array}
   */
  list () {
    return this._promise(this._makeList());
  }
}

module.exports = BrowserStorageClass;
