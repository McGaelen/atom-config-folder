(function() {
  var AsmViewer, TextEditor,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  TextEditor = require('atom').TextEditor;

  module.exports = AsmViewer = (function(superClass) {
    extend(AsmViewer, superClass);

    AsmViewer.prototype.lines = null;

    function AsmViewer(params) {
      var file, line;
      line = params.startline;
      file = params.fullname;
      AsmViewer.__super__.constructor.call(this, params);
      this.GDB = params.gdb;
      this.lines = {};
      this.setText((line + 1) + ":");
      this.GDB.disassembleData({
        file: {
          name: file,
          linenum: line + 1,
          lines: -1
        },
        mode: 1
      }, (function(_this) {
        return function(instructions) {
          var alignSpace, asm, i, j, k, l, len, len1, len2, len3, linenum, maxOffset, maxOffsetLength, ref, ref1, src, text;
          maxOffset = -1;
          for (i = 0, len = instructions.length; i < len; i++) {
            src = instructions[i];
            ref = src.line_asm_insn;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              asm = ref[j];
              if (Number(asm.offset) > maxOffset) {
                maxOffset = Number(asm.offset);
              }
            }
          }
          maxOffsetLength = maxOffset.toString().length;
          text = [];
          linenum = 0;
          for (k = 0, len2 = instructions.length; k < len2; k++) {
            src = instructions[k];
            text.push(src.line + ":");
            _this.lines[Number(src.line) - 1] = linenum;
            linenum += 1;
            ref1 = src.line_asm_insn;
            for (l = 0, len3 = ref1.length; l < len3; l++) {
              asm = ref1[l];
              if (!asm.offset) {
                asm.offset = '0';
              }
              alignSpace = '                '.slice(0, maxOffsetLength - asm.offset.length);
              text.push("    " + asm['func-name'] + "+" + alignSpace + asm.offset + ":    " + asm.inst);
              linenum += 1;
            }
          }
          _this.setText(text.join('\n'));
          return console.log(_this.lines);
        };
      })(this));
    }

    AsmViewer.prototype.fileLineToBufferLine = function(line) {
      if (!(line in this.lines)) {
        return Number(0);
      }
      return this.lines[line];
    };

    AsmViewer.prototype.bufferLineToFileLine = function(line) {
      var left, lines, mid, midLine, right;
      lines = Object.keys(this.lines);
      left = 0;
      right = lines.length - 1;
      while (left <= right) {
        mid = Math.floor((left + right) / 2);
        midLine = this.lines[lines[mid]];
        if (line < midLine) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
      return Number(lines[left - 1]);
    };

    AsmViewer.prototype.shouldPromptToSave = function(arg) {
      var windowCloseRequested;
      windowCloseRequested = (arg != null ? arg : {}).windowCloseRequested;
      return false;
    };

    return AsmViewer;

  })(TextEditor);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdG9tLWRlYnVnZ2VyL2xpYi9hc20tdmlld2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7O0VBQUMsYUFBYyxPQUFBLENBQVEsTUFBUjs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUNNOzs7d0JBQ0osS0FBQSxHQUFPOztJQUNNLG1CQUFDLE1BQUQ7QUFDWCxVQUFBO01BQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQztNQUNkLElBQUEsR0FBTyxNQUFNLENBQUM7TUFFZCwyQ0FBTSxNQUFOO01BRUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxNQUFNLENBQUM7TUFFZCxJQUFDLENBQUEsS0FBRCxHQUFTO01BQ1QsSUFBQyxDQUFBLE9BQUQsQ0FBVyxDQUFDLElBQUEsR0FBSyxDQUFOLENBQUEsR0FBUSxHQUFuQjtNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsZUFBTCxDQUFxQjtRQUFDLElBQUEsRUFBTTtVQUFDLElBQUEsRUFBTSxJQUFQO1VBQWEsT0FBQSxFQUFTLElBQUEsR0FBSyxDQUEzQjtVQUE4QixLQUFBLEVBQU8sQ0FBQyxDQUF0QztTQUFQO1FBQWlELElBQUEsRUFBTSxDQUF2RDtPQUFyQixFQUFnRixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsWUFBRDtBQUM5RSxjQUFBO1VBQUEsU0FBQSxHQUFZLENBQUM7QUFDYixlQUFBLDhDQUFBOztBQUNFO0FBQUEsaUJBQUEsdUNBQUE7O2NBQ0UsSUFBa0MsTUFBQSxDQUFPLEdBQUcsQ0FBQyxNQUFYLENBQUEsR0FBcUIsU0FBdkQ7Z0JBQUEsU0FBQSxHQUFZLE1BQUEsQ0FBTyxHQUFHLENBQUMsTUFBWCxFQUFaOztBQURGO0FBREY7VUFHQSxlQUFBLEdBQWtCLFNBQVMsQ0FBQyxRQUFWLENBQUEsQ0FBb0IsQ0FBQztVQUV2QyxJQUFBLEdBQU87VUFDUCxPQUFBLEdBQVU7QUFDVixlQUFBLGdEQUFBOztZQUNFLElBQUksQ0FBQyxJQUFMLENBQWEsR0FBRyxDQUFDLElBQUwsR0FBVSxHQUF0QjtZQUNBLEtBQUMsQ0FBQSxLQUFNLENBQUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxJQUFYLENBQUEsR0FBaUIsQ0FBakIsQ0FBUCxHQUE2QjtZQUM3QixPQUFBLElBQVc7QUFDWDtBQUFBLGlCQUFBLHdDQUFBOztjQUNFLElBQUEsQ0FBd0IsR0FBRyxDQUFDLE1BQTVCO2dCQUFBLEdBQUcsQ0FBQyxNQUFKLEdBQWEsSUFBYjs7Y0FDQSxVQUFBLEdBQWEsa0JBQWtCLENBQUMsS0FBbkIsQ0FBeUIsQ0FBekIsRUFBNEIsZUFBQSxHQUFnQixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQXZEO2NBQ2IsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFBLEdBQU8sR0FBSSxDQUFBLFdBQUEsQ0FBWCxHQUF3QixHQUF4QixHQUEyQixVQUEzQixHQUF3QyxHQUFHLENBQUMsTUFBNUMsR0FBbUQsT0FBbkQsR0FBMEQsR0FBRyxDQUFDLElBQXhFO2NBQ0EsT0FBQSxJQUFXO0FBSmI7QUFKRjtVQVVBLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQVQ7aUJBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFDLENBQUEsS0FBYjtRQXBCOEU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhGO0lBVlc7O3dCQWdDYixvQkFBQSxHQUFzQixTQUFDLElBQUQ7TUFDcEIsSUFBQSxDQUFBLENBQXdCLElBQUEsSUFBUSxJQUFDLENBQUEsS0FBakMsQ0FBQTtBQUFBLGVBQU8sTUFBQSxDQUFPLENBQVAsRUFBUDs7QUFDQSxhQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQTtJQUZNOzt3QkFJdEIsb0JBQUEsR0FBc0IsU0FBQyxJQUFEO0FBQ3BCLFVBQUE7TUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsS0FBYjtNQUNSLElBQUEsR0FBTztNQUNQLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixHQUFhO0FBQ3JCLGFBQU0sSUFBQSxJQUFRLEtBQWQ7UUFDRSxHQUFBLGNBQU0sQ0FBQyxJQUFBLEdBQUssS0FBTixJQUFnQjtRQUN0QixPQUFBLEdBQVUsSUFBQyxDQUFBLEtBQU0sQ0FBQSxLQUFNLENBQUEsR0FBQSxDQUFOO1FBQ2pCLElBQUcsSUFBQSxHQUFPLE9BQVY7VUFDRSxLQUFBLEdBQVEsR0FBQSxHQUFNLEVBRGhCO1NBQUEsTUFBQTtVQUdFLElBQUEsR0FBTyxHQUFBLEdBQU0sRUFIZjs7TUFIRjtBQU9BLGFBQU8sTUFBQSxDQUFPLEtBQU0sQ0FBQSxJQUFBLEdBQUssQ0FBTCxDQUFiO0lBWGE7O3dCQWF0QixrQkFBQSxHQUFvQixTQUFDLEdBQUQ7QUFDbEIsVUFBQTtNQURvQixzQ0FBRCxNQUF1QjtBQUMxQyxhQUFPO0lBRFc7Ozs7S0FuREU7QUFIeEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBBc21WaWV3ZXIgZXh0ZW5kcyBUZXh0RWRpdG9yXG4gIGxpbmVzOiBudWxsXG4gIGNvbnN0cnVjdG9yOiAocGFyYW1zKSAtPlxuICAgIGxpbmUgPSBwYXJhbXMuc3RhcnRsaW5lXG4gICAgZmlsZSA9IHBhcmFtcy5mdWxsbmFtZVxuXG4gICAgc3VwZXIgcGFyYW1zXG5cbiAgICBAR0RCID0gcGFyYW1zLmdkYlxuXG4gICAgQGxpbmVzID0ge31cbiAgICBAc2V0VGV4dChcIiN7bGluZSsxfTpcIilcbiAgICBAR0RCLmRpc2Fzc2VtYmxlRGF0YSB7ZmlsZToge25hbWU6IGZpbGUsIGxpbmVudW06IGxpbmUrMSwgbGluZXM6IC0xfSwgbW9kZTogMX0sIChpbnN0cnVjdGlvbnMpID0+XG4gICAgICBtYXhPZmZzZXQgPSAtMVxuICAgICAgZm9yIHNyYyBpbiBpbnN0cnVjdGlvbnNcbiAgICAgICAgZm9yIGFzbSBpbiBzcmMubGluZV9hc21faW5zblxuICAgICAgICAgIG1heE9mZnNldCA9IE51bWJlcihhc20ub2Zmc2V0KSBpZiBOdW1iZXIoYXNtLm9mZnNldCkgPiBtYXhPZmZzZXRcbiAgICAgIG1heE9mZnNldExlbmd0aCA9IG1heE9mZnNldC50b1N0cmluZygpLmxlbmd0aFxuXG4gICAgICB0ZXh0ID0gW11cbiAgICAgIGxpbmVudW0gPSAwXG4gICAgICBmb3Igc3JjIGluIGluc3RydWN0aW9uc1xuICAgICAgICB0ZXh0LnB1c2goXCIje3NyYy5saW5lfTpcIilcbiAgICAgICAgQGxpbmVzW051bWJlcihzcmMubGluZSktMV0gPSBsaW5lbnVtXG4gICAgICAgIGxpbmVudW0gKz0gMVxuICAgICAgICBmb3IgYXNtIGluIHNyYy5saW5lX2FzbV9pbnNuXG4gICAgICAgICAgYXNtLm9mZnNldCA9ICcwJyB1bmxlc3MgYXNtLm9mZnNldFxuICAgICAgICAgIGFsaWduU3BhY2UgPSAnICAgICAgICAgICAgICAgICcuc2xpY2UoMCwgbWF4T2Zmc2V0TGVuZ3RoLWFzbS5vZmZzZXQubGVuZ3RoKVxuICAgICAgICAgIHRleHQucHVzaChcIiAgICAje2FzbVsnZnVuYy1uYW1lJ119KyN7YWxpZ25TcGFjZX0je2FzbS5vZmZzZXR9OiAgICAje2FzbS5pbnN0fVwiKVxuICAgICAgICAgIGxpbmVudW0gKz0gMVxuXG4gICAgICBAc2V0VGV4dCh0ZXh0LmpvaW4oJ1xcbicpKVxuICAgICAgY29uc29sZS5sb2coQGxpbmVzKVxuXG4gIGZpbGVMaW5lVG9CdWZmZXJMaW5lOiAobGluZSkgLT5cbiAgICByZXR1cm4gTnVtYmVyKDApIHVubGVzcyBsaW5lIG9mIEBsaW5lc1xuICAgIHJldHVybiBAbGluZXNbbGluZV1cblxuICBidWZmZXJMaW5lVG9GaWxlTGluZTogKGxpbmUpIC0+XG4gICAgbGluZXMgPSBPYmplY3Qua2V5cyhAbGluZXMpXG4gICAgbGVmdCA9IDBcbiAgICByaWdodCA9IGxpbmVzLmxlbmd0aC0xXG4gICAgd2hpbGUgbGVmdCA8PSByaWdodFxuICAgICAgbWlkID0gKGxlZnQrcmlnaHQpIC8vIDJcbiAgICAgIG1pZExpbmUgPSBAbGluZXNbbGluZXNbbWlkXV1cbiAgICAgIGlmIGxpbmUgPCBtaWRMaW5lXG4gICAgICAgIHJpZ2h0ID0gbWlkIC0gMVxuICAgICAgZWxzZVxuICAgICAgICBsZWZ0ID0gbWlkICsgMVxuICAgIHJldHVybiBOdW1iZXIobGluZXNbbGVmdC0xXSlcblxuICBzaG91bGRQcm9tcHRUb1NhdmU6ICh7d2luZG93Q2xvc2VSZXF1ZXN0ZWR9PXt9KSAtPlxuICAgIHJldHVybiBmYWxzZVxuIl19
