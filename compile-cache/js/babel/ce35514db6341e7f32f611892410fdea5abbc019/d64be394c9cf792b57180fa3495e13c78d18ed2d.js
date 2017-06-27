Object.defineProperty(exports, '__esModule', {
  value: true
});

var stat = _asyncToGenerator(function* (pathname) {
  return new Promise(function (resolve, reject) {
    _fs2['default'].stat(pathname, function (err, stats) {
      if (err) {
        return reject(err);
      }
      return resolve(stats);
    });
  });
}

/**
 * Shim for TSLint v3 interoperability
 * @param {Function} Linter TSLint v3 linter
 * @return {Function} TSLint v4-compatible linter
 */
);

var getLocalLinter = _asyncToGenerator(function* (basedir) {
  return new Promise(function (resolve) {
    if (!requireResolve) {
      requireResolve = require('resolve');
    }
    requireResolve(tslintModuleName, { basedir: basedir }, function (err, linterPath, pkg) {
      var linter = undefined;
      if (!err && pkg && /^3|4|5\./.test(pkg.version)) {
        if (pkg.version.startsWith('3')) {
          // eslint-disable-next-line import/no-dynamic-require
          linter = shim(require('loophole').allowUnsafeNewFunction(function () {
            return require(linterPath);
          }));
        } else {
          // eslint-disable-next-line import/no-dynamic-require
          linter = require('loophole').allowUnsafeNewFunction(function () {
            return require(linterPath).Linter;
          });
        }
      } else {
        linter = tslintDef;
      }
      tslintCache.set(basedir, linter);
      return resolve(linter);
    });
  });
});

var getLinter = _asyncToGenerator(function* (filePath) {
  var basedir = _path2['default'].dirname(filePath);
  if (tslintCache.has(basedir)) {
    return tslintCache.get(basedir);
  }

  // Initialize the default instance if it hasn't already been initialized
  loadDefaultTSLint();

  if (config.useLocalTslint) {
    return getLocalLinter(basedir);
  }

  tslintCache.set(basedir, tslintDef);
  return tslintDef;
});

var getProgram = _asyncToGenerator(function* (Linter, configurationPath) {
  var program = undefined;
  var configurationDir = _path2['default'].dirname(configurationPath);
  var tsconfigPath = _path2['default'].resolve(configurationDir, 'tsconfig.json');
  try {
    var stats = yield stat(tsconfigPath);
    if (stats.isFile()) {
      program = Linter.createProgram('tsconfig.json', configurationDir);
    }
  } catch (err) {
    // no-op
  }
  return program;
}

/**
 * Lint the provided TypeScript content
 * @param content {string} The content of the TypeScript file
 * @param filePath {string} File path of the TypeScript filePath
 * @param options {Object} Linter options
 * @return Array of lint results
 */
);

