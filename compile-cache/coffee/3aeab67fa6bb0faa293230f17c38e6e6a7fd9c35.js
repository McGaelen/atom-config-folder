(function() {
  var BufferedProcess, ClangFlags, ClangProvider, CompositeDisposable, LanguageUtil, Point, Range, existsSync, path, ref;

  ref = require('atom'), Point = ref.Point, Range = ref.Range, BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  existsSync = require('fs').existsSync;

  ClangFlags = require('clang-flags');

  module.exports = ClangProvider = (function() {
    function ClangProvider() {}

    ClangProvider.prototype.selector = '.source.cpp, .source.c, .source.objc, .source.objcpp';

    ClangProvider.prototype.inclusionPriority = 1;

    ClangProvider.prototype.scopeSource = {
      'source.cpp': 'c++',
      'source.c': 'c',
      'source.objc': 'objective-c',
      'source.objcpp': 'objective-c++'
    };

    ClangProvider.prototype.getSuggestions = function(arg1) {
      var bufferPosition, editor, language, lastSymbol, line, minimumWordLength, prefix, ref1, regex, scopeDescriptor, symbolPosition;
      editor = arg1.editor, scopeDescriptor = arg1.scopeDescriptor, bufferPosition = arg1.bufferPosition;
      language = LanguageUtil.getSourceScopeLang(this.scopeSource, scopeDescriptor.getScopesArray());
      prefix = LanguageUtil.prefixAtPosition(editor, bufferPosition);
      ref1 = LanguageUtil.nearestSymbolPosition(editor, bufferPosition), symbolPosition = ref1[0], lastSymbol = ref1[1];
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      if ((minimumWordLength != null) && prefix.length < minimumWordLength) {
        regex = /(?:\.|->|::)\s*\w*$/;
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        if (!regex.test(line)) {
          return;
        }
      }
      if (language != null) {
        return this.codeCompletionAt(editor, symbolPosition.row, symbolPosition.column, language, prefix);
      }
    };

    ClangProvider.prototype.codeCompletionAt = function(editor, row, column, language, prefix) {
      var args, command, options;
      command = atom.config.get("autocomplete-clang.clangCommand");
      args = this.buildClangArgs(editor, row, column, language);
      options = {
        cwd: path.dirname(editor.getPath()),
        input: editor.getText()
      };
      return new Promise((function(_this) {
        return function(resolve) {
          var allOutput, bufferedProcess, exit, stderr, stdout;
          allOutput = [];
          stdout = function(output) {
            return allOutput.push(output);
          };
          stderr = function(output) {
            return console.log(output);
          };
          exit = function(code) {
            return resolve(_this.handleCompletionResult(allOutput.join('\n'), code, prefix));
          };
          bufferedProcess = new BufferedProcess({
            command: command,
            args: args,
            options: options,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
          bufferedProcess.process.stdin.setEncoding = 'utf-8';
          bufferedProcess.process.stdin.write(editor.getText());
          return bufferedProcess.process.stdin.end();
        };
      })(this));
    };

    ClangProvider.prototype.convertCompletionLine = function(line, prefix) {
      var argumentsRe, basicInfo, basicInfoRe, comment, commentRe, completion, completionAndComment, constMemFuncRe, content, contentRe, index, infoTagsRe, isConstMemFunc, match, optionalArgumentsStart, ref1, ref2, ref3, returnType, returnTypeRe, suggestion;
      contentRe = /^COMPLETION: (.*)/;
      ref1 = line.match(contentRe), line = ref1[0], content = ref1[1];
      basicInfoRe = /^(.*?) : (.*)/;
      match = content.match(basicInfoRe);
      if (match == null) {
        return {
          text: content
        };
      }
      content = match[0], basicInfo = match[1], completionAndComment = match[2];
      commentRe = /(?: : (.*))?$/;
      ref2 = completionAndComment.split(commentRe), completion = ref2[0], comment = ref2[1];
      returnTypeRe = /^\[#(.*?)#\]/;
      returnType = (ref3 = completion.match(returnTypeRe)) != null ? ref3[1] : void 0;
      constMemFuncRe = /\[# const#\]$/;
      isConstMemFunc = constMemFuncRe.test(completion);
      infoTagsRe = /\[#(.*?)#\]/g;
      completion = completion.replace(infoTagsRe, '');
      argumentsRe = /<#(.*?)#>/g;
      optionalArgumentsStart = completion.indexOf('{#');
      completion = completion.replace(/\{#/g, '');
      completion = completion.replace(/#\}/g, '');
      index = 0;
      completion = completion.replace(argumentsRe, function(match, arg, offset) {
        index++;
        if (optionalArgumentsStart > 0 && offset > optionalArgumentsStart) {
          return "${" + index + ":optional " + arg + "}";
        } else {
          return "${" + index + ":" + arg + "}";
        }
      });
      suggestion = {};
      if (returnType != null) {
        suggestion.leftLabel = returnType;
      }
      if (index > 0) {
        suggestion.snippet = completion;
      } else {
        suggestion.text = completion;
      }
      if (isConstMemFunc) {
        suggestion.displayText = completion + ' const';
      }
      if (comment != null) {
        suggestion.description = comment;
      }
      suggestion.replacementPrefix = prefix;
      return suggestion;
    };

    ClangProvider.prototype.handleCompletionResult = function(result, returnCode, prefix) {
      var completionsRe, line, outputLines;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      completionsRe = new RegExp("^COMPLETION: (" + prefix + ".*)$", "mg");
      outputLines = result.match(completionsRe);
      if (outputLines != null) {
        return (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = outputLines.length; j < len; j++) {
            line = outputLines[j];
            results.push(this.convertCompletionLine(line, prefix));
          }
          return results;
        }).call(this);
      } else {
        return [];
      }
    };

    ClangProvider.prototype.buildClangArgs = function(editor, row, column, language) {
      var args, clangflags, currentDir, error, i, j, len, pchFile, pchFilePrefix, pchPath, ref1, std;
      std = atom.config.get("autocomplete-clang.std " + language);
      currentDir = path.dirname(editor.getPath());
      pchFilePrefix = atom.config.get("autocomplete-clang.pchFilePrefix");
      pchFile = [pchFilePrefix, language, "pch"].join('.');
      pchPath = path.join(currentDir, pchFile);
      args = ["-fsyntax-only"];
      args.push("-x" + language);
      if (std) {
        args.push("-std=" + std);
      }
      args.push("-Xclang", "-code-completion-macros");
      args.push("-Xclang", "-code-completion-at=-:" + (row + 1) + ":" + (column + 1));
      if (existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      ref1 = atom.config.get("autocomplete-clang.includePaths");
      for (j = 0, len = ref1.length; j < len; j++) {
        i = ref1[j];
        args.push("-I" + i);
      }
      args.push("-I" + currentDir);
      if (atom.config.get("autocomplete-clang.includeDocumentation")) {
        args.push("-Xclang", "-code-completion-brief-comments");
        if (atom.config.get("autocomplete-clang.includeNonDoxygenCommentsAsDocumentation")) {
          args.push("-fparse-all-comments");
        }
        if (atom.config.get("autocomplete-clang.includeSystemHeadersDocumentation")) {
          args.push("-fretain-comments-from-system-headers");
        }
      }
      try {
        clangflags = ClangFlags.getClangFlags(editor.getPath());
        if (clangflags) {
          args = args.concat(clangflags);
        }
      } catch (error1) {
        error = error1;
        console.log(error);
      }
      args.push("-");
      return args;
    };

    return ClangProvider;

  })();

  LanguageUtil = {
    getSourceScopeLang: function(scopeSource, scopesArray) {
      var j, len, scope;
      for (j = 0, len = scopesArray.length; j < len; j++) {
        scope = scopesArray[j];
        if (scope in scopeSource) {
          return scopeSource[scope];
        }
      }
      return null;
    },
    prefixAtPosition: function(editor, bufferPosition) {
      var line, ref1, regex;
      regex = /\w+$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((ref1 = line.match(regex)) != null ? ref1[0] : void 0) || '';
    },
    nearestSymbolPosition: function(editor, bufferPosition) {
      var line, matches, regex, symbol, symbolColumn;
      regex = /(\W+)\w*$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(regex);
      if (matches) {
        symbol = matches[1];
        symbolColumn = matches[0].indexOf(symbol) + symbol.length + (line.length - matches[0].length);
        return [new Point(bufferPosition.row, symbolColumn), symbol.slice(-1)];
      } else {
        return [bufferPosition, ''];
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL2NsYW5nLXByb3ZpZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtBQUFBLE1BQUE7O0VBQUEsTUFBdUQsT0FBQSxDQUFRLE1BQVIsQ0FBdkQsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWUscUNBQWYsRUFBZ0M7O0VBQ2hDLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixhQUFjLE9BQUEsQ0FBUSxJQUFSOztFQUNmLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUNNOzs7NEJBQ0osUUFBQSxHQUFVOzs0QkFDVixpQkFBQSxHQUFtQjs7NEJBRW5CLFdBQUEsR0FDRTtNQUFBLFlBQUEsRUFBYyxLQUFkO01BQ0EsVUFBQSxFQUFZLEdBRFo7TUFFQSxhQUFBLEVBQWUsYUFGZjtNQUdBLGVBQUEsRUFBaUIsZUFIakI7Ozs0QkFLRixjQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNkLFVBQUE7TUFEZ0Isc0JBQVEsd0NBQWlCO01BQ3pDLFFBQUEsR0FBVyxZQUFZLENBQUMsa0JBQWIsQ0FBZ0MsSUFBQyxDQUFBLFdBQWpDLEVBQThDLGVBQWUsQ0FBQyxjQUFoQixDQUFBLENBQTlDO01BQ1gsTUFBQSxHQUFTLFlBQVksQ0FBQyxnQkFBYixDQUE4QixNQUE5QixFQUFzQyxjQUF0QztNQUNULE9BQThCLFlBQVksQ0FBQyxxQkFBYixDQUFtQyxNQUFuQyxFQUEyQyxjQUEzQyxDQUE5QixFQUFDLHdCQUFELEVBQWdCO01BQ2hCLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEI7TUFFcEIsSUFBRywyQkFBQSxJQUF1QixNQUFNLENBQUMsTUFBUCxHQUFnQixpQkFBMUM7UUFDRSxLQUFBLEdBQVE7UUFDUixJQUFBLEdBQU8s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RUE7SUFIa0IsQ0FBcEI7SUFLQSxnQkFBQSxFQUFrQixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ2hCLFVBQUE7TUFBQSxLQUFBLEdBQVE7TUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO3VEQUNZLENBQUEsQ0FBQSxXQUFuQixJQUF5QjtJQUhULENBTGxCO0lBVUEscUJBQUEsRUFBdUIsU0FBQyxNQUFELEVBQVMsY0FBVDtBQUNyQixVQUFBO01BQUEsS0FBQSxHQUFRO01BQ1IsSUFBQSxHQUFPLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBaEIsRUFBcUIsQ0FBckIsQ0FBRCxFQUEwQixjQUExQixDQUF0QjtNQUNQLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVg7TUFDVixJQUFHLE9BQUg7UUFDRSxNQUFBLEdBQVMsT0FBUSxDQUFBLENBQUE7UUFDakIsWUFBQSxHQUFlLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQUEsR0FBNkIsTUFBTSxDQUFDLE1BQXBDLEdBQTZDLENBQUMsSUFBSSxDQUFDLE1BQUwsR0FBYyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBMUI7ZUFDNUQsQ0FBSyxJQUFBLEtBQUEsQ0FBTSxjQUFjLENBQUMsR0FBckIsRUFBMEIsWUFBMUIsQ0FBTCxFQUE2QyxNQUFPLFVBQXBELEVBSEY7T0FBQSxNQUFBO2VBS0UsQ0FBQyxjQUFELEVBQWdCLEVBQWhCLEVBTEY7O0lBSnFCLENBVnZCOztBQXJJRiIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIgY29kZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9iZW5vZ2xlL2F1dG9jb21wbGV0ZS1jbGFuZ1xuIyBDb3B5cmlnaHQgKGMpIDIwMTUgQmVuIE9nbGUgdW5kZXIgTUlUIGxpY2Vuc2VcbiMgQ2xhbmcgcmVsYXRlZCBjb2RlIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3lhc3V5dWt5L2F1dG9jb21wbGV0ZS1jbGFuZ1xuXG57UG9pbnQsIFJhbmdlLCBCdWZmZXJlZFByb2Nlc3MsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue2V4aXN0c1N5bmN9ID0gcmVxdWlyZSAnZnMnXG5DbGFuZ0ZsYWdzID0gcmVxdWlyZSAnY2xhbmctZmxhZ3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENsYW5nUHJvdmlkZXJcbiAgc2VsZWN0b3I6ICcuc291cmNlLmNwcCwgLnNvdXJjZS5jLCAuc291cmNlLm9iamMsIC5zb3VyY2Uub2JqY3BwJ1xuICBpbmNsdXNpb25Qcmlvcml0eTogMVxuXG4gIHNjb3BlU291cmNlOlxuICAgICdzb3VyY2UuY3BwJzogJ2MrKydcbiAgICAnc291cmNlLmMnOiAnYydcbiAgICAnc291cmNlLm9iamMnOiAnb2JqZWN0aXZlLWMnXG4gICAgJ3NvdXJjZS5vYmpjcHAnOiAnb2JqZWN0aXZlLWMrKydcblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIHNjb3BlRGVzY3JpcHRvciwgYnVmZmVyUG9zaXRpb259KSAtPlxuICAgIGxhbmd1YWdlID0gTGFuZ3VhZ2VVdGlsLmdldFNvdXJjZVNjb3BlTGFuZyhAc2NvcGVTb3VyY2UsIHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpKVxuICAgIHByZWZpeCA9IExhbmd1YWdlVXRpbC5wcmVmaXhBdFBvc2l0aW9uKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgW3N5bWJvbFBvc2l0aW9uLGxhc3RTeW1ib2xdID0gTGFuZ3VhZ2VVdGlsLm5lYXJlc3RTeW1ib2xQb3NpdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgIG1pbmltdW1Xb3JkTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5taW5pbXVtV29yZExlbmd0aCcpXG5cbiAgICBpZiBtaW5pbXVtV29yZExlbmd0aD8gYW5kIHByZWZpeC5sZW5ndGggPCBtaW5pbXVtV29yZExlbmd0aFxuICAgICAgcmVnZXggPSAvKD86XFwufC0+fDo6KVxccypcXHcqJC9cbiAgICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgICByZXR1cm4gdW5sZXNzIHJlZ2V4LnRlc3QobGluZSlcblxuICAgIGlmIGxhbmd1YWdlP1xuICAgICAgQGNvZGVDb21wbGV0aW9uQXQoZWRpdG9yLCBzeW1ib2xQb3NpdGlvbi5yb3csIHN5bWJvbFBvc2l0aW9uLmNvbHVtbiwgbGFuZ3VhZ2UsIHByZWZpeClcblxuICBjb2RlQ29tcGxldGlvbkF0OiAoZWRpdG9yLCByb3csIGNvbHVtbiwgbGFuZ3VhZ2UsIHByZWZpeCkgLT5cbiAgICBjb21tYW5kID0gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmNsYW5nQ29tbWFuZFwiXG4gICAgYXJncyA9IEBidWlsZENsYW5nQXJncyhlZGl0b3IsIHJvdywgY29sdW1uLCBsYW5ndWFnZSlcbiAgICBvcHRpb25zID1cbiAgICAgIGN3ZDogcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBpbnB1dDogZWRpdG9yLmdldFRleHQoKVxuXG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBhbGxPdXRwdXQgPSBbXVxuICAgICAgc3Rkb3V0ID0gKG91dHB1dCkgPT4gYWxsT3V0cHV0LnB1c2gob3V0cHV0KVxuICAgICAgc3RkZXJyID0gKG91dHB1dCkgPT4gY29uc29sZS5sb2cgb3V0cHV0XG4gICAgICBleGl0ID0gKGNvZGUpID0+IHJlc29sdmUoQGhhbmRsZUNvbXBsZXRpb25SZXN1bHQoYWxsT3V0cHV0LmpvaW4oJ1xcbicpLCBjb2RlLCBwcmVmaXgpKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgb3B0aW9ucywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uc2V0RW5jb2RpbmcgPSAndXRmLTgnO1xuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUoZWRpdG9yLmdldFRleHQoKSlcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG5cbiAgY29udmVydENvbXBsZXRpb25MaW5lOiAobGluZSwgcHJlZml4KSAtPlxuICAgIGNvbnRlbnRSZSA9IC9eQ09NUExFVElPTjogKC4qKS9cbiAgICBbbGluZSwgY29udGVudF0gPSBsaW5lLm1hdGNoIGNvbnRlbnRSZVxuICAgIGJhc2ljSW5mb1JlID0gL14oLio/KSA6ICguKikvXG4gICAgbWF0Y2ggPSBjb250ZW50Lm1hdGNoIGJhc2ljSW5mb1JlXG4gICAgcmV0dXJuIHt0ZXh0OiBjb250ZW50fSB1bmxlc3MgbWF0Y2g/XG5cbiAgICBbY29udGVudCwgYmFzaWNJbmZvLCBjb21wbGV0aW9uQW5kQ29tbWVudF0gPSBtYXRjaFxuICAgIGNvbW1lbnRSZSA9IC8oPzogOiAoLiopKT8kL1xuICAgIFtjb21wbGV0aW9uLCBjb21tZW50XSA9IGNvbXBsZXRpb25BbmRDb21tZW50LnNwbGl0IGNvbW1lbnRSZVxuICAgIHJldHVyblR5cGVSZSA9IC9eXFxbIyguKj8pI1xcXS9cbiAgICByZXR1cm5UeXBlID0gY29tcGxldGlvbi5tYXRjaChyZXR1cm5UeXBlUmUpP1sxXVxuICAgIGNvbnN0TWVtRnVuY1JlID0gL1xcWyMgY29uc3QjXFxdJC9cbiAgICBpc0NvbnN0TWVtRnVuYyA9IGNvbnN0TWVtRnVuY1JlLnRlc3QgY29tcGxldGlvblxuICAgIGluZm9UYWdzUmUgPSAvXFxbIyguKj8pI1xcXS9nXG4gICAgY29tcGxldGlvbiA9IGNvbXBsZXRpb24ucmVwbGFjZSBpbmZvVGFnc1JlLCAnJ1xuICAgIGFyZ3VtZW50c1JlID0gLzwjKC4qPykjPi9nXG4gICAgb3B0aW9uYWxBcmd1bWVudHNTdGFydCA9IGNvbXBsZXRpb24uaW5kZXhPZiAneyMnXG4gICAgY29tcGxldGlvbiA9IGNvbXBsZXRpb24ucmVwbGFjZSAvXFx7Iy9nLCAnJ1xuICAgIGNvbXBsZXRpb24gPSBjb21wbGV0aW9uLnJlcGxhY2UgLyNcXH0vZywgJydcbiAgICBpbmRleCA9IDBcbiAgICBjb21wbGV0aW9uID0gY29tcGxldGlvbi5yZXBsYWNlIGFyZ3VtZW50c1JlLCAobWF0Y2gsIGFyZywgb2Zmc2V0KSAtPlxuICAgICAgaW5kZXgrK1xuICAgICAgaWYgb3B0aW9uYWxBcmd1bWVudHNTdGFydCA+IDAgYW5kIG9mZnNldCA+IG9wdGlvbmFsQXJndW1lbnRzU3RhcnRcbiAgICAgICAgcmV0dXJuIFwiJHsje2luZGV4fTpvcHRpb25hbCAje2FyZ319XCJcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFwiJHsje2luZGV4fToje2FyZ319XCJcblxuICAgIHN1Z2dlc3Rpb24gPSB7fVxuICAgIHN1Z2dlc3Rpb24ubGVmdExhYmVsID0gcmV0dXJuVHlwZSBpZiByZXR1cm5UeXBlP1xuICAgIGlmIGluZGV4ID4gMFxuICAgICAgc3VnZ2VzdGlvbi5zbmlwcGV0ID0gY29tcGxldGlvblxuICAgIGVsc2VcbiAgICAgIHN1Z2dlc3Rpb24udGV4dCA9IGNvbXBsZXRpb25cbiAgICBpZiBpc0NvbnN0TWVtRnVuY1xuICAgICAgc3VnZ2VzdGlvbi5kaXNwbGF5VGV4dCA9IGNvbXBsZXRpb24gKyAnIGNvbnN0J1xuICAgIHN1Z2dlc3Rpb24uZGVzY3JpcHRpb24gPSBjb21tZW50IGlmIGNvbW1lbnQ/XG4gICAgc3VnZ2VzdGlvbi5yZXBsYWNlbWVudFByZWZpeCA9IHByZWZpeFxuICAgIHN1Z2dlc3Rpb25cblxuICBoYW5kbGVDb21wbGV0aW9uUmVzdWx0OiAocmVzdWx0LCByZXR1cm5Db2RlLCBwcmVmaXgpIC0+XG4gICAgaWYgcmV0dXJuQ29kZSBpcyBub3QgMFxuICAgICAgcmV0dXJuIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaWdub3JlQ2xhbmdFcnJvcnNcIlxuICAgICMgRmluZCBhbGwgY29tcGxldGlvbnMgdGhhdCBtYXRjaCBvdXIgcHJlZml4IGluIE9ORSByZWdleFxuICAgICMgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMuXG4gICAgY29tcGxldGlvbnNSZSA9IG5ldyBSZWdFeHAoXCJeQ09NUExFVElPTjogKFwiICsgcHJlZml4ICsgXCIuKikkXCIsIFwibWdcIilcbiAgICBvdXRwdXRMaW5lcyA9IHJlc3VsdC5tYXRjaChjb21wbGV0aW9uc1JlKVxuXG4gICAgaWYgb3V0cHV0TGluZXM/XG4gICAgICAgIHJldHVybiAoQGNvbnZlcnRDb21wbGV0aW9uTGluZShsaW5lLCBwcmVmaXgpIGZvciBsaW5lIGluIG91dHB1dExpbmVzKVxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFtdXG5cbiAgYnVpbGRDbGFuZ0FyZ3M6IChlZGl0b3IsIHJvdywgY29sdW1uLCBsYW5ndWFnZSkgLT5cbiAgICBzdGQgPSBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuc3RkICN7bGFuZ3VhZ2V9XCJcbiAgICBjdXJyZW50RGlyID0gcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpXG4gICAgcGNoRmlsZVByZWZpeCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5wY2hGaWxlUHJlZml4XCJcbiAgICBwY2hGaWxlID0gW3BjaEZpbGVQcmVmaXgsIGxhbmd1YWdlLCBcInBjaFwiXS5qb2luICcuJ1xuICAgIHBjaFBhdGggPSBwYXRoLmpvaW4oY3VycmVudERpciwgcGNoRmlsZSlcblxuICAgIGFyZ3MgPSBbXCItZnN5bnRheC1vbmx5XCJdXG4gICAgYXJncy5wdXNoIFwiLXgje2xhbmd1YWdlfVwiXG4gICAgYXJncy5wdXNoIFwiLXN0ZD0je3N0ZH1cIiBpZiBzdGRcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWNvZGUtY29tcGxldGlvbi1tYWNyb3NcIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCItY29kZS1jb21wbGV0aW9uLWF0PS06I3tyb3cgKyAxfToje2NvbHVtbiArIDF9XCJcbiAgICBhcmdzLnB1c2goXCItaW5jbHVkZS1wY2hcIiwgcGNoUGF0aCkgaWYgZXhpc3RzU3luYyhwY2hQYXRoKVxuICAgIGFyZ3MucHVzaCBcIi1JI3tpfVwiIGZvciBpIGluIGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5pbmNsdWRlUGF0aHNcIlxuICAgIGFyZ3MucHVzaCBcIi1JI3tjdXJyZW50RGlyfVwiXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZURvY3VtZW50YXRpb25cIlxuICAgICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1jb2RlLWNvbXBsZXRpb24tYnJpZWYtY29tbWVudHNcIlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVOb25Eb3h5Z2VuQ29tbWVudHNBc0RvY3VtZW50YXRpb25cIlxuICAgICAgICBhcmdzLnB1c2ggXCItZnBhcnNlLWFsbC1jb21tZW50c1wiXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZVN5c3RlbUhlYWRlcnNEb2N1bWVudGF0aW9uXCJcbiAgICAgICAgYXJncy5wdXNoIFwiLWZyZXRhaW4tY29tbWVudHMtZnJvbS1zeXN0ZW0taGVhZGVyc1wiXG5cbiAgICB0cnlcbiAgICAgIGNsYW5nZmxhZ3MgPSBDbGFuZ0ZsYWdzLmdldENsYW5nRmxhZ3MoZWRpdG9yLmdldFBhdGgoKSlcbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCBjbGFuZ2ZsYWdzIGlmIGNsYW5nZmxhZ3NcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5sb2cgZXJyb3JcblxuICAgIGFyZ3MucHVzaCBcIi1cIlxuICAgIGFyZ3NcblxuTGFuZ3VhZ2VVdGlsID1cbiAgZ2V0U291cmNlU2NvcGVMYW5nOiAoc2NvcGVTb3VyY2UsIHNjb3Blc0FycmF5KSAtPlxuICAgIGZvciBzY29wZSBpbiBzY29wZXNBcnJheVxuICAgICAgcmV0dXJuIHNjb3BlU291cmNlW3Njb3BlXSBpZiBzY29wZSBvZiBzY29wZVNvdXJjZVxuICAgIG51bGxcblxuICBwcmVmaXhBdFBvc2l0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICByZWdleCA9IC9cXHcrJC9cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIGxpbmUubWF0Y2gocmVnZXgpP1swXSBvciAnJ1xuXG4gIG5lYXJlc3RTeW1ib2xQb3NpdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcmVnZXggPSAvKFxcVyspXFx3KiQvXG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBtYXRjaGVzID0gbGluZS5tYXRjaChyZWdleClcbiAgICBpZiBtYXRjaGVzXG4gICAgICBzeW1ib2wgPSBtYXRjaGVzWzFdXG4gICAgICBzeW1ib2xDb2x1bW4gPSBtYXRjaGVzWzBdLmluZGV4T2Yoc3ltYm9sKSArIHN5bWJvbC5sZW5ndGggKyAobGluZS5sZW5ndGggLSBtYXRjaGVzWzBdLmxlbmd0aClcbiAgICAgIFtuZXcgUG9pbnQoYnVmZmVyUG9zaXRpb24ucm93LCBzeW1ib2xDb2x1bW4pLHN5bWJvbFstMS4uXV1cbiAgICBlbHNlXG4gICAgICBbYnVmZmVyUG9zaXRpb24sJyddXG4iXX0=
