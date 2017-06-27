(function() {
  var ClangProvider, CompositeDisposable, Disposable, File, LocationSelectList, Selection, buildEmitPchCommandArgs, buildGoDeclarationCommandArgs, defaultPrecompiled, makeBufferedClangProcess, path, ref, ref1, util;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable, Selection = ref.Selection, File = ref.File;

  path = require('path');

  util = require('./util');

  makeBufferedClangProcess = require('./clang-args-builder').makeBufferedClangProcess;

  ref1 = require('./clang-args-builder'), buildGoDeclarationCommandArgs = ref1.buildGoDeclarationCommandArgs, buildEmitPchCommandArgs = ref1.buildEmitPchCommandArgs;

  LocationSelectList = require('./location-select-view.coffee');

  ClangProvider = null;

  defaultPrecompiled = require('./defaultPrecompiled');

  module.exports = {
    config: {
      clangCommand: {
        type: 'string',
        "default": 'clang'
      },
      includePaths: {
        type: 'array',
        "default": ['.'],
        items: {
          type: 'string'
        }
      },
      pchFilePrefix: {
        type: 'string',
        "default": '.stdafx'
      },
      ignoreClangErrors: {
        type: 'boolean',
        "default": true
      },
      includeDocumentation: {
        type: 'boolean',
        "default": true
      },
      includeSystemHeadersDocumentation: {
        type: 'boolean',
        "default": false,
        description: "**WARNING**: if there are any PCHs compiled without this option," + "you will have to delete them and generate them again"
      },
      includeNonDoxygenCommentsAsDocumentation: {
        type: 'boolean',
        "default": false
      },
      "std c++": {
        type: 'string',
        "default": "c++11"
      },
      "std c": {
        type: 'string',
        "default": "c99"
      },
      "preCompiledHeaders c++": {
        type: 'array',
        "default": defaultPrecompiled.cpp,
        item: {
          type: 'string'
        }
      },
      "preCompiledHeaders c": {
        type: 'array',
        "default": defaultPrecompiled.c,
        items: {
          type: 'string'
        }
      },
      "preCompiledHeaders objective-c": {
        type: 'array',
        "default": defaultPrecompiled.objc,
        items: {
          type: 'string'
        }
      },
      "preCompiledHeaders objective-c++": {
        type: 'array',
        "default": defaultPrecompiled.objcpp,
        items: {
          type: 'string'
        }
      }
    },
    deactivationDisposables: null,
    activate: function(state) {
      this.deactivationDisposables = new CompositeDisposable;
      this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete-clang:emit-pch': (function(_this) {
          return function() {
            return _this.emitPch(atom.workspace.getActiveTextEditor());
          };
        })(this)
      }));
      return this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete-clang:go-declaration': (function(_this) {
          return function(e) {
            return _this.goDeclaration(atom.workspace.getActiveTextEditor(), e);
          };
        })(this)
      }));
    },
    goDeclaration: function(editor, e) {
      var args, callback, lang, term;
      lang = util.getFirstCursorSourceScopeLang(editor);
      if (!lang) {
        e.abortKeyBinding();
        return;
      }
      editor.selectWordsContainingCursors();
      term = editor.getSelectedText();
      args = buildGoDeclarationCommandArgs(editor, lang, term);
      callback = (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log("GoDecl err\n", errors);
          return resolve(_this.handleGoDeclarationResult(editor, {
            output: outputs,
            term: term
          }, code));
        };
      })(this);
      return makeBufferedClangProcess(editor, args, callback, editor.getText());
    },
    emitPch: function(editor) {
      var args, callback, h, headers, headersInput, lang;
      lang = util.getFirstCursorSourceScopeLang(editor);
      if (!lang) {
        atom.notifications.addError("autocomplete-clang:emit-pch\nError: Incompatible Language");
        return;
      }
      headers = atom.config.get("autocomplete-clang.preCompiledHeaders " + lang);
      headersInput = ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = headers.length; i < len; i++) {
          h = headers[i];
          results.push("#include <" + h + ">");
        }
        return results;
      })()).join("\n");
      args = buildEmitPchCommandArgs(editor, lang);
      callback = (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log("-emit-pch out\n", outputs);
          console.log("-emit-pch err\n", errors);
          return resolve(_this.handleEmitPchResult(code));
        };
      })(this);
      return makeBufferedClangProcess(editor, args, callback, headersInput);
    },
    handleGoDeclarationResult: function(editor, result, returnCode) {
      var list, places;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      places = this.parseAstDump(result.output, result.term);
      if (places.length === 1) {
        return this.goToLocation(editor, places.pop());
      } else if (places.length > 1) {
        list = new LocationSelectList(editor, this.goToLocation);
        return list.setItems(places);
      }
    },
    goToLocation: function(editor, arg) {
      var col, f, file, line;
      file = arg[0], line = arg[1], col = arg[2];
      if (file === '<stdin>') {
        return editor.setCursorBufferPosition([line - 1, col - 1]);
      }
      if (file.startsWith(".")) {
        file = path.join(editor.getDirectoryPath(), file);
      }
      f = new File(file);
      return f.exists().then(function(result) {
        if (result) {
          return atom.workspace.open(file, {
            initialLine: line - 1,
            initialColumn: col - 1
          });
        }
      });
    },
    parseAstDump: function(aststring, term) {
      var _, candidate, candidates, col, declRangeStr, declTerms, file, i, len, line, lines, match, places, posStr, positions, ref2, ref3;
      candidates = aststring.split('\n\n');
      places = [];
      for (i = 0, len = candidates.length; i < len; i++) {
        candidate = candidates[i];
        match = candidate.match(RegExp("^Dumping\\s(?:[A-Za-z_]*::)*?" + term + ":"));
        if (match !== null) {
          lines = candidate.split('\n');
          if (lines.length < 2) {
            continue;
          }
          declTerms = lines[1].split(' ');
          _ = declTerms[0], _ = declTerms[1], declRangeStr = declTerms[2], _ = declTerms[3], posStr = declTerms[4];
          if (declRangeStr === "prev") {
            _ = declTerms[0], _ = declTerms[1], _ = declTerms[2], _ = declTerms[3], declRangeStr = declTerms[4], _ = declTerms[5], posStr = declTerms[6];
          }
          ref2 = declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/), _ = ref2[0], file = ref2[1], line = ref2[2], col = ref2[3];
          positions = posStr.match(/(line|col):([0-9]+)(?::([0-9]+))?/);
          if (positions) {
            if (positions[1] === 'line') {
              ref3 = [positions[2], positions[3]], line = ref3[0], col = ref3[1];
            } else {
              col = positions[2];
            }
          }
          places.push([file, Number(line), Number(col)]);
        }
      }
      return places;
    },
    handleEmitPchResult: function(code) {
      if (!code) {
        atom.notifications.addSuccess("Emiting precompiled header has successfully finished");
        return;
      }
      return atom.notifications.addError(("Emiting precompiled header exit with " + code + "\n") + "See console for detailed error message");
    },
    deactivate: function() {
      return this.deactivationDisposables.dispose();
    },
    provide: function() {
      if (ClangProvider == null) {
        ClangProvider = require('./clang-provider');
      }
      return new ClangProvider();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL2F1dG9jb21wbGV0ZS1jbGFuZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWtELE9BQUEsQ0FBUSxNQUFSLENBQWxELEVBQUMsNkNBQUQsRUFBcUIsMkJBQXJCLEVBQWdDLHlCQUFoQyxFQUEwQzs7RUFDMUMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDTiwyQkFBNkIsT0FBQSxDQUFRLHNCQUFSOztFQUM5QixPQUEwRCxPQUFBLENBQVEsc0JBQVIsQ0FBMUQsRUFBQyxrRUFBRCxFQUErQjs7RUFDL0Isa0JBQUEsR0FBcUIsT0FBQSxDQUFRLCtCQUFSOztFQUVyQixhQUFBLEdBQWdCOztFQUNoQixrQkFBQSxHQUFxQixPQUFBLENBQVEsc0JBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsR0FBRCxDQURUO1FBRUEsS0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FIRjtPQUpGO01BUUEsYUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBRFQ7T0FURjtNQVdBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQVpGO01BY0Esb0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFB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YSxDQUFDLFNBQVUsQ0FBQSxDQUFBLENBQVgsRUFBZSxTQUFVLENBQUEsQ0FBQSxDQUF6QixDQUFiLEVBQUMsY0FBRCxFQUFNLGNBRFI7YUFBQSxNQUFBO2NBR0UsR0FBQSxHQUFNLFNBQVUsQ0FBQSxDQUFBLEVBSGxCO2FBREY7O1VBS0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLElBQUQsRUFBTyxNQUFBLENBQU8sSUFBUCxDQUFQLEVBQXFCLE1BQUEsQ0FBTyxHQUFQLENBQXJCLENBQVosRUFiRjs7QUFGRjtBQWdCQSxhQUFPO0lBbkJLLENBOUdkO0lBbUlBLG1CQUFBLEVBQXFCLFNBQUMsSUFBRDtNQUNuQixJQUFBLENBQU8sSUFBUDtRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsc0RBQTlCO0FBQ0EsZUFGRjs7YUFHQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLENBQUEsdUNBQUEsR0FBd0MsSUFBeEMsR0FBNkMsSUFBN0MsQ0FBQSxHQUMxQix3Q0FERjtJQUptQixDQW5JckI7SUEwSUEsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsdUJBQXVCLENBQUMsT0FBekIsQ0FBQTtJQURVLENBMUlaO0lBNklBLE9BQUEsRUFBUyxTQUFBOztRQUNQLGdCQUFpQixPQUFBLENBQVEsa0JBQVI7O2FBQ2IsSUFBQSxhQUFBLENBQUE7SUFGRyxDQTdJVDs7QUFYRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLERpc3Bvc2FibGUsU2VsZWN0aW9uLEZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xudXRpbCA9IHJlcXVpcmUgJy4vdXRpbCdcbnttYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3N9ICA9IHJlcXVpcmUgJy4vY2xhbmctYXJncy1idWlsZGVyJ1xue2J1aWxkR29EZWNsYXJhdGlvbkNvbW1hbmRBcmdzLGJ1aWxkRW1pdFBjaENvbW1hbmRBcmdzfSA9IHJlcXVpcmUgJy4vY2xhbmctYXJncy1idWlsZGVyJ1xuTG9jYXRpb25TZWxlY3RMaXN0ID0gcmVxdWlyZSAnLi9sb2NhdGlvbi1zZWxlY3Qtdmlldy5jb2ZmZWUnXG5cbkNsYW5nUHJvdmlkZXIgPSBudWxsXG5kZWZhdWx0UHJlY29tcGlsZWQgPSByZXF1aXJlICcuL2RlZmF1bHRQcmVjb21waWxlZCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgY2xhbmdDb21tYW5kOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdjbGFuZydcbiAgICBpbmNsdWRlUGF0aHM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbJy4nXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgcGNoRmlsZVByZWZpeDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnLnN0ZGFmeCdcbiAgICBpZ25vcmVDbGFuZ0Vycm9yczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIGluY2x1ZGVEb2N1bWVudGF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgaW5jbHVkZVN5c3RlbUhlYWRlcnNEb2N1bWVudGF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiKipXQVJOSU5HKio6IGlmIHRoZXJlIGFyZSBhbnkgUENIcyBjb21waWxlZCB3aXRob3V0IHRoaXMgb3B0aW9uLFwiK1xuICAgICAgICBcInlvdSB3aWxsIGhhdmUgdG8gZGVsZXRlIHRoZW0gYW5kIGdlbmVyYXRlIHRoZW0gYWdhaW5cIlxuICAgIGluY2x1ZGVOb25Eb3h5Z2VuQ29tbWVudHNBc0RvY3VtZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgXCJzdGQgYysrXCI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJjKysxMVwiXG4gICAgXCJzdGQgY1wiOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiYzk5XCJcbiAgICBcInByZUNvbXBpbGVkSGVhZGVycyBjKytcIjpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRQcmVjb21waWxlZC5jcHBcbiAgICAgIGl0ZW06XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgXCJwcmVDb21waWxlZEhlYWRlcnMgY1wiOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLmNcbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIFwicHJlQ29tcGlsZWRIZWFkZXJzIG9iamVjdGl2ZS1jXCI6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0UHJlY29tcGlsZWQub2JqY1xuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgXCJwcmVDb21waWxlZEhlYWRlcnMgb2JqZWN0aXZlLWMrK1wiOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLm9iamNwcFxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG5cbiAgZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXM6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnYXV0b2NvbXBsZXRlLWNsYW5nOmVtaXQtcGNoJzogPT5cbiAgICAgICAgQGVtaXRQY2ggYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnYXV0b2NvbXBsZXRlLWNsYW5nOmdvLWRlY2xhcmF0aW9uJzogKGUpPT5cbiAgICAgICAgQGdvRGVjbGFyYXRpb24gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLGVcblxuICBnb0RlY2xhcmF0aW9uOiAoZWRpdG9yLGUpLT5cbiAgICBsYW5nID0gdXRpbC5nZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZyBlZGl0b3JcbiAgICB1bmxlc3MgbGFuZ1xuICAgICAgZS5hYm9ydEtleUJpbmRpbmcoKVxuICAgICAgcmV0dXJuXG4gICAgZWRpdG9yLnNlbGVjdFdvcmRzQ29udGFpbmluZ0N1cnNvcnMoKVxuICAgIHRlcm0gPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICBhcmdzID0gYnVpbGRHb0RlY2xhcmF0aW9uQ29tbWFuZEFyZ3MgZWRpdG9yLCBsYW5nLCB0ZXJtXG4gICAgY2FsbGJhY2sgPSAoY29kZSwgb3V0cHV0cywgZXJyb3JzLCByZXNvbHZlKSA9PlxuICAgICAgY29uc29sZS5sb2cgXCJHb0RlY2wgZXJyXFxuXCIsIGVycm9yc1xuICAgICAgcmVzb2x2ZShAaGFuZGxlR29EZWNsYXJhdGlvblJlc3VsdCBlZGl0b3IsIHtvdXRwdXQ6b3V0cHV0cywgdGVybTp0ZXJtfSwgY29kZSlcbiAgICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3MgZWRpdG9yLCBhcmdzLCBjYWxsYmFjaywgZWRpdG9yLmdldFRleHQoKVxuXG4gIGVtaXRQY2g6IChlZGl0b3IpLT5cbiAgICBsYW5nID0gdXRpbC5nZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZyBlZGl0b3JcbiAgICB1bmxlc3MgbGFuZ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiYXV0b2NvbXBsZXRlLWNsYW5nOmVtaXQtcGNoXFxuRXJyb3I6IEluY29tcGF0aWJsZSBMYW5ndWFnZVwiXG4gICAgICByZXR1cm5cbiAgICBoZWFkZXJzID0gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLnByZUNvbXBpbGVkSGVhZGVycyAje2xhbmd9XCJcbiAgICBoZWFkZXJzSW5wdXQgPSAoXCIjaW5jbHVkZSA8I3tofT5cIiBmb3IgaCBpbiBoZWFkZXJzKS5qb2luIFwiXFxuXCJcbiAgICBhcmdzID0gYnVpbGRFbWl0UGNoQ29tbWFuZEFyZ3MgZWRpdG9yLCBsYW5nXG4gICAgY2FsbGJhY2sgPSAoY29kZSwgb3V0cHV0cywgZXJyb3JzLCByZXNvbHZlKSA9PlxuICAgICAgY29uc29sZS5sb2cgXCItZW1pdC1wY2ggb3V0XFxuXCIsIG91dHB1dHNcbiAgICAgIGNvbnNvbGUubG9nIFwiLWVtaXQtcGNoIGVyclxcblwiLCBlcnJvcnNcbiAgICAgIHJlc29sdmUoQGhhbmRsZUVtaXRQY2hSZXN1bHQgY29kZSlcbiAgICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3MgZWRpdG9yLCBhcmdzLCBjYWxsYmFjaywgaGVhZGVyc0lucHV0XG5cbiAgaGFuZGxlR29EZWNsYXJhdGlvblJlc3VsdDogKGVkaXRvciwgcmVzdWx0LCByZXR1cm5Db2RlKS0+XG4gICAgaWYgcmV0dXJuQ29kZSBpcyBub3QgMFxuICAgICAgcmV0dXJuIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaWdub3JlQ2xhbmdFcnJvcnNcIlxuICAgIHBsYWNlcyA9IEBwYXJzZUFzdER1bXAgcmVzdWx0Lm91dHB1dCwgcmVzdWx0LnRlcm1cbiAgICBpZiBwbGFjZXMubGVuZ3RoIGlzIDFcbiAgICAgIEBnb1RvTG9jYXRpb24gZWRpdG9yLCBwbGFjZXMucG9wKClcbiAgICBlbHNlIGlmIHBsYWNlcy5sZW5ndGggPiAxXG4gICAgICBsaXN0ID0gbmV3IExvY2F0aW9uU2VsZWN0TGlzdChlZGl0b3IsIEBnb1RvTG9jYXRpb24pXG4gICAgICBsaXN0LnNldEl0ZW1zKHBsYWNlcylcblxuICBnb1RvTG9jYXRpb246IChlZGl0b3IsIFtmaWxlLGxpbmUsY29sXSkgLT5cbiAgICBpZiBmaWxlIGlzICc8c3RkaW4+J1xuICAgICAgcmV0dXJuIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbbGluZS0xLGNvbC0xXVxuICAgIGZpbGUgPSBwYXRoLmpvaW4gZWRpdG9yLmdldERpcmVjdG9yeVBhdGgoKSwgZmlsZSBpZiBmaWxlLnN0YXJ0c1dpdGgoXCIuXCIpXG4gICAgZiA9IG5ldyBGaWxlIGZpbGVcbiAgICBmLmV4aXN0cygpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZSwge2luaXRpYWxMaW5lOmxpbmUtMSwgaW5pdGlhbENvbHVtbjpjb2wtMX0gaWYgcmVzdWx0XG5cbiAgcGFyc2VBc3REdW1wOiAoYXN0c3RyaW5nLCB0ZXJtKS0+XG4gICAgY2FuZGlkYXRlcyA9IGFzdHN0cmluZy5zcGxpdCAnXFxuXFxuJ1xuICAgIHBsYWNlcyA9IFtdXG4gICAgZm9yIGNhbmRpZGF0ZSBpbiBjYW5kaWRhdGVzXG4gICAgICBtYXRjaCA9IGNhbmRpZGF0ZS5tYXRjaCAvLy9eRHVtcGluZ1xccyg/OltBLVphLXpfXSo6OikqPyN7dGVybX06Ly8vXG4gICAgICBpZiBtYXRjaCBpc250IG51bGxcbiAgICAgICAgbGluZXMgPSBjYW5kaWRhdGUuc3BsaXQgJ1xcbidcbiAgICAgICAgY29udGludWUgaWYgbGluZXMubGVuZ3RoIDwgMlxuICAgICAgICBkZWNsVGVybXMgPSBsaW5lc1sxXS5zcGxpdCAnICdcbiAgICAgICAgW18sXyxkZWNsUmFuZ2VTdHIsXyxwb3NTdHIsLi4uXSA9IGRlY2xUZXJtc1xuICAgICAgICBbXyxfLF8sXyxkZWNsUmFuZ2VTdHIsXyxwb3NTdHIsLi4uXSA9IGRlY2xUZXJtcyBpZiBkZWNsUmFuZ2VTdHIgaXMgXCJwcmV2XCJcbiAgICAgICAgW18sZmlsZSxsaW5lLGNvbF0gPSBkZWNsUmFuZ2VTdHIubWF0Y2ggLzwoLiopOihbMC05XSspOihbMC05XSspLC9cbiAgICAgICAgcG9zaXRpb25zID0gcG9zU3RyLm1hdGNoIC8obGluZXxjb2wpOihbMC05XSspKD86OihbMC05XSspKT8vXG4gICAgICAgIGlmIHBvc2l0aW9uc1xuICAgICAgICAgIGlmIHBvc2l0aW9uc1sxXSBpcyAnbGluZSdcbiAgICAgICAgICAgIFtsaW5lLGNvbF0gPSBbcG9zaXRpb25zWzJdLCBwb3NpdGlvbnNbM11dXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sID0gcG9zaXRpb25zWzJdXG4gICAgICAgIHBsYWNlcy5wdXNoIFtmaWxlLChOdW1iZXIgbGluZSksKE51bWJlciBjb2wpXVxuICAgIHJldHVybiBwbGFjZXNcblxuICBoYW5kbGVFbWl0UGNoUmVzdWx0OiAoY29kZSktPlxuICAgIHVubGVzcyBjb2RlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyBcIkVtaXRpbmcgcHJlY29tcGlsZWQgaGVhZGVyIGhhcyBzdWNjZXNzZnVsbHkgZmluaXNoZWRcIlxuICAgICAgcmV0dXJuXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiRW1pdGluZyBwcmVjb21waWxlZCBoZWFkZXIgZXhpdCB3aXRoICN7Y29kZX1cXG5cIitcbiAgICAgIFwiU2VlIGNvbnNvbGUgZm9yIGRldGFpbGVkIGVycm9yIG1lc3NhZ2VcIlxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gIHByb3ZpZGU6IC0+XG4gICAgQ2xhbmdQcm92aWRlciA/PSByZXF1aXJlKCcuL2NsYW5nLXByb3ZpZGVyJylcbiAgICBuZXcgQ2xhbmdQcm92aWRlcigpXG4iXX0=
