(function() {
  var ClangProvider, CompositeDisposable, Range, buildCodeCompletionArgs, getSourceScopeLang, makeBufferedClangProcess, nearestSymbolPosition, path, prefixAtPosition, ref, ref1, ref2;

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  ref1 = require('./clang-args-builder'), makeBufferedClangProcess = ref1.makeBufferedClangProcess, buildCodeCompletionArgs = ref1.buildCodeCompletionArgs;

  ref2 = require('./util'), getSourceScopeLang = ref2.getSourceScopeLang, prefixAtPosition = ref2.prefixAtPosition, nearestSymbolPosition = ref2.nearestSymbolPosition;

  module.exports = ClangProvider = (function() {
    function ClangProvider() {}

    ClangProvider.prototype.selector = '.source.cpp, .source.c, .source.objc, .source.objcpp';

    ClangProvider.prototype.inclusionPriority = 1;

    ClangProvider.prototype.getSuggestions = function(arg1) {
      var bufferPosition, editor, language, lastSymbol, line, minimumWordLength, prefix, ref3, regex, scopeDescriptor, symbolPosition;
      editor = arg1.editor, scopeDescriptor = arg1.scopeDescriptor, bufferPosition = arg1.bufferPosition;
      language = getSourceScopeLang(scopeDescriptor.getScopesArray());
      prefix = prefixAtPosition(editor, bufferPosition);
      ref3 = nearestSymbolPosition(editor, bufferPosition), symbolPosition = ref3[0], lastSymbol = ref3[1];
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
      var args, callback;
      args = buildCodeCompletionArgs(editor, row, column, language);
      callback = (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log(errors);
          return resolve(_this.handleCompletionResult(outputs, code, prefix));
        };
      })(this);
      return makeBufferedClangProcess(editor, args, callback, editor.getText());
    };

    ClangProvider.prototype.convertCompletionLine = function(line, prefix) {
      var argumentsRe, basicInfo, basicInfoRe, comment, commentRe, completion, completionAndComment, constMemFuncRe, content, contentRe, index, infoTagsRe, isConstMemFunc, match, optionalArgumentsStart, ref3, ref4, ref5, returnType, returnTypeRe, suggestion;
      contentRe = /^COMPLETION: (.*)/;
      ref3 = line.match(contentRe), line = ref3[0], content = ref3[1];
      basicInfoRe = /^(.*?) : (.*)/;
      match = content.match(basicInfoRe);
      if (match == null) {
        return {
          text: content
        };
      }
      content = match[0], basicInfo = match[1], completionAndComment = match[2];
      commentRe = /(?: : (.*))?$/;
      ref4 = completionAndComment.split(commentRe), completion = ref4[0], comment = ref4[1];
      returnTypeRe = /^\[#(.*?)#\]/;
      returnType = (ref5 = completion.match(returnTypeRe)) != null ? ref5[1] : void 0;
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
          var i, len, results;
          results = [];
          for (i = 0, len = outputLines.length; i < len; i++) {
            line = outputLines[i];
            results.push(this.convertCompletionLine(line, prefix));
          }
          return results;
        }).call(this);
      } else {
        return [];
      }
    };

    return ClangProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL2NsYW5nLXByb3ZpZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtBQUFBLE1BQUE7O0VBQUEsTUFBK0IsT0FBQSxDQUFRLE1BQVIsQ0FBL0IsRUFBQyxpQkFBRCxFQUFROztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxPQUFzRCxPQUFBLENBQVEsc0JBQVIsQ0FBdEQsRUFBQyx3REFBRCxFQUEyQjs7RUFDM0IsT0FBZ0UsT0FBQSxDQUFRLFFBQVIsQ0FBaEUsRUFBQyw0Q0FBRCxFQUFxQix3Q0FBckIsRUFBdUM7O0VBRXZDLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs0QkFDSixRQUFBLEdBQVU7OzRCQUNWLGlCQUFBLEdBQW1COzs0QkFFbkIsY0FBQSxHQUFnQixTQUFDLElBQUQ7QUFDZCxVQUFBO01BRGdCLHNCQUFRLHdDQUFpQjtNQUN6QyxRQUFBLEdBQVcsa0JBQUEsQ0FBbUIsZUFBZSxDQUFDLGNBQWhCLENBQUEsQ0FBbkI7TUFDWCxNQUFBLEdBQVMsZ0JBQUEsQ0FBaUIsTUFBakIsRUFBeUIsY0FBekI7TUFDVCxPQUE4QixxQkFBQSxDQUFzQixNQUF0QixFQUE4QixjQUE5QixDQUE5QixFQUFDLHdCQUFELEVBQWdCO01BQ2hCLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEI7TUFFcEIsSUFBRywyQkFBQSxJQUF1QixNQUFNLENBQUMsTUFBUCxHQUFnQixpQkFBMUM7UUFDRSxLQUFBLEdBQVE7UUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO1FBQ1AsSUFBQSxDQUFjLEtBQUssQ0FBQyxJQUFOLENBQVcs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RHhDOztNQUVBLElBQW9DLGVBQXBDO1FBQUEsVUFBVSxDQUFDLFdBQVgsR0FBeUIsUUFBekI7O01BQ0EsVUFBVSxDQUFDLGlCQUFYLEdBQStCO2FBQy9CO0lBdENxQjs7NEJBd0N2QixzQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE1BQXJCO0FBQ3RCLFVBQUE7TUFBQSxJQUFHLFVBQUEsS0FBYyxDQUFJLENBQXJCO1FBQ0UsSUFBQSxDQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsQ0FBZDtBQUFBLGlCQUFBO1NBREY7O01BSUEsYUFBQSxHQUFvQixJQUFBLE1BQUEsQ0FBTyxnQkFBQSxHQUFtQixNQUFuQixHQUE0QixNQUFuQyxFQUEyQyxJQUEzQztNQUNwQixXQUFBLEdBQWMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxhQUFiO01BRWQsSUFBRyxtQkFBSDtBQUNFOztBQUFRO2VBQUEsNkNBQUE7O3lCQUFBLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixJQUF2QixFQUE2QixNQUE3QjtBQUFBOztzQkFEVjtPQUFBLE1BQUE7QUFHRSxlQUFPLEdBSFQ7O0lBUnNCOzs7OztBQXZFMUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyIGNvZGUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYmVub2dsZS9hdXRvY29tcGxldGUtY2xhbmdcbiMgQ29weXJpZ2h0IChjKSAyMDE1IEJlbiBPZ2xlIHVuZGVyIE1JVCBsaWNlbnNlXG4jIENsYW5nIHJlbGF0ZWQgY29kZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS95YXN1eXVreS9hdXRvY29tcGxldGUtY2xhbmdcblxue1JhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnttYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3MsIGJ1aWxkQ29kZUNvbXBsZXRpb25BcmdzfSA9IHJlcXVpcmUgJy4vY2xhbmctYXJncy1idWlsZGVyJ1xue2dldFNvdXJjZVNjb3BlTGFuZywgcHJlZml4QXRQb3NpdGlvbiwgbmVhcmVzdFN5bWJvbFBvc2l0aW9ufSA9IHJlcXVpcmUgJy4vdXRpbCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ2xhbmdQcm92aWRlclxuICBzZWxlY3RvcjogJy5zb3VyY2UuY3BwLCAuc291cmNlLmMsIC5zb3VyY2Uub2JqYywgLnNvdXJjZS5vYmpjcHAnXG4gIGluY2x1c2lvblByaW9yaXR5OiAxXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBzY29wZURlc2NyaXB0b3IsIGJ1ZmZlclBvc2l0aW9ufSkgLT5cbiAgICBsYW5ndWFnZSA9IGdldFNvdXJjZVNjb3BlTGFuZyBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHByZWZpeCA9IHByZWZpeEF0UG9zaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICBbc3ltYm9sUG9zaXRpb24sbGFzdFN5bWJvbF0gPSBuZWFyZXN0U3ltYm9sUG9zaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICBtaW5pbXVtV29yZExlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMubWluaW11bVdvcmRMZW5ndGgnKVxuXG4gICAgaWYgbWluaW11bVdvcmRMZW5ndGg/IGFuZCBwcmVmaXgubGVuZ3RoIDwgbWluaW11bVdvcmRMZW5ndGhcbiAgICAgIHJlZ2V4ID0gLyg/OlxcLnwtPnw6OilcXHMqXFx3KiQvXG4gICAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgICAgcmV0dXJuIHVubGVzcyByZWdleC50ZXN0KGxpbmUpXG5cbiAgICBpZiBsYW5ndWFnZT9cbiAgICAgIEBjb2RlQ29tcGxldGlvbkF0KGVkaXRvciwgc3ltYm9sUG9zaXRpb24ucm93LCBzeW1ib2xQb3NpdGlvbi5jb2x1bW4sIGxhbmd1YWdlLCBwcmVmaXgpXG5cbiAgY29kZUNvbXBsZXRpb25BdDogKGVkaXRvciwgcm93LCBjb2x1bW4sIGxhbmd1YWdlLCBwcmVmaXgpIC0+XG4gICAgYXJncyA9IGJ1aWxkQ29kZUNvbXBsZXRpb25BcmdzIGVkaXRvciwgcm93LCBjb2x1bW4sIGxhbmd1YWdlXG4gICAgY2FsbGJhY2sgPSAoY29kZSwgb3V0cHV0cywgZXJyb3JzLCByZXNvbHZlKSA9PlxuICAgICAgY29uc29sZS5sb2cgZXJyb3JzXG4gICAgICByZXNvbHZlKEBoYW5kbGVDb21wbGV0aW9uUmVzdWx0KG91dHB1dHMsIGNvZGUsIHByZWZpeCkpXG4gICAgbWFrZUJ1ZmZlcmVkQ2xhbmdQcm9jZXNzIGVkaXRvciwgYXJncywgY2FsbGJhY2ssIGVkaXRvci5nZXRUZXh0KClcblxuICBjb252ZXJ0Q29tcGxldGlvbkxpbmU6IChsaW5lLCBwcmVmaXgpIC0+XG4gICAgY29udGVudFJlID0gL15DT01QTEVUSU9OOiAoLiopL1xuICAgIFtsaW5lLCBjb250ZW50XSA9IGxpbmUubWF0Y2ggY29udGVudFJlXG4gICAgYmFzaWNJbmZvUmUgPSAvXiguKj8pIDogKC4qKS9cbiAgICBtYXRjaCA9IGNvbnRlbnQubWF0Y2ggYmFzaWNJbmZvUmVcbiAgICByZXR1cm4ge3RleHQ6IGNvbnRlbnR9IHVubGVzcyBtYXRjaD9cblxuICAgIFtjb250ZW50LCBiYXNpY0luZm8sIGNvbXBsZXRpb25BbmRDb21tZW50XSA9IG1hdGNoXG4gICAgY29tbWVudFJlID0gLyg/OiA6ICguKikpPyQvXG4gICAgW2NvbXBsZXRpb24sIGNvbW1lbnRdID0gY29tcGxldGlvbkFuZENvbW1lbnQuc3BsaXQgY29tbWVudFJlXG4gICAgcmV0dXJuVHlwZVJlID0gL15cXFsjKC4qPykjXFxdL1xuICAgIHJldHVyblR5cGUgPSBjb21wbGV0aW9uLm1hdGNoKHJldHVyblR5cGVSZSk/WzFdXG4gICAgY29uc3RNZW1GdW5jUmUgPSAvXFxbIyBjb25zdCNcXF0kL1xuICAgIGlzQ29uc3RNZW1GdW5jID0gY29uc3RNZW1GdW5jUmUudGVzdCBjb21wbGV0aW9uXG4gICAgaW5mb1RhZ3NSZSA9IC9cXFsjKC4qPykjXFxdL2dcbiAgICBjb21wbGV0aW9uID0gY29tcGxldGlvbi5yZXBsYWNlIGluZm9UYWdzUmUsICcnXG4gICAgYXJndW1lbnRzUmUgPSAvPCMoLio/KSM+L2dcbiAgICBvcHRpb25hbEFyZ3VtZW50c1N0YXJ0ID0gY29tcGxldGlvbi5pbmRleE9mICd7IydcbiAgICBjb21wbGV0aW9uID0gY29tcGxldGlvbi5yZXBsYWNlIC9cXHsjL2csICcnXG4gICAgY29tcGxldGlvbiA9IGNvbXBsZXRpb24ucmVwbGFjZSAvI1xcfS9nLCAnJ1xuICAgIGluZGV4ID0gMFxuICAgIGNvbXBsZXRpb24gPSBjb21wbGV0aW9uLnJlcGxhY2UgYXJndW1lbnRzUmUsIChtYXRjaCwgYXJnLCBvZmZzZXQpIC0+XG4gICAgICBpbmRleCsrXG4gICAgICBpZiBvcHRpb25hbEFyZ3VtZW50c1N0YXJ0ID4gMCBhbmQgb2Zmc2V0ID4gb3B0aW9uYWxBcmd1bWVudHNTdGFydFxuICAgICAgICByZXR1cm4gXCIkeyN7aW5kZXh9Om9wdGlvbmFsICN7YXJnfX1cIlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCIkeyN7aW5kZXh9OiN7YXJnfX1cIlxuXG4gICAgc3VnZ2VzdGlvbiA9IHt9XG4gICAgc3VnZ2VzdGlvbi5sZWZ0TGFiZWwgPSByZXR1cm5UeXBlIGlmIHJldHVyblR5cGU/XG4gICAgaWYgaW5kZXggPiAwXG4gICAgICBzdWdnZXN0aW9uLnNuaXBwZXQgPSBjb21wbGV0aW9uXG4gICAgZWxzZVxuICAgICAgc3VnZ2VzdGlvbi50ZXh0ID0gY29tcGxldGlvblxuICAgIGlmIGlzQ29uc3RNZW1GdW5jXG4gICAgICBzdWdnZXN0aW9uLmRpc3BsYXlUZXh0ID0gY29tcGxldGlvbiArICcgY29uc3QnXG4gICAgc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbiA9IGNvbW1lbnQgaWYgY29tbWVudD9cbiAgICBzdWdnZXN0aW9uLnJlcGxhY2VtZW50UHJlZml4ID0gcHJlZml4XG4gICAgc3VnZ2VzdGlvblxuXG4gIGhhbmRsZUNvbXBsZXRpb25SZXN1bHQ6IChyZXN1bHQsIHJldHVybkNvZGUsIHByZWZpeCkgLT5cbiAgICBpZiByZXR1cm5Db2RlIGlzIG5vdCAwXG4gICAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5pZ25vcmVDbGFuZ0Vycm9yc1wiXG4gICAgIyBGaW5kIGFsbCBjb21wbGV0aW9ucyB0aGF0IG1hdGNoIG91ciBwcmVmaXggaW4gT05FIHJlZ2V4XG4gICAgIyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucy5cbiAgICBjb21wbGV0aW9uc1JlID0gbmV3IFJlZ0V4cChcIl5DT01QTEVUSU9OOiAoXCIgKyBwcmVmaXggKyBcIi4qKSRcIiwgXCJtZ1wiKVxuICAgIG91dHB1dExpbmVzID0gcmVzdWx0Lm1hdGNoKGNvbXBsZXRpb25zUmUpXG5cbiAgICBpZiBvdXRwdXRMaW5lcz9cbiAgICAgIHJldHVybiAoQGNvbnZlcnRDb21wbGV0aW9uTGluZShsaW5lLCBwcmVmaXgpIGZvciBsaW5lIGluIG91dHB1dExpbmVzKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBbXVxuIl19
