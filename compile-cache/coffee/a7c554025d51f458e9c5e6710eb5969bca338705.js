(function() {
  var BufferedProcess, ClangFlags, ClangProvider, CompositeDisposable, Disposable, File, LocationSelectList, Selection, defaultPrecompiled, existsSync, path, ref, spawn, util;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable, BufferedProcess = ref.BufferedProcess, Selection = ref.Selection, File = ref.File;

  util = require('./util');

  spawn = require('child_process').spawn;

  path = require('path');

  existsSync = require('fs').existsSync;

  ClangFlags = require('clang-flags');

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
        description: "**WARNING**: if there are any PCHs compiled without this option, you will have to delete them and generate them again"
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
      var args, command, lang, options, term;
      lang = util.getFirstCursorSourceScopeLang(editor);
      if (!lang) {
        e.abortKeyBinding();
        return;
      }
      command = atom.config.get("autocomplete-clang.clangCommand");
      editor.selectWordsContainingCursors();
      term = editor.getSelectedText();
      args = this.buildGoDeclarationCommandArgs(editor, lang, term);
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
            return resolve(_this.handleGoDeclarationResult(editor, {
              output: allOutput.join("\n"),
              term: term
            }, code));
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
    },
    emitPch: function(editor) {
      var args, clang_command, emit_process, h, headers, headersInput, lang;
      lang = util.getFirstCursorSourceScopeLang(editor);
      if (!lang) {
        alert("autocomplete-clang:emit-pch\nError: Incompatible Language");
        return;
      }
      clang_command = atom.config.get("autocomplete-clang.clangCommand");
      args = this.buildEmitPchCommandArgs(editor, lang);
      emit_process = spawn(clang_command, args);
      emit_process.on("exit", (function(_this) {
        return function(code) {
          return _this.handleEmitPchResult(code);
        };
      })(this));
      emit_process.stdout.on('data', function(data) {
        return console.log("out:\n" + data.toString());
      });
      emit_process.stderr.on('data', function(data) {
        return console.log("err:\n" + data.toString());
      });
      headers = atom.config.get("autocomplete-clang.preCompiledHeaders " + lang);
      headersInput = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = headers.length; j < len; j++) {
          h = headers[j];
          results.push("#include <" + h + ">");
        }
        return results;
      })()).join("\n");
      emit_process.stdin.write(headersInput);
      return emit_process.stdin.end();
    },
    buildGoDeclarationCommandArgs: function(editor, language, term) {
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
      args.push("-Xclang", "-ast-dump");
      args.push("-Xclang", "-ast-dump-filter");
      args.push("-Xclang", "" + term);
      if (existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      ref1 = atom.config.get("autocomplete-clang.includePaths");
      for (j = 0, len = ref1.length; j < len; j++) {
        i = ref1[j];
        args.push("-I" + i);
      }
      args.push("-I" + currentDir);
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
    },
    buildEmitPchCommandArgs: function(editor, lang) {
      var args, dir, file, i, include_paths, pch, pch_file_prefix, std;
      dir = path.dirname(editor.getPath());
      pch_file_prefix = atom.config.get("autocomplete-clang.pchFilePrefix");
      file = [pch_file_prefix, lang, "pch"].join('.');
      pch = path.join(dir, file);
      std = atom.config.get("autocomplete-clang.std " + lang);
      args = ["-x" + lang + "-header", "-Xclang", '-emit-pch', '-o', pch];
      if (std) {
        args = args.concat(["-std=" + std]);
      }
      include_paths = atom.config.get("autocomplete-clang.includePaths");
      args = args.concat((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = include_paths.length; j < len; j++) {
          i = include_paths[j];
          results.push("-I" + i);
        }
        return results;
      })());
      if (atom.config.get("autocomplete-clang.includeDocumentation")) {
        args.push("-Xclang", "-code-completion-brief-comments");
        if (atom.config.get("autocomplete-clang.includeNonDoxygenCommentsAsDocumentation")) {
          args.push("-fparse-all-comments");
        }
        if (atom.config.get("autocomplete-clang.includeSystemHeadersDocumentation")) {
          args.push("-fretain-comments-from-system-headers");
        }
      }
      args = args.concat(["-"]);
      return args;
    },
    handleGoDeclarationResult: function(editor, result, returnCode) {
      var list, places;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      places = this.parseAstDump(result['output'], result['term']);
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
      var _, candidate, candidates, col, declRangeStr, declTerms, file, j, len, line, lines, match, places, posStr, positions, ref1, ref2;
      candidates = aststring.split('\n\n');
      places = [];
      for (j = 0, len = candidates.length; j < len; j++) {
        candidate = candidates[j];
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
          ref1 = declRangeStr.slice(1, -1).split(':'), file = ref1[0], line = ref1[1], col = ref1[2];
          positions = posStr.match(/(line|col):([0-9]+)(?::([0-9]+))?/);
          if (positions) {
            if (positions[1] === 'line') {
              ref2 = [positions[2], positions[3]], line = ref2[0], col = ref2[1];
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
        alert("Emiting precompiled header has successfully finished");
        return;
      }
      return alert(("Emiting precompiled header exit with " + code + "\n") + "See console for detailed error message");
    },
    deactivate: function() {
      this.deactivationDisposables.dispose();
      return console.log("autocomplete-clang deactivated");
    },
    provide: function() {
      if (ClangProvider == null) {
        ClangProvider = require('./clang-provider');
      }
      return new ClangProvider();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL2F1dG9jb21wbGV0ZS1jbGFuZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWtFLE9BQUEsQ0FBUSxNQUFSLENBQWxFLEVBQUMsNkNBQUQsRUFBcUIsMkJBQXJCLEVBQWdDLHFDQUFoQyxFQUFnRCx5QkFBaEQsRUFBMEQ7O0VBQzFELElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFTLE9BQUEsQ0FBUSxlQUFSOztFQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixhQUFjLE9BQUEsQ0FBUSxJQUFSOztFQUNmLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUjs7RUFFYixrQkFBQSxHQUFxQixPQUFBLENBQVEsK0JBQVI7O0VBRXJCLGFBQUEsR0FBZ0I7O0VBQ2hCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxzQkFBUjs7RUFFckIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQURUO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxHQUFELENBRFQ7UUFFQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO09BSkY7TUFRQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FEVDtPQVRGO01BV0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BWkY7TUFjQSxvQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47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QXhCOztVQUNBLE9BQWtCLFlBQWEsYUFBTSxDQUFDLEtBQXBCLENBQTBCLEdBQTFCLENBQWxCLEVBQUMsY0FBRCxFQUFNLGNBQU4sRUFBVztVQUNYLFNBQUEsR0FBWSxNQUFNLENBQUMsS0FBUCxDQUFhLG1DQUFiO1VBQ1osSUFBRyxTQUFIO1lBQ0UsSUFBRyxTQUFVLENBQUEsQ0FBQSxDQUFWLEtBQWdCLE1BQW5CO2NBQ0UsT0FBYSxDQUFDLFNBQVUsQ0FBQSxDQUFBLENBQVgsRUFBZSxTQUFVLENBQUEsQ0FBQSxDQUF6QixDQUFiLEVBQUMsY0FBRCxFQUFNLGNBRFI7YUFBQSxNQUFBO2NBR0UsR0FBQSxHQUFNLFNBQVUsQ0FBQSxDQUFBLEVBSGxCO2FBREY7O1VBS0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLElBQUQsRUFBTyxNQUFBLENBQU8sSUFBUCxDQUFQLEVBQXFCLE1BQUEsQ0FBTyxHQUFQLENBQXJCLENBQVosRUFiRjs7QUFGRjtBQWdCQSxhQUFPO0lBbkJLLENBdEtkO0lBMkxBLG1CQUFBLEVBQXFCLFNBQUMsSUFBRDtNQUNuQixJQUFBLENBQU8sSUFBUDtRQUNFLEtBQUEsQ0FBTSxzREFBTjtBQUNBLGVBRkY7O2FBR0EsS0FBQSxDQUFNLENBQUEsdUNBQUEsR0FBd0MsSUFBeEMsR0FBNkMsSUFBN0MsQ0FBQSxHQUNKLHdDQURGO0lBSm1CLENBM0xyQjtJQWtNQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFBO2FBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQ0FBWjtJQUZVLENBbE1aO0lBc01BLE9BQUEsRUFBUyxTQUFBOztRQUNQLGdCQUFpQixPQUFBLENBQVEsa0JBQVI7O2FBQ2IsSUFBQSxhQUFBLENBQUE7SUFGRyxDQXRNVDs7QUFiRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLERpc3Bvc2FibGUsQnVmZmVyZWRQcm9jZXNzLFNlbGVjdGlvbixGaWxlfSA9IHJlcXVpcmUgJ2F0b20nXG51dGlsID0gcmVxdWlyZSAnLi91dGlsJ1xue3NwYXdufSA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntleGlzdHNTeW5jfSA9IHJlcXVpcmUgJ2ZzJ1xuQ2xhbmdGbGFncyA9IHJlcXVpcmUgJ2NsYW5nLWZsYWdzJ1xuXG5Mb2NhdGlvblNlbGVjdExpc3QgPSByZXF1aXJlICcuL2xvY2F0aW9uLXNlbGVjdC12aWV3LmNvZmZlZSdcblxuQ2xhbmdQcm92aWRlciA9IG51bGxcbmRlZmF1bHRQcmVjb21waWxlZCA9IHJlcXVpcmUgJy4vZGVmYXVsdFByZWNvbXBpbGVkJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBjbGFuZ0NvbW1hbmQ6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2NsYW5nJ1xuICAgIGluY2x1ZGVQYXRoczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnLiddXG4gICAgICBpdGVtczpcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICBwY2hGaWxlUHJlZml4OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcuc3RkYWZ4J1xuICAgIGlnbm9yZUNsYW5nRXJyb3JzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgaW5jbHVkZURvY3VtZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBpbmNsdWRlU3lzdGVtSGVhZGVyc0RvY3VtZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCIqKldBUk5JTkcqKjogaWYgdGhlcmUgYXJlIGFueSBQQ0hzIGNvbXBpbGVkIHdpdGhvdXQgdGhpcyBvcHRpb24sIHlvdSB3aWxsIGhhdmUgdG8gZGVsZXRlIHRoZW0gYW5kIGdlbmVyYXRlIHRoZW0gYWdhaW5cIlxuICAgIGluY2x1ZGVOb25Eb3h5Z2VuQ29tbWVudHNBc0RvY3VtZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgXCJzdGQgYysrXCI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJjKysxMVwiXG4gICAgXCJzdGQgY1wiOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiYzk5XCJcbiAgICBcInByZUNvbXBpbGVkSGVhZGVycyBjKytcIjpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRQcmVjb21waWxlZC5jcHBcbiAgICAgIGl0ZW06XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgXCJwcmVDb21waWxlZEhlYWRlcnMgY1wiOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLmNcbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIFwicHJlQ29tcGlsZWRIZWFkZXJzIG9iamVjdGl2ZS1jXCI6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0UHJlY29tcGlsZWQub2JqY1xuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgXCJwcmVDb21waWxlZEhlYWRlcnMgb2JqZWN0aXZlLWMrK1wiOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLm9iamNwcFxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG5cbiAgZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXM6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnYXV0b2NvbXBsZXRlLWNsYW5nOmVtaXQtcGNoJzogPT5cbiAgICAgICAgQGVtaXRQY2ggYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnYXV0b2NvbXBsZXRlLWNsYW5nOmdvLWRlY2xhcmF0aW9uJzogKGUpPT4gQGdvRGVjbGFyYXRpb24gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLGVcblxuICBnb0RlY2xhcmF0aW9uOiAoZWRpdG9yLGUpLT5cbiAgICBsYW5nID0gdXRpbC5nZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZyBlZGl0b3JcbiAgICB1bmxlc3MgbGFuZ1xuICAgICAgZS5hYm9ydEtleUJpbmRpbmcoKVxuICAgICAgcmV0dXJuXG4gICAgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5jbGFuZ0NvbW1hbmRcIlxuICAgIGVkaXRvci5zZWxlY3RXb3Jkc0NvbnRhaW5pbmdDdXJzb3JzKCk7XG4gICAgdGVybSA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgIGFyZ3MgPSBAYnVpbGRHb0RlY2xhcmF0aW9uQ29tbWFuZEFyZ3MoZWRpdG9yLGxhbmcsdGVybSlcbiAgICBvcHRpb25zID1cbiAgICAgIGN3ZDogcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBpbnB1dDogZWRpdG9yLmdldFRleHQoKVxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgYWxsT3V0cHV0ID0gW11cbiAgICAgIHN0ZG91dCA9IChvdXRwdXQpID0+IGFsbE91dHB1dC5wdXNoKG91dHB1dClcbiAgICAgIHN0ZGVyciA9IChvdXRwdXQpID0+IGNvbnNvbGUubG9nIG91dHB1dFxuICAgICAgZXhpdCA9IChjb2RlKSA9PlxuICAgICAgICByZXNvbHZlKEBoYW5kbGVHb0RlY2xhcmF0aW9uUmVzdWx0KGVkaXRvciwge291dHB1dDphbGxPdXRwdXQuam9pbihcIlxcblwiKSx0ZXJtOnRlcm19LCBjb2RlKSlcbiAgICAgIGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIG9wdGlvbnMsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLnNldEVuY29kaW5nID0gJ3V0Zi04JztcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKGVkaXRvci5nZXRUZXh0KCkpXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuXG4gIGVtaXRQY2g6IChlZGl0b3IpLT5cbiAgICBsYW5nID0gdXRpbC5nZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZyBlZGl0b3JcbiAgICB1bmxlc3MgbGFuZ1xuICAgICAgYWxlcnQgXCJhdXRvY29tcGxldGUtY2xhbmc6ZW1pdC1wY2hcXG5FcnJvcjogSW5jb21wYXRpYmxlIExhbmd1YWdlXCJcbiAgICAgIHJldHVyblxuICAgIGNsYW5nX2NvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuY2xhbmdDb21tYW5kXCJcbiAgICBhcmdzID0gQGJ1aWxkRW1pdFBjaENvbW1hbmRBcmdzIGVkaXRvcixsYW5nXG4gICAgZW1pdF9wcm9jZXNzID0gc3Bhd24gY2xhbmdfY29tbWFuZCxhcmdzXG4gICAgZW1pdF9wcm9jZXNzLm9uIFwiZXhpdFwiLCAoY29kZSkgPT4gQGhhbmRsZUVtaXRQY2hSZXN1bHQgY29kZVxuICAgIGVtaXRfcHJvY2Vzcy5zdGRvdXQub24gJ2RhdGEnLCAoZGF0YSktPiBjb25zb2xlLmxvZyBcIm91dDpcXG5cIitkYXRhLnRvU3RyaW5nKClcbiAgICBlbWl0X3Byb2Nlc3Muc3RkZXJyLm9uICdkYXRhJywgKGRhdGEpLT4gY29uc29sZS5sb2cgXCJlcnI6XFxuXCIrZGF0YS50b1N0cmluZygpXG4gICAgaGVhZGVycyA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5wcmVDb21waWxlZEhlYWRlcnMgI3tsYW5nfVwiXG4gICAgaGVhZGVyc0lucHV0ID0gKFwiI2luY2x1ZGUgPCN7aH0+XCIgZm9yIGggaW4gaGVhZGVycykuam9pbiBcIlxcblwiXG4gICAgZW1pdF9wcm9jZXNzLnN0ZGluLndyaXRlIGhlYWRlcnNJbnB1dFxuICAgIGVtaXRfcHJvY2Vzcy5zdGRpbi5lbmQoKVxuXG4gIGJ1aWxkR29EZWNsYXJhdGlvbkNvbW1hbmRBcmdzOiAoZWRpdG9yLGxhbmd1YWdlLHRlcm0pLT5cbiAgICBzdGQgPSBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuc3RkICN7bGFuZ3VhZ2V9XCJcbiAgICBjdXJyZW50RGlyID0gcGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpXG4gICAgcGNoRmlsZVByZWZpeCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5wY2hGaWxlUHJlZml4XCJcbiAgICBwY2hGaWxlID0gW3BjaEZpbGVQcmVmaXgsIGxhbmd1YWdlLCBcInBjaFwiXS5qb2luICcuJ1xuICAgIHBjaFBhdGggPSBwYXRoLmpvaW4oY3VycmVudERpciwgcGNoRmlsZSlcblxuICAgIGFyZ3MgPSBbXCItZnN5bnRheC1vbmx5XCJdXG4gICAgYXJncy5wdXNoIFwiLXgje2xhbmd1YWdlfVwiXG4gICAgYXJncy5wdXNoIFwiLXN0ZD0je3N0ZH1cIiBpZiBzdGRcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWFzdC1kdW1wXCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWFzdC1kdW1wLWZpbHRlclwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIiN7dGVybX1cIlxuICAgIGFyZ3MucHVzaChcIi1pbmNsdWRlLXBjaFwiLCBwY2hQYXRoKSBpZiBleGlzdHNTeW5jKHBjaFBhdGgpXG4gICAgYXJncy5wdXNoIFwiLUkje2l9XCIgZm9yIGkgaW4gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVQYXRoc1wiXG4gICAgYXJncy5wdXNoIFwiLUkje2N1cnJlbnREaXJ9XCJcblxuICAgIHRyeVxuICAgICAgY2xhbmdmbGFncyA9IENsYW5nRmxhZ3MuZ2V0Q2xhbmdGbGFncyhlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0IGNsYW5nZmxhZ3MgaWYgY2xhbmdmbGFnc1xuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25zb2xlLmxvZyBlcnJvclxuXG4gICAgYXJncy5wdXNoIFwiLVwiXG4gICAgYXJnc1xuXG4gIGJ1aWxkRW1pdFBjaENvbW1hbmRBcmdzOiAoZWRpdG9yLGxhbmcpLT5cbiAgICBkaXIgPSBwYXRoLmRpcm5hbWUgZWRpdG9yLmdldFBhdGgoKVxuICAgIHBjaF9maWxlX3ByZWZpeCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5wY2hGaWxlUHJlZml4XCJcbiAgICBmaWxlID0gW3BjaF9maWxlX3ByZWZpeCwgbGFuZywgXCJwY2hcIl0uam9pbiAnLidcbiAgICBwY2ggPSBwYXRoLmpvaW4gZGlyLGZpbGVcbiAgICBzdGQgPSBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuc3RkICN7bGFuZ31cIlxuICAgIGFyZ3MgPSBbXCIteCN7bGFuZ30taGVhZGVyXCIsIFwiLVhjbGFuZ1wiLCAnLWVtaXQtcGNoJywgJy1vJywgcGNoXVxuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCBbXCItc3RkPSN7c3RkfVwiXSBpZiBzdGRcbiAgICBpbmNsdWRlX3BhdGhzID0gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVQYXRoc1wiXG4gICAgYXJncyA9IGFyZ3MuY29uY2F0IChcIi1JI3tpfVwiIGZvciBpIGluIGluY2x1ZGVfcGF0aHMpXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZURvY3VtZW50YXRpb25cIlxuICAgICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1jb2RlLWNvbXBsZXRpb24tYnJpZWYtY29tbWVudHNcIlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVOb25Eb3h5Z2VuQ29tbWVudHNBc0RvY3VtZW50YXRpb25cIlxuICAgICAgICBhcmdzLnB1c2ggXCItZnBhcnNlLWFsbC1jb21tZW50c1wiXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZVN5c3RlbUhlYWRlcnNEb2N1bWVudGF0aW9uXCJcbiAgICAgICAgYXJncy5wdXNoIFwiLWZyZXRhaW4tY29tbWVudHMtZnJvbS1zeXN0ZW0taGVhZGVyc1wiXG5cbiAgICBhcmdzID0gYXJncy5jb25jYXQgW1wiLVwiXVxuICAgIHJldHVybiBhcmdzXG5cbiAgaGFuZGxlR29EZWNsYXJhdGlvblJlc3VsdDogKGVkaXRvciwgcmVzdWx0LCByZXR1cm5Db2RlKS0+XG4gICAgaWYgcmV0dXJuQ29kZSBpcyBub3QgMFxuICAgICAgcmV0dXJuIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaWdub3JlQ2xhbmdFcnJvcnNcIlxuICAgIHBsYWNlcyA9IEBwYXJzZUFzdER1bXAgcmVzdWx0WydvdXRwdXQnXSwgcmVzdWx0Wyd0ZXJtJ11cbiAgICBpZiBwbGFjZXMubGVuZ3RoIGlzIDFcbiAgICAgICAgQGdvVG9Mb2NhdGlvbiBlZGl0b3IsIHBsYWNlcy5wb3AoKVxuICAgIGVsc2UgaWYgcGxhY2VzLmxlbmd0aCA+IDFcbiAgICAgICAgbGlzdCA9IG5ldyBMb2NhdGlvblNlbGVjdExpc3QoZWRpdG9yLCBAZ29Ub0xvY2F0aW9uKVxuICAgICAgICBsaXN0LnNldEl0ZW1zKHBsYWNlcylcblxuICBnb1RvTG9jYXRpb246IChlZGl0b3IsIFtmaWxlLGxpbmUsY29sXSkgLT5cbiAgICBpZiBmaWxlIGlzICc8c3RkaW4+J1xuICAgICAgcmV0dXJuIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbbGluZS0xLGNvbC0xXVxuICAgIGZpbGUgPSBwYXRoLmpvaW4gZWRpdG9yLmdldERpcmVjdG9yeVBhdGgoKSwgZmlsZSBpZiBmaWxlLnN0YXJ0c1dpdGgoXCIuXCIpXG4gICAgZiA9IG5ldyBGaWxlIGZpbGVcbiAgICBmLmV4aXN0cygpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZSwge2luaXRpYWxMaW5lOmxpbmUtMSwgaW5pdGlhbENvbHVtbjpjb2wtMX0gaWYgcmVzdWx0XG5cbiAgcGFyc2VBc3REdW1wOiAoYXN0c3RyaW5nLCB0ZXJtKS0+XG4gICAgY2FuZGlkYXRlcyA9IGFzdHN0cmluZy5zcGxpdCAnXFxuXFxuJ1xuICAgIHBsYWNlcyA9IFtdXG4gICAgZm9yIGNhbmRpZGF0ZSBpbiBjYW5kaWRhdGVzXG4gICAgICBtYXRjaCA9IGNhbmRpZGF0ZS5tYXRjaCAvLy9eRHVtcGluZ1xccyg/OltBLVphLXpfXSo6OikqPyN7dGVybX06Ly8vXG4gICAgICBpZiBtYXRjaCBpc250IG51bGxcbiAgICAgICAgbGluZXMgPSBjYW5kaWRhdGUuc3BsaXQgJ1xcbidcbiAgICAgICAgY29udGludWUgaWYgbGluZXMubGVuZ3RoIDwgMlxuICAgICAgICBkZWNsVGVybXMgPSBsaW5lc1sxXS5zcGxpdCAnICdcbiAgICAgICAgW18sXyxkZWNsUmFuZ2VTdHIsXyxwb3NTdHIsLi4uXSA9IGRlY2xUZXJtc1xuICAgICAgICBbXyxfLF8sXyxkZWNsUmFuZ2VTdHIsXyxwb3NTdHIsLi4uXSA9IGRlY2xUZXJtcyBpZiBkZWNsUmFuZ2VTdHIgaXMgXCJwcmV2XCJcbiAgICAgICAgW2ZpbGUsbGluZSxjb2xdID0gZGVjbFJhbmdlU3RyWzEuLi0yXS5zcGxpdCAnOidcbiAgICAgICAgcG9zaXRpb25zID0gcG9zU3RyLm1hdGNoIC8obGluZXxjb2wpOihbMC05XSspKD86OihbMC05XSspKT8vXG4gICAgICAgIGlmIHBvc2l0aW9uc1xuICAgICAgICAgIGlmIHBvc2l0aW9uc1sxXSBpcyAnbGluZSdcbiAgICAgICAgICAgIFtsaW5lLGNvbF0gPSBbcG9zaXRpb25zWzJdLCBwb3NpdGlvbnNbM11dXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sID0gcG9zaXRpb25zWzJdXG4gICAgICAgIHBsYWNlcy5wdXNoIFtmaWxlLChOdW1iZXIgbGluZSksKE51bWJlciBjb2wpXVxuICAgIHJldHVybiBwbGFjZXNcblxuICBoYW5kbGVFbWl0UGNoUmVzdWx0OiAoY29kZSktPlxuICAgIHVubGVzcyBjb2RlXG4gICAgICBhbGVydCBcIkVtaXRpbmcgcHJlY29tcGlsZWQgaGVhZGVyIGhhcyBzdWNjZXNzZnVsbHkgZmluaXNoZWRcIlxuICAgICAgcmV0dXJuXG4gICAgYWxlcnQgXCJFbWl0aW5nIHByZWNvbXBpbGVkIGhlYWRlciBleGl0IHdpdGggI3tjb2RlfVxcblwiK1xuICAgICAgXCJTZWUgY29uc29sZSBmb3IgZGV0YWlsZWQgZXJyb3IgbWVzc2FnZVwiXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgY29uc29sZS5sb2cgXCJhdXRvY29tcGxldGUtY2xhbmcgZGVhY3RpdmF0ZWRcIlxuXG4gIHByb3ZpZGU6IC0+XG4gICAgQ2xhbmdQcm92aWRlciA/PSByZXF1aXJlKCcuL2NsYW5nLXByb3ZpZGVyJylcbiAgICBuZXcgQ2xhbmdQcm92aWRlcigpXG4iXX0=
