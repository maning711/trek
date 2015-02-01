import path from 'path';
import {Root} from './paths';
import {MiddlewareStackProxy, Generators} from './configuration';
import {Trekking, Configuration as TrekkingConfiguration} from './trekking';



class Configuration extends TrekkingConfiguration {

  constructor(root = null) {
    super();
    //this._root = root;
    //// copy
    //this._generators = Object.create(this.appGenerators);
  }

  get middleware() {
    return this._middleware || (this._middleware = new MiddlewareStackProxy);
  }

  generators(cb) {
    this._generators || (this._generators = new Generators);
    if (cb) {
      cb(this._generators);
    }
    return this._generators;
  }

  get paths() {
    return this._paths || (this._paths = generatePaths(this._root));
  }

  get root() {
    return this._root;
  }

  set root(value) {
    return this._root = this.paths.path = path.resolve(value);
  }
}

var generatePaths= (root) => {
  let paths = new Root(root);

  paths.add('app');
  paths.add('app/controllers');
  paths.add('app/helpers');
  paths.add('app/models');
  paths.add('app/mailers');
  paths.add('app/views');

  paths.add('lib');
  paths.add('lib/tasks',            { glob: '**/*.gulp.js' });

  paths.add('config');
  paths.add('config/environments',  { glob: `${Trek.env}.js` });
  paths.add('config/locales',       { glob: '*.{js,yml}' });
  paths.add('config/routes.js');

  return paths;
};



class MiddlewareStack {}



class Engine extends Trekking {

  static find(path) {
  }

  static findRoot(from) {
  }

  static findRootWithFlag(flag, from, _default) {
  }

  constructor() {
    this._app       = null;
    this._config    = null;
    this._envConfig = null;
    this._helpers   = null;
    this._routes    = null;
    super();
  }

  get config() {
    return this._config || (this._config = new Configuration());
  }
  get middleware() {
    return this.config.middleware;
  }
  get root() {
    return this.config.root;
  }
  get paths() {
    return this.config.paths;
  }

  get routes() {
    //this._routes ? = 
    return this._routes;
  }

  get envConfig() {
    return this._envConfig || (this._envConfig = Object.create({
      routes: this.routes
    }));
  }

  get app() {
    //this._app ?=
  }

  endpoint(endpoint) {
    this._endpoint ?= null;
    if (endpoint) this._endpoint = endpoint;
    return this._endpoint;
  }

  run(env) {
    //this.app.call(env);
  }

  get defaultMiddlewareStack() {
    return new MiddlewareStack();
  }

}



export {Engine, Configuration};
