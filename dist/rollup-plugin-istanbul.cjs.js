'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var istanbul = _interopDefault(require('istanbul-lib-instrument'));
var path = require('path');

function makeFilter(opts, extensions) {
  var filter = rollupPluginutils.createFilter(opts.include, opts.exclude);

  extensions = opts.extensions || extensions;
  if (!extensions || extensions === '*') {
    return filter;
  }

  if (!Array.isArray(extensions)) {
    extensions = [extensions];
  }
  extensions = extensions.map(function (e) {
    return e[0] !== '.' ? '.' + e : e;
  });

  return function (id) {
    return filter(id) && extensions.indexOf(path.extname(id)) > -1;
  };
}

function index () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var filter = makeFilter(options, ['.js']),
      opts = Object.assign({ esModules: true, compact: options.compact !== false }, options.instrumenterConfig, { produceSourceMap: options.sourceMap !== false }),
      instrumenter = new (options.instrumenter || istanbul).createInstrumenter(opts);

  return {
    name: 'istanbul',
    transform: function transform(code, id) {
      if (!filter(id)) return;

      // TODO require the inputSourceMap that generated by the previous plugins
      code = instrumenter.instrumentSync(code, id);

      return { code: code, map: instrumenter.lastSourceMap() };
    }
  };
}

module.exports = index;
