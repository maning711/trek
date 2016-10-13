'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _http = require('http');

var _trekEngine = require('trek-engine');

var _trekEngine2 = _interopRequireDefault(_trekEngine);

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

var _paths = require('./paths');

var _paths2 = _interopRequireDefault(_paths);

var _plugins = require('./plugins');

var _plugins2 = _interopRequireDefault(_plugins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// lifecycle:
//    created
//    beforeRun
//    running
//    ran

class Trek extends _trekEngine2.default {

  constructor(root = (0, _path.dirname)(require.main.filename)) {
    super();

    this.root = root;
    this.paths = new _paths2.default(root);
    this.loader = new _loader2.default(this);
    this.hooks = {};
    this.plugins = new Map();
  }

  // rewrite
  _init() {}

  // rewrite
  initialize(all = true) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.initialized) return _this;

      _this.usePlugin(..._plugins2.default);

      if (all) {
        let plugins = yield _this.paths.get('app/plugins');
        if (plugins) {
          if (Array.isArray(plugins)) {
            // app/plugins/*.js
            plugins = plugins.map(function (p) {
              return _this.loader.require(p);
            });
          } else {
            // app/plugins/index.js
            plugins = _this.loader.require(plugins);
          }
          if (!Array.isArray(plugins)) {
            plugins = [plugins];
          }
          _this.usePlugin(...plugins);
        }
      }

      yield _this.callHook('created');

      _this.initialized = true;

      return _this;
    })();
  }

  // rewrite
  invoke(ctx, onError) {
    return this.callHook('running', ctx, onError);
  }

  // rewrite
  run() {
    var _this2 = this,
        _arguments = arguments;

    return _asyncToGenerator(function* () {
      yield _this2.callHook('beforeRun');
      // return super.run(...arguments)
      const server = _this2.server || new _http.Server();
      server.on('request', function (req, res) {
        return _this2.handle(req, res);
      });
      return server.listen(..._arguments);
    })();
  }

  usePlugin(...args) {
    for (const Plugin of args) {
      if (Plugin.install && !Plugin.installed) {
        this.plugins.set(Plugin.name, Plugin.install(this));
      }
    }
  }

  callHook(hook, ...args) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return (_this3.hooks[hook] || []).concat(_this3.findHandlersByHook(hook)).forEach((() => {
        var _ref = _asyncToGenerator(function* (handler) {
          return yield handler(_this3, ...args);
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })());
    })();
  }

  findHandlersByHook(hook) {
    return Array.from(this.plugins.values()).filter(plugin => plugin[hook]).map(plugin => plugin[hook].bind(plugin));
  }

}
exports.default = Trek;