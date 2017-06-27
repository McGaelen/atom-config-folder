Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _workerHelper = require('./workerHelper');

var workerHelper = _interopRequireWildcard(_workerHelper);

'use babel';

var grammarScopes = ['source.ts', 'source.tsx'];
var editorClass = 'linter-tslint-compatible-editor';
var idleCallbacks = new Set();
var config = {
  rulesDirectory: null,
  useLocalTslint: false
};

// Worker still hasn't initialized, since the queued idle callbacks are
// done in order, waiting on a newly queued idle callback will ensure that
// the worker has been initialized
var waitOnIdle = _asyncToGenerator(function* () {
  return new Promise(function (resolve) {
    var callbackID = window.requestIdleCallback(function () {
      idleCallbacks['delete'](callbackID);
      resolve();
    });
    idleCallbacks.add(callbackID);
  });
});

exports['default'] = {
  activate: function activate() {
    var _this = this;

    var depsCallbackID = undefined;
    var lintertslintDeps = function lintertslintDeps() {
      idleCallbacks['delete'](depsCallbackID);
      // Install package dependencies
      require('atom-package-deps').install('linter-tslint');
    };
    depsCallbackID = window.requestIdleCallback(lintertslintDeps);
    idleCallbacks.add(depsCallbackID);

    this.subscriptions = new _atom.CompositeDisposable();

    // Config subscriptions
    this.subscriptions.add(atom.config.observe('linter-tslint.rulesDirectory', function (dir) {
      if (dir && _path2['default'].isAbsolute(dir)) {
        _fs2['default'].stat(dir, function (err, stats) {
          if (stats && stats.isDirectory()) {
            config.rulesDirectory = dir;
            workerHelper.changeConfig('rulesDirectory', dir);
          }
        });
      }
    }), atom.config.observe('linter-tslint.useLocalTslint', function (use) {
      config.useLocalTslint = use;
      workerHelper.changeConfig('useLocalTslint', use);
    }), atom.config.observe('linter-tslint.enableSemanticRules', function (enableSemanticRules) {
      config.enableSemanticRules = enableSemanticRules;
      workerHelper.changeConfig('enableSemanticRules', enableSemanticRules);
    }), atom.config.observe('linter-tslint.ignoreTypings', function (ignoreTypings) {
      _this.ignoreTypings = ignoreTypings;
    }));

    // Marks each TypeScript editor with a CSS class so that
    // we can enable commands only for TypeScript editors.
    this.subscriptions.add(atom.workspace.observeTextEditors(function (textEditor) {
      if (textEditor.getRootScopeDescriptor().getScopesArray().some(function (scope) {
        return grammarScopes.includes(scope);
      })) {
        atom.views.getView(textEditor).classList.add(editorClass);
        textEditor.onDidSave(_asyncToGenerator(function* () {
          if (atom.config.get('linter-tslint.fixOnSave')) {
            yield workerHelper.requestJob('fix', textEditor);
          }
        }));
      }
    }));

    // Command subscriptions
    this.subscriptions.add(atom.commands.add('atom-text-editor.' + editorClass, {
      'linter-tslint:fix-file': _asyncToGenerator(function* () {
        var textEditor = atom.workspace.getActiveTextEditor();

        if (!textEditor || textEditor.isModified()) {
          // Abort for invalid or unsaved text editors
          atom.notifications.addError('Linter-TSLint: Please save before fixing');
          return;
        }

        // The fix replaces the file content and the cursor can jump automatically
        // to the beginning of the file, so save current cursor position
        var cursorPosition = textEditor.getCursorBufferPosition();

        try {
          var results = yield workerHelper.requestJob('fix', textEditor);

          var notificationText = results && results.length === 0 ? 'Linter-TSLint: Fix complete.' : 'Linter-TSLint: Fix attempt complete, but linting errors remain.';

          atom.notifications.addSuccess(notificationText);
        } catch (err) {
          atom.notifications.addWarning(err.message);
        } finally {
          // Restore cursor to the position before fix job
          textEditor.setCursorBufferPosition(cursorPosition);
        }
      })
    }));

    var createWorkerCallback = window.requestIdleCallback(function () {
      _this.worker = new _atom.Task(require.resolve('./worker.js'));
      idleCallbacks['delete'](createWorkerCallback);
    });
    idleCallbacks.add(createWorkerCallback);
  },

  deactivate: function deactivate() {
    idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    idleCallbacks.clear();
    this.subscriptions.dispose();

    workerHelper.terminateWorker();
    this.worker = null;
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'TSLint',
      grammarScopes: grammarScopes,
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        if (_this2.ignoreTypings && textEditor.getPath().toLowerCase().endsWith('.d.ts')) {
          return [];
        }

        if (!_this2.worker) {
          yield waitOnIdle();
        }

        workerHelper.startWorker(_this2.worker, config);

        var text = textEditor.getText();
        var results = yield workerHelper.requestJob('lint', textEditor);

        if (textEditor.getText() !== text) {
          // Text has been modified since the lint was triggered, tell linter not to update
          return null;
        }

        return results;
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvZWY4bGovLmF0b20vcGFja2FnZXMvbGludGVyLXRzbGludC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBRzBDLE1BQU07O29CQUMvQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7NEJBQ1csZ0JBQWdCOztJQUFsQyxZQUFZOztBQU54QixXQUFXLENBQUM7O0FBUVosSUFBTSxhQUFhLEdBQUcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDbEQsSUFBTSxXQUFXLEdBQUcsaUNBQWlDLENBQUM7QUFDdEQsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQyxJQUFNLE1BQU0sR0FBRztBQUNiLGdCQUFjLEVBQUUsSUFBSTtBQUNwQixnQkFBYyxFQUFFLEtBQUs7Q0FDdEIsQ0FBQzs7Ozs7QUFLRixJQUFNLFVBQVUscUJBQUc7U0FDakIsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDdkIsUUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFlBQU07QUFDbEQsbUJBQWEsVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLGFBQU8sRUFBRSxDQUFDO0tBQ1gsQ0FBQyxDQUFDO0FBQ0gsaUJBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDL0IsQ0FBQztDQUFBLENBQUEsQ0FBQzs7cUJBRVU7QUFDYixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksY0FBYyxZQUFBLENBQUM7QUFDbkIsUUFBTSxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsR0FBUztBQUM3QixtQkFBYSxVQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXJDLGFBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUN2RCxDQUFDO0FBQ0Ysa0JBQWMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM5RCxpQkFBYSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFbEMsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQzs7O0FBRy9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFDLEdBQUcsRUFBSztBQUMzRCxVQUFJLEdBQUcsSUFBSSxrQkFBSyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDL0Isd0JBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUs7QUFDM0IsY0FBSSxLQUFLLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQ2hDLGtCQUFNLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUM1Qix3QkFBWSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQztXQUNsRDtTQUNGLENBQUMsQ0FBQztPQUNKO0tBQ0YsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQUMsR0FBRyxFQUFLO0FBQzNELFlBQU0sQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBQzVCLGtCQUFZLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ2xELENBQUMsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRSxVQUFDLG1CQUFtQixFQUFLO0FBQ2hGLFlBQU0sQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztBQUNqRCxrQkFBWSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0tBQ3ZFLENBQUMsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxVQUFDLGFBQWEsRUFBSztBQUNwRSxZQUFLLGFBQWEsR0FBRyxhQUFhLENBQUM7S0FDcEMsQ0FBQyxDQUNILENBQUM7Ozs7QUFJRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLFVBQVUsRUFBSztBQUNoRCxVQUFJLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUN2RCxJQUFJLENBQUMsVUFBQSxLQUFLO2VBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7T0FBQSxDQUFDLEVBQUU7QUFDN0MsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxRCxrQkFBVSxDQUFDLFNBQVMsbUJBQUMsYUFBWTtBQUMvQixjQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7QUFDOUMsa0JBQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7V0FDbEQ7U0FDRixFQUFDLENBQUM7T0FDSjtLQUNGLENBQUMsQ0FDSCxDQUFDOzs7QUFHRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLHVCQUFxQixXQUFXLEVBQUk7QUFDbkQsOEJBQXdCLG9CQUFFLGFBQVk7QUFDcEMsWUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOztBQUV4RCxZQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRTs7QUFFMUMsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUN4RSxpQkFBTztTQUNSOzs7O0FBSUQsWUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLHVCQUF1QixFQUFFLENBQUM7O0FBRTVELFlBQUk7QUFDRixjQUFNLE9BQU8sR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUVqRSxjQUFNLGdCQUFnQixHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsR0FDdEQsOEJBQThCLEdBQzlCLGlFQUFpRSxDQUFDOztBQUVwRSxjQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ2pELENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixjQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUMsU0FBUzs7QUFFUixvQkFBVSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3BEO09BQ0YsQ0FBQTtLQUNGLENBQUMsQ0FDSCxDQUFDOztBQUVGLFFBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFlBQU07QUFDNUQsWUFBSyxNQUFNLEdBQUcsZUFBUyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDdkQsbUJBQWEsVUFBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7S0FDNUMsQ0FBQyxDQUFDO0FBQ0gsaUJBQWEsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztHQUN6Qzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxpQkFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7YUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQzNFLGlCQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFN0IsZ0JBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUMvQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztHQUNwQjs7QUFFRCxlQUFhLEVBQUEseUJBQUc7OztBQUNkLFdBQU87QUFDTCxVQUFJLEVBQUUsUUFBUTtBQUNkLG1CQUFhLEVBQWIsYUFBYTtBQUNiLFdBQUssRUFBRSxNQUFNO0FBQ2IsZUFBUyxFQUFFLElBQUk7QUFDZixVQUFJLG9CQUFFLFdBQU8sVUFBVSxFQUFLO0FBQzFCLFlBQUksT0FBSyxhQUFhLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUM5RSxpQkFBTyxFQUFFLENBQUM7U0FDWDs7QUFFRCxZQUFJLENBQUMsT0FBSyxNQUFNLEVBQUU7QUFDaEIsZ0JBQU0sVUFBVSxFQUFFLENBQUM7U0FDcEI7O0FBRUQsb0JBQVksQ0FBQyxXQUFXLENBQUMsT0FBSyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTlDLFlBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxZQUFNLE9BQU8sR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUVsRSxZQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7O0FBRWpDLGlCQUFPLElBQUksQ0FBQztTQUNiOztBQUVELGVBQU8sT0FBTyxDQUFDO09BQ2hCLENBQUE7S0FDRixDQUFDO0dBQ0g7Q0FDRiIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL2VmOGxqLy5hdG9tL3BhY2thZ2VzL2xpbnRlci10c2xpbnQvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9leHRlbnNpb25zLCBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIFRhc2sgfSBmcm9tICdhdG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHdvcmtlckhlbHBlciBmcm9tICcuL3dvcmtlckhlbHBlcic7XG5cbmNvbnN0IGdyYW1tYXJTY29wZXMgPSBbJ3NvdXJjZS50cycsICdzb3VyY2UudHN4J107XG5jb25zdCBlZGl0b3JDbGFzcyA9ICdsaW50ZXItdHNsaW50LWNvbXBhdGlibGUtZWRpdG9yJztcbmNvbnN0IGlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5jb25zdCBjb25maWcgPSB7XG4gIHJ1bGVzRGlyZWN0b3J5OiBudWxsLFxuICB1c2VMb2NhbFRzbGludDogZmFsc2UsXG59O1xuXG4vLyBXb3JrZXIgc3RpbGwgaGFzbid0IGluaXRpYWxpemVkLCBzaW5jZSB0aGUgcXVldWVkIGlkbGUgY2FsbGJhY2tzIGFyZVxuLy8gZG9uZSBpbiBvcmRlciwgd2FpdGluZyBvbiBhIG5ld2x5IHF1ZXVlZCBpZGxlIGNhbGxiYWNrIHdpbGwgZW5zdXJlIHRoYXRcbi8vIHRoZSB3b3JrZXIgaGFzIGJlZW4gaW5pdGlhbGl6ZWRcbmNvbnN0IHdhaXRPbklkbGUgPSBhc3luYyAoKSA9PlxuICBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IGNhbGxiYWNrSUQgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjaygoKSA9PiB7XG4gICAgICBpZGxlQ2FsbGJhY2tzLmRlbGV0ZShjYWxsYmFja0lEKTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICBpZGxlQ2FsbGJhY2tzLmFkZChjYWxsYmFja0lEKTtcbiAgfSk7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgbGV0IGRlcHNDYWxsYmFja0lEO1xuICAgIGNvbnN0IGxpbnRlcnRzbGludERlcHMgPSAoKSA9PiB7XG4gICAgICBpZGxlQ2FsbGJhY2tzLmRlbGV0ZShkZXBzQ2FsbGJhY2tJRCk7XG4gICAgICAvLyBJbnN0YWxsIHBhY2thZ2UgZGVwZW5kZW5jaWVzXG4gICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci10c2xpbnQnKTtcbiAgICB9O1xuICAgIGRlcHNDYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2sobGludGVydHNsaW50RGVwcyk7XG4gICAgaWRsZUNhbGxiYWNrcy5hZGQoZGVwc0NhbGxiYWNrSUQpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIENvbmZpZyBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci10c2xpbnQucnVsZXNEaXJlY3RvcnknLCAoZGlyKSA9PiB7XG4gICAgICAgIGlmIChkaXIgJiYgcGF0aC5pc0Fic29sdXRlKGRpcikpIHtcbiAgICAgICAgICBmcy5zdGF0KGRpciwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0cyAmJiBzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgIGNvbmZpZy5ydWxlc0RpcmVjdG9yeSA9IGRpcjtcbiAgICAgICAgICAgICAgd29ya2VySGVscGVyLmNoYW5nZUNvbmZpZygncnVsZXNEaXJlY3RvcnknLCBkaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci10c2xpbnQudXNlTG9jYWxUc2xpbnQnLCAodXNlKSA9PiB7XG4gICAgICAgIGNvbmZpZy51c2VMb2NhbFRzbGludCA9IHVzZTtcbiAgICAgICAgd29ya2VySGVscGVyLmNoYW5nZUNvbmZpZygndXNlTG9jYWxUc2xpbnQnLCB1c2UpO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdHNsaW50LmVuYWJsZVNlbWFudGljUnVsZXMnLCAoZW5hYmxlU2VtYW50aWNSdWxlcykgPT4ge1xuICAgICAgICBjb25maWcuZW5hYmxlU2VtYW50aWNSdWxlcyA9IGVuYWJsZVNlbWFudGljUnVsZXM7XG4gICAgICAgIHdvcmtlckhlbHBlci5jaGFuZ2VDb25maWcoJ2VuYWJsZVNlbWFudGljUnVsZXMnLCBlbmFibGVTZW1hbnRpY1J1bGVzKTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXRzbGludC5pZ25vcmVUeXBpbmdzJywgKGlnbm9yZVR5cGluZ3MpID0+IHtcbiAgICAgICAgdGhpcy5pZ25vcmVUeXBpbmdzID0gaWdub3JlVHlwaW5ncztcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICAvLyBNYXJrcyBlYWNoIFR5cGVTY3JpcHQgZWRpdG9yIHdpdGggYSBDU1MgY2xhc3Mgc28gdGhhdFxuICAgIC8vIHdlIGNhbiBlbmFibGUgY29tbWFuZHMgb25seSBmb3IgVHlwZVNjcmlwdCBlZGl0b3JzLlxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKHRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgaWYgKHRleHRFZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgICAgICAgLnNvbWUoc2NvcGUgPT4gZ3JhbW1hclNjb3Blcy5pbmNsdWRlcyhzY29wZSkpKSB7XG4gICAgICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpLmNsYXNzTGlzdC5hZGQoZWRpdG9yQ2xhc3MpO1xuICAgICAgICAgIHRleHRFZGl0b3Iub25EaWRTYXZlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci10c2xpbnQuZml4T25TYXZlJykpIHtcbiAgICAgICAgICAgICAgYXdhaXQgd29ya2VySGVscGVyLnJlcXVlc3RKb2IoJ2ZpeCcsIHRleHRFZGl0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgLy8gQ29tbWFuZCBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKGBhdG9tLXRleHQtZWRpdG9yLiR7ZWRpdG9yQ2xhc3N9YCwge1xuICAgICAgICAnbGludGVyLXRzbGludDpmaXgtZmlsZSc6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgICAgICAgaWYgKCF0ZXh0RWRpdG9yIHx8IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpKSB7XG4gICAgICAgICAgICAvLyBBYm9ydCBmb3IgaW52YWxpZCBvciB1bnNhdmVkIHRleHQgZWRpdG9yc1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdMaW50ZXItVFNMaW50OiBQbGVhc2Ugc2F2ZSBiZWZvcmUgZml4aW5nJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVGhlIGZpeCByZXBsYWNlcyB0aGUgZmlsZSBjb250ZW50IGFuZCB0aGUgY3Vyc29yIGNhbiBqdW1wIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICAvLyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlLCBzbyBzYXZlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uXG4gICAgICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSB0ZXh0RWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHdvcmtlckhlbHBlci5yZXF1ZXN0Sm9iKCdmaXgnLCB0ZXh0RWRpdG9yKTtcblxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uVGV4dCA9IHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPT09IDAgP1xuICAgICAgICAgICAgICAnTGludGVyLVRTTGludDogRml4IGNvbXBsZXRlLicgOlxuICAgICAgICAgICAgICAnTGludGVyLVRTTGludDogRml4IGF0dGVtcHQgY29tcGxldGUsIGJ1dCBsaW50aW5nIGVycm9ycyByZW1haW4uJztcblxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3Mobm90aWZpY2F0aW9uVGV4dCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhlcnIubWVzc2FnZSk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIC8vIFJlc3RvcmUgY3Vyc29yIHRvIHRoZSBwb3NpdGlvbiBiZWZvcmUgZml4IGpvYlxuICAgICAgICAgICAgdGV4dEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKTtcblxuICAgIGNvbnN0IGNyZWF0ZVdvcmtlckNhbGxiYWNrID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgdGhpcy53b3JrZXIgPSBuZXcgVGFzayhyZXF1aXJlLnJlc29sdmUoJy4vd29ya2VyLmpzJykpO1xuICAgICAgaWRsZUNhbGxiYWNrcy5kZWxldGUoY3JlYXRlV29ya2VyQ2FsbGJhY2spO1xuICAgIH0pO1xuICAgIGlkbGVDYWxsYmFja3MuYWRkKGNyZWF0ZVdvcmtlckNhbGxiYWNrKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpO1xuICAgIGlkbGVDYWxsYmFja3MuY2xlYXIoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuXG4gICAgd29ya2VySGVscGVyLnRlcm1pbmF0ZVdvcmtlcigpO1xuICAgIHRoaXMud29ya2VyID0gbnVsbDtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnVFNMaW50JyxcbiAgICAgIGdyYW1tYXJTY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogYXN5bmMgKHRleHRFZGl0b3IpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaWdub3JlVHlwaW5ncyAmJiB0ZXh0RWRpdG9yLmdldFBhdGgoKS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgICAgIGF3YWl0IHdhaXRPbklkbGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmtlckhlbHBlci5zdGFydFdvcmtlcih0aGlzLndvcmtlciwgY29uZmlnKTtcblxuICAgICAgICBjb25zdCB0ZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB3b3JrZXJIZWxwZXIucmVxdWVzdEpvYignbGludCcsIHRleHRFZGl0b3IpO1xuXG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmdldFRleHQoKSAhPT0gdGV4dCkge1xuICAgICAgICAgIC8vIFRleHQgaGFzIGJlZW4gbW9kaWZpZWQgc2luY2UgdGhlIGxpbnQgd2FzIHRyaWdnZXJlZCwgdGVsbCBsaW50ZXIgbm90IHRvIHVwZGF0ZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19