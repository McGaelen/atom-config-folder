var _atom = require('atom');

var _fs = require('fs');

var _path = require('path');

var _api = require('./api');

'use babel';

module.exports = {
  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    this.api = null;

    var paths = atom.project.getPaths();
    if (paths.length) {
      (function () {
        var rootDirectory = paths[0];
        (0, _fs.readdir)(rootDirectory, function (error, files) {
          if (error) {
            atom.notifications.addError('[autocomplete-swift] Error scanning project root for files, see log for more info');
            console.log('autocomplete-swift scan error', error);
            return;
          }
          var filesLength = files.length;
          for (var i = 0; i < filesLength; ++i) {
            var file = files[i];
            if (file.endsWith('.xcodeproj')) {
              var filePath = (0, _path.join)(rootDirectory, file);
              _this.api = new _api.API(filePath);
              _this.subscriptions.add(_this.api);
            }
          }
        });
      })();
    }
  },
  provideAC: function provideAC() {
    var _this2 = this;

    return {
      selector: '.source.swift',
      disableForSelector: '.comment',
      getSuggestions: function getSuggestions(_ref) {
        var editor = _ref.editor;
        var bufferPosition = _ref.bufferPosition;
        var prefix = _ref.prefix;

        var replacementPrefix = prefix.substr(0, 1) === '.' ? prefix.substr(1) : prefix;
        if (_this2.api === null) {
          return [];
        }
        var characterIndex = editor.getBuffer().characterIndexForPosition(bufferPosition);
        var fileContents = editor.getText();
        var filePath = editor.getPath();
        return _this2.api.autocomplete(filePath, fileContents, characterIndex).then(function (results) {
          return results.map(function (result) {
            return {
              text: result.name,
              replacementPrefix: replacementPrefix,
              displayText: result.descriptionKey,
              type: result.typeName,
              leftLabel: result.typeName
            };
          });
        });
      }
    };
  },
  deactivate: function deactivate() {
    this.subscriptions.dispose();
    this.api = null;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYWVsZW4vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXN3aWZ0L2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoib0JBRThDLE1BQU07O2tCQUM5QixJQUFJOztvQkFDSyxNQUFNOzttQkFDbkIsT0FBTzs7QUFMekIsV0FBVyxDQUFBOztBQU9YLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUUsb0JBQVc7OztBQUNuQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFBOztBQUVmLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDckMsUUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFOztBQUNoQixZQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDOUIseUJBQVEsYUFBYSxFQUFFLFVBQUMsS0FBSyxFQUFFLEtBQUssRUFBSztBQUN2QyxjQUFJLEtBQUssRUFBRTtBQUNULGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxtRkFBbUYsQ0FBQyxDQUFBO0FBQ2hILG1CQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ25ELG1CQUFNO1dBQ1A7QUFDRCxjQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFBO0FBQ2hDLGVBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUU7QUFDcEMsZ0JBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNyQixnQkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQy9CLGtCQUFNLFFBQVEsR0FBRyxnQkFBUyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDOUMsb0JBQUssR0FBRyxHQUFHLGFBQVEsUUFBUSxDQUFDLENBQUE7QUFDNUIsb0JBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFLLEdBQUcsQ0FBQyxDQUFBO2FBQ2pDO1dBQ0Y7U0FDRixDQUFDLENBQUE7O0tBQ0g7R0FDRjtBQUNELFdBQVMsRUFBRSxxQkFBVzs7O0FBQ3BCLFdBQU87QUFDTCxjQUFRLEVBQUUsZUFBZTtBQUN6Qix3QkFBa0IsRUFBRSxVQUFVO0FBQzlCLG9CQUFjLEVBQUUsd0JBQUMsSUFBZ0MsRUFBSztZQUFwQyxNQUFNLEdBQVAsSUFBZ0MsQ0FBL0IsTUFBTTtZQUFFLGNBQWMsR0FBdkIsSUFBZ0MsQ0FBdkIsY0FBYztZQUFFLE1BQU0sR0FBL0IsSUFBZ0MsQ0FBUCxNQUFNOztBQUM5QyxZQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtBQUNqRixZQUFJLE9BQUssR0FBRyxLQUFLLElBQUksRUFBRTtBQUNyQixpQkFBTyxFQUFFLENBQUE7U0FDVjtBQUNELFlBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUNuRixZQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDckMsWUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2pDLGVBQU8sT0FBSyxHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsT0FBTyxFQUFFO0FBQzFGLGlCQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBUyxNQUFNLEVBQUU7QUFDbEMsbUJBQU87QUFDTCxrQkFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0FBQ2pCLCtCQUFpQixFQUFFLGlCQUFpQjtBQUNwQyx5QkFBVyxFQUFFLE1BQU0sQ0FBQyxjQUFjO0FBQ2xDLGtCQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVE7QUFDckIsdUJBQVMsRUFBRSxNQUFNLENBQUMsUUFBUTthQUMzQixDQUFBO1dBQ0YsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBO09BRUg7S0FDRixDQUFBO0dBQ0Y7QUFDRCxZQUFVLEVBQUUsc0JBQVc7QUFDckIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixRQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQTtHQUNoQjtDQUNGLENBQUEiLCJmaWxlIjoiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtc3dpZnQvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHtyZWFkZGlyfSBmcm9tICdmcydcbmltcG9ydCB7am9pbiBhcyBqb2luUGF0aH0gZnJvbSAncGF0aCdcbmltcG9ydCB7QVBJfSBmcm9tICcuL2FwaSdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5hcGkgPSBudWxsXG5cbiAgICBjb25zdCBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgaWYgKHBhdGhzLmxlbmd0aCkge1xuICAgICAgY29uc3Qgcm9vdERpcmVjdG9yeSA9IHBhdGhzWzBdXG4gICAgICByZWFkZGlyKHJvb3REaXJlY3RvcnksIChlcnJvciwgZmlsZXMpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdbYXV0b2NvbXBsZXRlLXN3aWZ0XSBFcnJvciBzY2FubmluZyBwcm9qZWN0IHJvb3QgZm9yIGZpbGVzLCBzZWUgbG9nIGZvciBtb3JlIGluZm8nKVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdhdXRvY29tcGxldGUtc3dpZnQgc2NhbiBlcnJvcicsIGVycm9yKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGVzTGVuZ3RoID0gZmlsZXMubGVuZ3RoXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZXNMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1tpXVxuICAgICAgICAgIGlmIChmaWxlLmVuZHNXaXRoKCcueGNvZGVwcm9qJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gam9pblBhdGgocm9vdERpcmVjdG9yeSwgZmlsZSlcbiAgICAgICAgICAgIHRoaXMuYXBpID0gbmV3IEFQSShmaWxlUGF0aClcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5hcGkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSxcbiAgcHJvdmlkZUFDOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0b3I6ICcuc291cmNlLnN3aWZ0JyxcbiAgICAgIGRpc2FibGVGb3JTZWxlY3RvcjogJy5jb21tZW50JyxcbiAgICAgIGdldFN1Z2dlc3Rpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHByZWZpeH0pID0+IHtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXguc3Vic3RyKDAsIDEpID09PSAnLicgPyBwcmVmaXguc3Vic3RyKDEpIDogcHJlZml4XG4gICAgICAgIGlmICh0aGlzLmFwaSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlckluZGV4ID0gZWRpdG9yLmdldEJ1ZmZlcigpLmNoYXJhY3RlckluZGV4Rm9yUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIHJldHVybiB0aGlzLmFwaS5hdXRvY29tcGxldGUoZmlsZVBhdGgsIGZpbGVDb250ZW50cywgY2hhcmFjdGVySW5kZXgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIHJldHVybiByZXN1bHRzLm1hcChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHRleHQ6IHJlc3VsdC5uYW1lLFxuICAgICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICAgICAgICAgIGRpc3BsYXlUZXh0OiByZXN1bHQuZGVzY3JpcHRpb25LZXksXG4gICAgICAgICAgICAgIHR5cGU6IHJlc3VsdC50eXBlTmFtZSxcbiAgICAgICAgICAgICAgbGVmdExhYmVsOiByZXN1bHQudHlwZU5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5hcGkgPSBudWxsXG4gIH1cbn1cbiJdfQ==