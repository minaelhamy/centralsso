"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g.BrowserStorageClass = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
        o(t[i]);
      }

      return o;
    }

    return r;
  }()({
    1: [function (require, module, exports) {
      /*! BrowserStorageClass v1.1.1 | (c) 2022 M ABD AZIZ ALFIAN | MIT License | https://gitlab.com/aalfiann/browser-storage-class */
      'use strict';

      var BrowserStorageClass = /*#__PURE__*/function () {
        /**
         * Constructor
         * @param {WindowLocalStorage} _typeStorage   It can be localStorage or sessionStorage
         * @param {boolean} _promisify                If set to true, all methods will return as promise. Default is false.
         */
        function BrowserStorageClass(_typeStorage, _promisify) {
          _classCallCheck(this, BrowserStorageClass);

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


        _createClass(BrowserStorageClass, [{
          key: "_promise",
          value: function _promise(fn) {
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

        }, {
          key: "_makeList",
          value: function _makeList() {
            var list = [];
            var keyName;

            for (var i = 0; i < this._typeStorage.length; i++) {
              keyName = this._typeStorage.key(i);
              list.push({
                key: keyName,
                value: JSON.parse(this._typeStorage.getItem(keyName))
              });
            }

            return list;
          }
          /**
           * Has key
           * @param {string} key    Key name
           * @returns {boolean}
           */

        }, {
          key: "has",
          value: function has(key) {
            return this._promise(!!this._typeStorage.getItem(key));
          }
          /**
           * Get value
           * @param {string} key    Key name
           * @returns {mixed}
           */

        }, {
          key: "get",
          value: function get(key) {
            return this._promise(JSON.parse(this._typeStorage.getItem(key)));
          }
          /**
           * Set key and value
           * @param {string} key    Key name
           * @param {mixed} value   Array / String / Object
           */

        }, {
          key: "set",
          value: function set(key, value) {
            return this._promise(this._typeStorage.setItem(key, JSON.stringify(value)));
          }
          /**
           * Remove single data
           * @param {string} key
           */

        }, {
          key: "remove",
          value: function remove(key) {
            return this._promise(this._typeStorage.removeItem(key));
          }
          /**
           * Clear all saved data key and value
           */

        }, {
          key: "clear",
          value: function clear() {
            return this._promise(this._typeStorage.clear());
          }
          /**
           * List all data key and value
           * @returns {array}
           */

        }, {
          key: "list",
          value: function list() {
            return this._promise(this._makeList());
          }
        }]);

        return BrowserStorageClass;
      }();

      module.exports = BrowserStorageClass;
    }, {}]
  }, {}, [1])(1);
});