var lint = _asyncToGenerator(function* (content, filePath, options) {
  if (filePath === null || filePath === undefined) {
    return null;
  }

  var lintResult = undefined;
  try {
    var Linter = yield getLinter(filePath);
    var configurationPath = Linter.findConfigurationPath(null, filePath);
    var configuration = Linter.loadConfigurationFromPath(configurationPath);

    var rulesDirectory = configuration.rulesDirectory;

    if (rulesDirectory && configurationPath) {
      (function () {
        var configurationDir = _path2['default'].dirname(configurationPath);
        if (!Array.isArray(rulesDirectory)) {
          rulesDirectory = [rulesDirectory];
        }
        rulesDirectory = rulesDirectory.map(function (dir) {
          if (_path2['default'].isAbsolute(dir)) {
            return dir;
          }
          return _path2['default'].join(configurationDir, dir);
        });

        if (config.rulesDirectory) {
          rulesDirectory.push(config.rulesDirectory);
        }
      })();
    }

    var program = undefined;
    if (config.enableSemanticRules && configurationPath) {
      program = yield getProgram(Linter, configurationPath);
    }

    var linter = new Linter(Object.assign({
      formatter: 'json',
      rulesDirectory: rulesDirectory
    }, options), program);

    linter.lint(filePath, content, configuration);
    lintResult = linter.getResult();
  } catch (err) {
    console.error(err.message, err.stack); // eslint-disable-line no-console
    lintResult = {};
  }

  if (
  // tslint@<5
  !lintResult.failureCount &&
  // tslint@>=5
  !lintResult.errorCount && !lintResult.warningCount && !lintResult.infoCount) {
    return [];
  }

  return lintResult.failures.map(function (failure) {
    var ruleUri = (0, _tslintRuleDocumentation.getRuleUri)(failure.getRuleName());
    var startPosition = failure.getStartPosition().getLineAndCharacter();
    var endPosition = failure.getEndPosition().getLineAndCharacter();
    return {
      type: failure.ruleSeverity || 'warning',
      html: (0, _escapeHtml2['default'])(failure.getFailure()) + ' (<a href="' + ruleUri.uri + '">' + failure.getRuleName() + '</a>)',
      filePath: _path2['default'].normalize(failure.getFileName()),
      range: [[startPosition.line, startPosition.character], [endPosition.line, endPosition.character]]
    };
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* global emit */

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tslintRuleDocumentation = require('tslint-rule-documentation');

'use babel';

process.title = 'linter-tslint worker';

var tslintModuleName = 'tslint';
var tslintCache = new Map();
var config = {
  useLocalTslint: false
};

var tslintDef = undefined;
var requireResolve = undefined;

function shim(Linter) {
  function LinterShim(options) {
    this.options = options;
    this.results = {};
  }

  // Assign class properties
  Object.assign(LinterShim, Linter);

  // Assign instance methods
  LinterShim.prototype = Object.assign({}, Linter.prototype, {
    lint: function lint(filePath, text, configuration) {
      var options = Object.assign({}, this.options, { configuration: configuration });
      var linter = new Linter(filePath, text, options);
      this.results = linter.lint();
    },
    getResult: function getResult() {
      return this.results;
    }
  });

  return LinterShim;
}

function loadDefaultTSLint() {
  if (!tslintDef) {
    // eslint-disable-next-line import/no-dynamic-require
    tslintDef = require(tslintModuleName).Linter;
  }
}

exports['default'] = _asyncToGenerator(function* (initialConfig) {
  config.useLocalTslint = initialConfig.useLocalTslint;
  config.enableSemanticRules = initialConfig.enableSemanticRules;

  process.on('message', _asyncToGenerator(function* (message) {
    if (message.messageType === 'config') {
      config[message.message.key] = message.message.value;

      if (message.message.key === 'useLocalTslint') {
        tslintCache.clear();
      }
    } else {
      var _message$message = message.message;
      var emitKey = _message$message.emitKey;
      var jobType = _message$message.jobType;
      var content = _message$message.content;
      var filePath = _message$message.filePath;

      var options = jobType === 'fix' ? { fix: true } : {};

      var results = yield lint(content, filePath, options);
      emit(emitKey, results);
    }
  }));
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvZWY4bGovLmF0b20vcGFja2FnZXMvbGludGVyLXRzbGludC9saWIvd29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFvQmUsSUFBSSxxQkFBbkIsV0FBb0IsUUFBUSxFQUFFO0FBQzVCLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLG9CQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFLO0FBQ2hDLFVBQUksR0FBRyxFQUFFO0FBQ1AsZUFBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDcEI7QUFDRCxhQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2QixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSjs7Ozs7Ozs7O0lBc0NjLGNBQWMscUJBQTdCLFdBQThCLE9BQU8sRUFBRTtBQUNyQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLFFBQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsb0JBQWMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDckM7QUFDRCxrQkFBYyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBRSxFQUMxQyxVQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFLO0FBQ3hCLFVBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxVQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUMvQyxZQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFOztBQUUvQixnQkFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsc0JBQXNCLENBQUM7bUJBQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQztX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QyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzs7QUFFcEQsVUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxnQkFBZ0IsRUFBRTtBQUM1QyxtQkFBVyxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ3JCO0tBQ0YsTUFBTTs2QkFDMkMsT0FBTyxDQUFDLE9BQU87VUFBdkQsT0FBTyxvQkFBUCxPQUFPO1VBQUUsT0FBTyxvQkFBUCxPQUFPO1VBQUUsT0FBTyxvQkFBUCxPQUFPO1VBQUUsUUFBUSxvQkFBUixRQUFROztBQUMzQyxVQUFNLE9BQU8sR0FBRyxPQUFPLEtBQUssS0FBSyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkQsVUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RCxVQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3hCO0dBQ0YsRUFBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9lZjhsai8uYXRvbS9wYWNrYWdlcy9saW50ZXItdHNsaW50L2xpYi93b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyogZ2xvYmFsIGVtaXQgKi9cblxuaW1wb3J0IGVzY2FwZUhUTUwgZnJvbSAnZXNjYXBlLWh0bWwnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0UnVsZVVyaSB9IGZyb20gJ3RzbGludC1ydWxlLWRvY3VtZW50YXRpb24nO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2xpbnRlci10c2xpbnQgd29ya2VyJztcblxuY29uc3QgdHNsaW50TW9kdWxlTmFtZSA9ICd0c2xpbnQnO1xuY29uc3QgdHNsaW50Q2FjaGUgPSBuZXcgTWFwKCk7XG5jb25zdCBjb25maWcgPSB7XG4gIHVzZUxvY2FsVHNsaW50OiBmYWxzZSxcbn07XG5cbmxldCB0c2xpbnREZWY7XG5sZXQgcmVxdWlyZVJlc29sdmU7XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXQocGF0aG5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmcy5zdGF0KHBhdGhuYW1lLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZShzdGF0cyk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNoaW0gZm9yIFRTTGludCB2MyBpbnRlcm9wZXJhYmlsaXR5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBMaW50ZXIgVFNMaW50IHYzIGxpbnRlclxuICogQHJldHVybiB7RnVuY3Rpb259IFRTTGludCB2NC1jb21wYXRpYmxlIGxpbnRlclxuICovXG5mdW5jdGlvbiBzaGltKExpbnRlcikge1xuICBmdW5jdGlvbiBMaW50ZXJTaGltKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMucmVzdWx0cyA9IHt9O1xuICB9XG5cbiAgLy8gQXNzaWduIGNsYXNzIHByb3BlcnRpZXNcbiAgT2JqZWN0LmFzc2lnbihMaW50ZXJTaGltLCBMaW50ZXIpO1xuXG4gIC8vIEFzc2lnbiBpbnN0YW5jZSBtZXRob2RzXG4gIExpbnRlclNoaW0ucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbih7fSwgTGludGVyLnByb3RvdHlwZSwge1xuICAgIGxpbnQoZmlsZVBhdGgsIHRleHQsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIHsgY29uZmlndXJhdGlvbiB9KTtcbiAgICAgIGNvbnN0IGxpbnRlciA9IG5ldyBMaW50ZXIoZmlsZVBhdGgsIHRleHQsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5yZXN1bHRzID0gbGludGVyLmxpbnQoKTtcbiAgICB9LFxuICAgIGdldFJlc3VsdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlc3VsdHM7XG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIExpbnRlclNoaW07XG59XG5cbmZ1bmN0aW9uIGxvYWREZWZhdWx0VFNMaW50KCkge1xuICBpZiAoIXRzbGludERlZikge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZHluYW1pYy1yZXF1aXJlXG4gICAgdHNsaW50RGVmID0gcmVxdWlyZSh0c2xpbnRNb2R1bGVOYW1lKS5MaW50ZXI7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0TG9jYWxMaW50ZXIoYmFzZWRpcikge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBpZiAoIXJlcXVpcmVSZXNvbHZlKSB7XG4gICAgICByZXF1aXJlUmVzb2x2ZSA9IHJlcXVpcmUoJ3Jlc29sdmUnKTtcbiAgICB9XG4gICAgcmVxdWlyZVJlc29sdmUodHNsaW50TW9kdWxlTmFtZSwgeyBiYXNlZGlyIH0sXG4gICAgICAoZXJyLCBsaW50ZXJQYXRoLCBwa2cpID0+IHtcbiAgICAgICAgbGV0IGxpbnRlcjtcbiAgICAgICAgaWYgKCFlcnIgJiYgcGtnICYmIC9eM3w0fDVcXC4vLnRlc3QocGtnLnZlcnNpb24pKSB7XG4gICAgICAgICAgaWYgKHBrZy52ZXJzaW9uLnN0YXJ0c1dpdGgoJzMnKSkge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICAgICAgICAgIGxpbnRlciA9IHNoaW0ocmVxdWlyZSgnbG9vcGhvbGUnKS5hbGxvd1Vuc2FmZU5ld0Z1bmN0aW9uKCgpID0+IHJlcXVpcmUobGludGVyUGF0aCkpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1keW5hbWljLXJlcXVpcmVcbiAgICAgICAgICAgIGxpbnRlciA9IHJlcXVpcmUoJ2xvb3Bob2xlJykuYWxsb3dVbnNhZmVOZXdGdW5jdGlvbigoKSA9PiByZXF1aXJlKGxpbnRlclBhdGgpLkxpbnRlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpbnRlciA9IHRzbGludERlZjtcbiAgICAgICAgfVxuICAgICAgICB0c2xpbnRDYWNoZS5zZXQoYmFzZWRpciwgbGludGVyKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobGludGVyKTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldExpbnRlcihmaWxlUGF0aCkge1xuICBjb25zdCBiYXNlZGlyID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgaWYgKHRzbGludENhY2hlLmhhcyhiYXNlZGlyKSkge1xuICAgIHJldHVybiB0c2xpbnRDYWNoZS5nZXQoYmFzZWRpcik7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIHRoZSBkZWZhdWx0IGluc3RhbmNlIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWRcbiAgbG9hZERlZmF1bHRUU0xpbnQoKTtcblxuICBpZiAoY29uZmlnLnVzZUxvY2FsVHNsaW50KSB7XG4gICAgcmV0dXJuIGdldExvY2FsTGludGVyKGJhc2VkaXIpO1xuICB9XG5cbiAgdHNsaW50Q2FjaGUuc2V0KGJhc2VkaXIsIHRzbGludERlZik7XG4gIHJldHVybiB0c2xpbnREZWY7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFByb2dyYW0oTGludGVyLCBjb25maWd1cmF0aW9uUGF0aCkge1xuICBsZXQgcHJvZ3JhbTtcbiAgY29uc3QgY29uZmlndXJhdGlvbkRpciA9IHBhdGguZGlybmFtZShjb25maWd1cmF0aW9uUGF0aCk7XG4gIGNvbnN0IHRzY29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShjb25maWd1cmF0aW9uRGlyLCAndHNjb25maWcuanNvbicpO1xuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgc3RhdCh0c2NvbmZpZ1BhdGgpO1xuICAgIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgcHJvZ3JhbSA9IExpbnRlci5jcmVhdGVQcm9ncmFtKCd0c2NvbmZpZy5qc29uJywgY29uZmlndXJhdGlvbkRpcik7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBuby1vcFxuICB9XG4gIHJldHVybiBwcm9ncmFtO1xufVxuXG4vKipcbiAqIExpbnQgdGhlIHByb3ZpZGVkIFR5cGVTY3JpcHQgY29udGVudFxuICogQHBhcmFtIGNvbnRlbnQge3N0cmluZ30gVGhlIGNvbnRlbnQgb2YgdGhlIFR5cGVTY3JpcHQgZmlsZVxuICogQHBhcmFtIGZpbGVQYXRoIHtzdHJpbmd9IEZpbGUgcGF0aCBvZiB0aGUgVHlwZVNjcmlwdCBmaWxlUGF0aFxuICogQHBhcmFtIG9wdGlvbnMge09iamVjdH0gTGludGVyIG9wdGlvbnNcbiAqIEByZXR1cm4gQXJyYXkgb2YgbGludCByZXN1bHRzXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxpbnQoY29udGVudCwgZmlsZVBhdGgsIG9wdGlvbnMpIHtcbiAgaWYgKGZpbGVQYXRoID09PSBudWxsIHx8IGZpbGVQYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBsaW50UmVzdWx0O1xuICB0cnkge1xuICAgIGNvbnN0IExpbnRlciA9IGF3YWl0IGdldExpbnRlcihmaWxlUGF0aCk7XG4gICAgY29uc3QgY29uZmlndXJhdGlvblBhdGggPSBMaW50ZXIuZmluZENvbmZpZ3VyYXRpb25QYXRoKG51bGwsIGZpbGVQYXRoKTtcbiAgICBjb25zdCBjb25maWd1cmF0aW9uID0gTGludGVyLmxvYWRDb25maWd1cmF0aW9uRnJvbVBhdGgoY29uZmlndXJhdGlvblBhdGgpO1xuXG4gICAgbGV0IHsgcnVsZXNEaXJlY3RvcnkgfSA9IGNvbmZpZ3VyYXRpb247XG4gICAgaWYgKHJ1bGVzRGlyZWN0b3J5ICYmIGNvbmZpZ3VyYXRpb25QYXRoKSB7XG4gICAgICBjb25zdCBjb25maWd1cmF0aW9uRGlyID0gcGF0aC5kaXJuYW1lKGNvbmZpZ3VyYXRpb25QYXRoKTtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlc0RpcmVjdG9yeSkpIHtcbiAgICAgICAgcnVsZXNEaXJlY3RvcnkgPSBbcnVsZXNEaXJlY3RvcnldO1xuICAgICAgfVxuICAgICAgcnVsZXNEaXJlY3RvcnkgPSBydWxlc0RpcmVjdG9yeS5tYXAoKGRpcikgPT4ge1xuICAgICAgICBpZiAocGF0aC5pc0Fic29sdXRlKGRpcikpIHtcbiAgICAgICAgICByZXR1cm4gZGlyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXRoLmpvaW4oY29uZmlndXJhdGlvbkRpciwgZGlyKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY29uZmlnLnJ1bGVzRGlyZWN0b3J5KSB7XG4gICAgICAgIHJ1bGVzRGlyZWN0b3J5LnB1c2goY29uZmlnLnJ1bGVzRGlyZWN0b3J5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcHJvZ3JhbTtcbiAgICBpZiAoY29uZmlnLmVuYWJsZVNlbWFudGljUnVsZXMgJiYgY29uZmlndXJhdGlvblBhdGgpIHtcbiAgICAgIHByb2dyYW0gPSBhd2FpdCBnZXRQcm9ncmFtKExpbnRlciwgY29uZmlndXJhdGlvblBhdGgpO1xuICAgIH1cblxuICAgIGNvbnN0IGxpbnRlciA9IG5ldyBMaW50ZXIoT2JqZWN0LmFzc2lnbih7XG4gICAgICBmb3JtYXR0ZXI6ICdqc29uJyxcbiAgICAgIHJ1bGVzRGlyZWN0b3J5LFxuICAgIH0sIG9wdGlvbnMpLCBwcm9ncmFtKTtcblxuICAgIGxpbnRlci5saW50KGZpbGVQYXRoLCBjb250ZW50LCBjb25maWd1cmF0aW9uKTtcbiAgICBsaW50UmVzdWx0ID0gbGludGVyLmdldFJlc3VsdCgpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGVyci5tZXNzYWdlLCBlcnIuc3RhY2spOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICBsaW50UmVzdWx0ID0ge307XG4gIH1cblxuICBpZiAoXG4gICAgLy8gdHNsaW50QDw1XG4gICAgIWxpbnRSZXN1bHQuZmFpbHVyZUNvdW50ICYmXG4gICAgLy8gdHNsaW50QD49NVxuICAgICFsaW50UmVzdWx0LmVycm9yQ291bnQgJiZcbiAgICAhbGludFJlc3VsdC53YXJuaW5nQ291bnQgJiZcbiAgICAhbGludFJlc3VsdC5pbmZvQ291bnRcbiAgKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmV0dXJuIGxpbnRSZXN1bHQuZmFpbHVyZXMubWFwKChmYWlsdXJlKSA9PiB7XG4gICAgY29uc3QgcnVsZVVyaSA9IGdldFJ1bGVVcmkoZmFpbHVyZS5nZXRSdWxlTmFtZSgpKTtcbiAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gZmFpbHVyZS5nZXRTdGFydFBvc2l0aW9uKCkuZ2V0TGluZUFuZENoYXJhY3RlcigpO1xuICAgIGNvbnN0IGVuZFBvc2l0aW9uID0gZmFpbHVyZS5nZXRFbmRQb3NpdGlvbigpLmdldExpbmVBbmRDaGFyYWN0ZXIoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogZmFpbHVyZS5ydWxlU2V2ZXJpdHkgfHwgJ3dhcm5pbmcnLFxuICAgICAgaHRtbDogYCR7ZXNjYXBlSFRNTChmYWlsdXJlLmdldEZhaWx1cmUoKSl9ICg8YSBocmVmPVwiJHtydWxlVXJpLnVyaX1cIj4ke2ZhaWx1cmUuZ2V0UnVsZU5hbWUoKX08L2E+KWAsXG4gICAgICBmaWxlUGF0aDogcGF0aC5ub3JtYWxpemUoZmFpbHVyZS5nZXRGaWxlTmFtZSgpKSxcbiAgICAgIHJhbmdlOiBbXG4gICAgICAgIFtzdGFydFBvc2l0aW9uLmxpbmUsIHN0YXJ0UG9zaXRpb24uY2hhcmFjdGVyXSxcbiAgICAgICAgW2VuZFBvc2l0aW9uLmxpbmUsIGVuZFBvc2l0aW9uLmNoYXJhY3Rlcl0sXG4gICAgICBdLFxuICAgIH07XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiAoaW5pdGlhbENvbmZpZykge1xuICBjb25maWcudXNlTG9jYWxUc2xpbnQgPSBpbml0aWFsQ29uZmlnLnVzZUxvY2FsVHNsaW50O1xuICBjb25maWcuZW5hYmxlU2VtYW50aWNSdWxlcyA9IGluaXRpYWxDb25maWcuZW5hYmxlU2VtYW50aWNSdWxlcztcblxuICBwcm9jZXNzLm9uKCdtZXNzYWdlJywgYXN5bmMgKG1lc3NhZ2UpID0+IHtcbiAgICBpZiAobWVzc2FnZS5tZXNzYWdlVHlwZSA9PT0gJ2NvbmZpZycpIHtcbiAgICAgIGNvbmZpZ1ttZXNzYWdlLm1lc3NhZ2Uua2V5XSA9IG1lc3NhZ2UubWVzc2FnZS52YWx1ZTtcblxuICAgICAgaWYgKG1lc3NhZ2UubWVzc2FnZS5rZXkgPT09ICd1c2VMb2NhbFRzbGludCcpIHtcbiAgICAgICAgdHNsaW50Q2FjaGUuY2xlYXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeyBlbWl0S2V5LCBqb2JUeXBlLCBjb250ZW50LCBmaWxlUGF0aCB9ID0gbWVzc2FnZS5tZXNzYWdlO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IGpvYlR5cGUgPT09ICdmaXgnID8geyBmaXg6IHRydWUgfSA6IHt9O1xuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgbGludChjb250ZW50LCBmaWxlUGF0aCwgb3B0aW9ucyk7XG4gICAgICBlbWl0KGVtaXRLZXksIHJlc3VsdHMpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=