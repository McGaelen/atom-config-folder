(function() {
  var IS_WIN32, RsenseClient, RsenseProvider;

  RsenseClient = require('./autocomplete-ruby-client.coffee');

  IS_WIN32 = process.platform === 'win32';

  String.prototype.regExpEscape = function() {
    return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  };

  module.exports = RsenseProvider = (function() {
    RsenseProvider.prototype.selector = '.source.ruby';

    RsenseProvider.prototype.disableForSelector = '.source.ruby .comment';

    RsenseProvider.suggestionPriority = atom.config.get('autocomplete-ruby.suggestionPriority');

    RsenseProvider.prototype.inclusionPriority = 1;

    RsenseProvider.prototype.suggestionPriority = RsenseProvider.suggestionPriority === true ? 2 : void 0;

    RsenseProvider.prototype.rsenseClient = null;

    function RsenseProvider() {
      this.rsenseClient = new RsenseClient();
      if (!IS_WIN32) {
        this.rsenseClient.startRsenseUnix();
      }
      this.lastSuggestions = [];
    }

    RsenseProvider.prototype.getSuggestions = function(arg) {
      var bufferPosition, editor, prefix, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      if (IS_WIN32) {
        this.rsenseClient.startRsenseWin32();
      }
      return new Promise((function(_this) {
        return function(resolve) {
          var col, completions, row;
          row = bufferPosition.row + 1;
          col = bufferPosition.column + 1;
          return completions = _this.rsenseClient.checkCompletion(editor, editor.buffer, row, col, function(completions) {
            var suggestions;
            suggestions = _this.findSuggestions(prefix, completions);
            if ((suggestions != null ? suggestions.length : void 0)) {
              _this.lastSuggestions = suggestions;
            }
            if (prefix === '.' || prefix === '::') {
              resolve(_this.lastSuggestions);
            }
            return resolve(_this.filterSuggestions(prefix, _this.lastSuggestions));
          });
        };
      })(this));
    };

    RsenseProvider.prototype.findSuggestions = function(prefix, completions) {
      var completion, i, kind, len, suggestion, suggestions;
      if (completions != null) {
        suggestions = [];
        for (i = 0, len = completions.length; i < len; i++) {
          completion = completions[i];
          kind = completion.kind.toLowerCase();
          if (kind === "module") {
            kind = "import";
          }
          suggestion = {
            text: completion.name,
            type: kind,
            leftLabel: completion.base_name
          };
          suggestions.push(suggestion);
        }
        suggestions.sort(function(x, y) {
          if (x.text > y.text) {
            return 1;
          } else if (x.text < y.text) {
            return -1;
          } else {
            return 0;
          }
        });
        return suggestions;
      }
      return [];
    };

    RsenseProvider.prototype.filterSuggestions = function(prefix, suggestions) {
      var expression, i, len, suggestion, suggestionBuffer;
      suggestionBuffer = [];
      if (!(prefix != null ? prefix.length : void 0) || !(suggestions != null ? suggestions.length : void 0)) {
        return [];
      }
      expression = new RegExp("^" + prefix.regExpEscape(), "i");
      for (i = 0, len = suggestions.length; i < len; i++) {
        suggestion = suggestions[i];
        if (expression.test(suggestion.text)) {
          suggestion.replacementPrefix = prefix;
          suggestionBuffer.push(suggestion);
        }
      }
      return suggestionBuffer;
    };

    RsenseProvider.prototype.dispose = function() {
      if (IS_WIN32) {
        return this.rsenseClient.stopRsense();
      }
      return this.rsenseClient.stopRsenseUnix();
    };

    return RsenseProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcnVieS9saWIvYXV0b2NvbXBsZXRlLXJ1YnktcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLG1DQUFSOztFQUNmLFFBQUEsR0FBVyxPQUFPLENBQUMsUUFBUixLQUFvQjs7RUFFL0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFqQixHQUFnQyxTQUFBO0FBQzlCLFdBQU8sSUFBQyxDQUFBLE9BQUQsQ0FBUyxxQ0FBVCxFQUFnRCxNQUFoRDtFQUR1Qjs7RUFHaEMsTUFBTSxDQUFDLE9BQVAsR0FDTTs2QkFDSixRQUFBLEdBQVU7OzZCQUNWLGtCQUFBLEdBQW9COztJQUNwQixjQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQjs7NkJBRXRCLGlCQUFBLEdBQW1COzs2QkFDbkIsa0JBQUEsR0FBeUIsY0FBQyxDQUFBLGtCQUFELEtBQXVCLElBQTVCLEdBQUEsQ0FBQSxHQUFBOzs2QkFFcEIsWUFBQSxHQUFjOztJQUVELHdCQUFBO01BQ1gsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxZQUFBLENBQUE7TUFDcEIsSUFBbUMsQ0FBQyxRQUFwQztRQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsZUFBZCxDQUFBLEVBQUE7O01BQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFIUjs7NkJBS2IsY0FBQSxHQUFnQixTQUFDLEdBQUQ7QUFDZCxVQUFBO01BRGdCLHFCQUFRLHFDQUFnQix1Q0FBaUI7TUFDekQsSUFBb0MsUUFBcEM7UUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLGdCQUFkLENBQUEsRUFBQTs7YUFDSSxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtBQUVWLGNBQUE7VUFBQSxHQUFBLEdBQU0sY0FBYyxDQUFDLEdBQWYsR0FBcUI7VUFDM0IsR0FBQSxHQUFNLGNBQWMsQ0FBQyxNQUFmLEdBQXdCO2lCQUM5QixXQUFBLEdBQWMsS0FBQyxDQUFBLFlBQVksQ0FBQyxlQUFkLENBQThCLE1BQTlCLEVBQ2QsTUFBTSxDQUFDLE1BRE8sRUFDQyxHQURELEVBQ00sR0FETixFQUNXLFNBQUMsV0FBRDtBQUN2QixnQkFBQTtZQUFBLFdBQUEsR0FBYyxLQUFDLENBQUEsZUFBRCxDQUFpQixNQUFqQixFQUF5QixXQUF6QjtZQUNkLElBQUUsdUJBQUMsV0FBVyxDQUFFLGVBQWQsQ0FBRjtjQUNFLEtBQUMsQ0FBQSxlQUFELEdBQW1CLFlBRHJCOztZQUlBLElBQTZCLE1BQUEsS0FBVSxHQUFWLElBQWlCLE1BQUEsS0FBVSxJQUF4RDtjQUFBLE9BQUEsQ0FBUSxLQUFDLENBQUEsZUFBVCxFQUFBOzttQkFFQSxPQUFBLENBQVEsS0FBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CLEVBQTJCLEtBQUMsQ0FBQSxlQUE1QixDQUFSO1VBUnVCLENBRFg7UUFKSjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQUZVOzs2QkFrQmhCLGVBQUEsR0FBaUIsU0FBQyxNQUFELEVBQVMsV0FBVDtBQUNmLFVBQUE7TUFBQSxJQUFHLG1CQUFIO1FBQ0UsV0FBQSxHQUFjO0FBQ2QsYUFBQSw2Q0FBQTs7VUFDRSxJQUFBLEdBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFoQixDQUFBO1VBQ1AsSUFBbUIsSUFBQSxLQUFRLFFBQTNCO1lBQUEsSUFBQSxHQUFPLFNBQVA7O1VBQ0EsVUFBQSxHQUNFO1lBQUEsSUFBQSxFQUFNLFVBQVUsQ0FBQyxJQUFqQjtZQUNBLElBQUEsRUFBTSxJQUROO1lBRUEsU0FBQSxFQUFXLFVBQVUsQ0FBQyxTQUZ0Qjs7VUFHRixXQUFXLENBQUMsSUFBWixDQUFpQixVQUFqQjtBQVBGO1FBUUEsV0FBVyxDQUFDLElBQVosQ0FBaUIsU0FBQyxDQUFELEVBQUksQ0FBSjtVQUNmLElBQUcsQ0FBQyxDQUFDLElBQUYsR0FBTyxDQUFDLENBQUMsSUFBWjttQkFDRSxFQURGO1dBQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxJQUFGLEdBQU8sQ0FBQyxDQUFDLElBQVo7bUJBQ0gsQ0FBQyxFQURFO1dBQUEsTUFBQTttQkFHSCxFQUhHOztRQUhVLENBQWpCO0FBUUEsZUFBTyxZQWxCVDs7QUFtQkEsYUFBTztJQXBCUTs7NkJBdUJqQixpQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxXQUFUO0FBQ2pCLFVBQUE7TUFBQSxnQkFBQSxHQUFtQjtNQUVuQixJQUFHLG1CQUFDLE1BQU0sQ0FBRSxnQkFBVCxJQUFtQix3QkFBQyxXQUFXLENBQUUsZ0JBQXBDO0FBQ0UsZUFBTyxHQURUOztNQUdBLFVBQUEsR0FBaUIsSUFBQSxNQUFBLENBQU8sR0FBQSxHQUFJLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBWCxFQUFrQyxHQUFsQztBQUVqQixXQUFBLDZDQUFBOztRQUNFLElBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsVUFBVSxDQUFDLElBQTNCLENBQUg7VUFDRSxVQUFVLENBQUMsaUJBQVgsR0FBK0I7VUFDL0IsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsVUFBdEIsRUFGRjs7QUFERjtBQUtBLGFBQU87SUFiVTs7NkJBZW5CLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBcUMsUUFBckM7QUFBQSxlQUFPLElBQUMsQ0FBQSxZQUFZLENBQUMsVUFBZCxDQUFBLEVBQVA7O2FBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxjQUFkLENBQUE7SUFGTzs7Ozs7QUE5RVgiLCJzb3VyY2VzQ29udGVudCI6WyJSc2Vuc2VDbGllbnQgPSByZXF1aXJlICcuL2F1dG9jb21wbGV0ZS1ydWJ5LWNsaWVudC5jb2ZmZWUnXG5JU19XSU4zMiA9IHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJ1xuXG5TdHJpbmcucHJvdG90eXBlLnJlZ0V4cEVzY2FwZSA9ICgpIC0+XG4gIHJldHVybiBAcmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJzZW5zZVByb3ZpZGVyXG4gIHNlbGVjdG9yOiAnLnNvdXJjZS5ydWJ5J1xuICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnJ1YnkgLmNvbW1lbnQnXG4gIEBzdWdnZXN0aW9uUHJpb3JpdHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1ydWJ5LnN1Z2dlc3Rpb25Qcmlvcml0eScpXG5cbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDFcbiAgc3VnZ2VzdGlvblByaW9yaXR5OiAyIGlmIEBzdWdnZXN0aW9uUHJpb3JpdHkgPT0gdHJ1ZVxuXG4gIHJzZW5zZUNsaWVudDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEByc2Vuc2VDbGllbnQgPSBuZXcgUnNlbnNlQ2xpZW50KClcbiAgICBAcnNlbnNlQ2xpZW50LnN0YXJ0UnNlbnNlVW5peCgpIGlmICFJU19XSU4zMlxuICAgIEBsYXN0U3VnZ2VzdGlvbnMgPSBbXVxuXG4gIGdldFN1Z2dlc3Rpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHNjb3BlRGVzY3JpcHRvciwgcHJlZml4fSkgLT5cbiAgICBAcnNlbnNlQ2xpZW50LnN0YXJ0UnNlbnNlV2luMzIoKSBpZiBJU19XSU4zMlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgIyByc2Vuc2UgZXhwZWN0cyAxLWJhc2VkIHBvc2l0aW9uc1xuICAgICAgcm93ID0gYnVmZmVyUG9zaXRpb24ucm93ICsgMVxuICAgICAgY29sID0gYnVmZmVyUG9zaXRpb24uY29sdW1uICsgMVxuICAgICAgY29tcGxldGlvbnMgPSBAcnNlbnNlQ2xpZW50LmNoZWNrQ29tcGxldGlvbihlZGl0b3IsXG4gICAgICBlZGl0b3IuYnVmZmVyLCByb3csIGNvbCwgKGNvbXBsZXRpb25zKSA9PlxuICAgICAgICBzdWdnZXN0aW9ucyA9IEBmaW5kU3VnZ2VzdGlvbnMocHJlZml4LCBjb21wbGV0aW9ucylcbiAgICAgICAgaWYoc3VnZ2VzdGlvbnM/Lmxlbmd0aClcbiAgICAgICAgICBAbGFzdFN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNcblxuICAgICAgICAjIHJlcXVlc3QgY29tcGxldGlvbiBvbiBgLmAgYW5kIGA6OmBcbiAgICAgICAgcmVzb2x2ZShAbGFzdFN1Z2dlc3Rpb25zKSBpZiBwcmVmaXggPT0gJy4nIHx8IHByZWZpeCA9PSAnOjonXG5cbiAgICAgICAgcmVzb2x2ZShAZmlsdGVyU3VnZ2VzdGlvbnMocHJlZml4LCBAbGFzdFN1Z2dlc3Rpb25zKSlcbiAgICAgIClcblxuICBmaW5kU3VnZ2VzdGlvbnM6IChwcmVmaXgsIGNvbXBsZXRpb25zKSAtPlxuICAgIGlmIGNvbXBsZXRpb25zP1xuICAgICAgc3VnZ2VzdGlvbnMgPSBbXVxuICAgICAgZm9yIGNvbXBsZXRpb24gaW4gY29tcGxldGlvbnNcbiAgICAgICAga2luZCA9IGNvbXBsZXRpb24ua2luZC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGtpbmQgPSBcImltcG9ydFwiIGlmIGtpbmQgPT0gXCJtb2R1bGVcIlxuICAgICAgICBzdWdnZXN0aW9uID1cbiAgICAgICAgICB0ZXh0OiBjb21wbGV0aW9uLm5hbWVcbiAgICAgICAgICB0eXBlOiBraW5kXG4gICAgICAgICAgbGVmdExhYmVsOiBjb21wbGV0aW9uLmJhc2VfbmFtZVxuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKHN1Z2dlc3Rpb24pXG4gICAgICBzdWdnZXN0aW9ucy5zb3J0ICh4LCB5KSAtPlxuICAgICAgICBpZiB4LnRleHQ+eS50ZXh0XG4gICAgICAgICAgMVxuICAgICAgICBlbHNlIGlmIHgudGV4dDx5LnRleHRcbiAgICAgICAgICAtMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgMFxuXG4gICAgICByZXR1cm4gc3VnZ2VzdGlvbnNcbiAgICByZXR1cm4gW11cblxuXG4gIGZpbHRlclN1Z2dlc3Rpb25zOiAocHJlZml4LCBzdWdnZXN0aW9ucykgLT5cbiAgICBzdWdnZXN0aW9uQnVmZmVyID0gW11cblxuICAgIGlmKCFwcmVmaXg/Lmxlbmd0aCB8fCAhc3VnZ2VzdGlvbnM/Lmxlbmd0aClcbiAgICAgIHJldHVybiBbXVxuXG4gICAgZXhwcmVzc2lvbiA9IG5ldyBSZWdFeHAoXCJeXCIrcHJlZml4LnJlZ0V4cEVzY2FwZSgpLCBcImlcIilcblxuICAgIGZvciBzdWdnZXN0aW9uIGluIHN1Z2dlc3Rpb25zXG4gICAgICBpZiBleHByZXNzaW9uLnRlc3Qoc3VnZ2VzdGlvbi50ZXh0KVxuICAgICAgICBzdWdnZXN0aW9uLnJlcGxhY2VtZW50UHJlZml4ID0gcHJlZml4XG4gICAgICAgIHN1Z2dlc3Rpb25CdWZmZXIucHVzaChzdWdnZXN0aW9uKVxuXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb25CdWZmZXJcblxuICBkaXNwb3NlOiAtPlxuICAgIHJldHVybiBAcnNlbnNlQ2xpZW50LnN0b3BSc2Vuc2UoKSBpZiBJU19XSU4zMlxuICAgIEByc2Vuc2VDbGllbnQuc3RvcFJzZW5zZVVuaXgoKVxuIl19
