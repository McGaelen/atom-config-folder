(function() {
  var AsmViewer, CompositeDisposable, DebuggerView, GDB, Point, Range, TextBuffer, TextEditor, View, fs, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Point = ref.Point, Range = ref.Range, TextEditor = ref.TextEditor, TextBuffer = ref.TextBuffer, CompositeDisposable = ref.CompositeDisposable;

  View = require('atom-space-pen-views').View;

  GDB = require('./backend/gdb/gdb');

  fs = require('fs');

  path = require('path');

  AsmViewer = require('./asm-viewer');

  module.exports = DebuggerView = (function(superClass) {
    extend(DebuggerView, superClass);

    function DebuggerView() {
      return DebuggerView.__super__.constructor.apply(this, arguments);
    }

    DebuggerView.content = function() {
      return this.div({
        "class": 'atom-debugger'
      }, (function(_this) {
        return function() {
          _this.header({
            "class": 'header'
          }, function() {
            _this.span({
              "class": 'header-item title'
            }, 'Atom Debugger');
            return _this.span({
              "class": 'header-item sub-title',
              outlet: 'targetLable'
            });
          });
          return _this.div({
            "class": 'btn-toolbar'
          }, function() {
            return _this.div({
              "class": 'btn-group'
            }, function() {
              _this.div({
                "class": 'btn',
                outlet: 'runButton'
              }, 'Run');
              _this.div({
                "class": 'btn disabled',
                outlet: 'continueButton'
              }, 'Continue');
              _this.div({
                "class": 'btn disabled',
                outlet: 'interruptButton'
              }, 'Interrupt');
              _this.div({
                "class": 'btn disabled',
                outlet: 'nextButton'
              }, 'Next');
              return _this.div({
                "class": 'btn disabled',
                outlet: 'stepButton'
              }, 'Step');
            });
          });
        };
      })(this));
    };

    DebuggerView.prototype.initialize = function(target, mainBreak) {
      var contextMenuCreated;
      this.GDB = new GDB(target);
      this.targetLable.text(target);
      this.GDB.set('target-async', 'on', function(result) {});
      this.GDB.setSourceDirectories(atom.project.getPaths(), function(done) {});
      this.breaks = {};
      this.stopped = {
        marker: null,
        fullpath: null,
        line: null
      };
      this.asms = {};
      this.cachedEditors = {};
      this.handleEvents();
      contextMenuCreated = (function(_this) {
        return function(event) {
          var component, editor, position;
          if (editor = _this.getActiveTextEditor()) {
            component = atom.views.getView(editor).component;
            position = component.screenPositionForMouseEvent(event);
            return _this.contextLine = editor.bufferPositionForScreenPosition(position).row;
          }
        };
      })(this);
      this.menu = atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Toggle Breakpoint',
            command: 'debugger:toggle-breakpoint',
            created: contextMenuCreated
          }
        ]
      });
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: true
      });
      if (mainBreak) {
        this.insertMainBreak();
      }
      return this.listExecFile();
    };

    DebuggerView.prototype.getActiveTextEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    DebuggerView.prototype.exists = function(fullpath) {
      return fs.existsSync(fullpath);
    };

    DebuggerView.prototype.getEditor = function(fullpath) {
      return this.cachedEditors[fullpath];
    };

    DebuggerView.prototype.goExitedStatus = function() {
      this.continueButton.addClass('disabled');
      this.interruptButton.addClass('disabled');
      this.stepButton.addClass('disabled');
      this.nextButton.addClass('disabled');
      this.removeClass('running');
      return this.addClass('stopped');
    };

    DebuggerView.prototype.goStoppedStatus = function() {
      this.continueButton.removeClass('disabled');
      this.interruptButton.addClass('disabled');
      this.stepButton.removeClass('disabled');
      this.nextButton.removeClass('disabled');
      this.removeClass('running');
      return this.addClass('stopped');
    };

    DebuggerView.prototype.goRunningStatus = function() {
      var ref1;
      if ((ref1 = this.stopped.marker) != null) {
        ref1.destroy();
      }
      this.stopped = {
        marker: null,
        fullpath: null,
        line: null
      };
      this.continueButton.addClass('disabled');
      this.interruptButton.removeClass('disabled');
      this.stepButton.addClass('disabled');
      this.nextButton.addClass('disabled');
      this.removeClass('stopped');
      return this.addClass('running');
    };

    DebuggerView.prototype.insertMainBreak = function() {
      return this.GDB.insertBreak({
        location: 'main'
      }, (function(_this) {
        return function(abreak) {
          var fullpath, line;
          if (abreak) {
            if (abreak.fullname) {
              fullpath = path.resolve(abreak.fullname);
              line = Number(abreak.line) - 1;
              return _this.insertBreakWithoutEditor(fullpath, line);
            } else {
              return atom.confirm({
                detailedMessage: "Can't find debugging symbols\nPlease recompile with `-g` option.",
                buttons: {
                  Exit: function() {
                    return _this.destroy();
                  }
                }
              });
            }
          }
        };
      })(this));
    };

    DebuggerView.prototype.listExecFile = function() {
      return this.GDB.listExecFile((function(_this) {
        return function(file) {
          var fullpath, line;
          if (file) {
            fullpath = path.resolve(file.fullname);
            line = Number(file.line) - 1;
            if (_this.exists(fullpath)) {
              return atom.workspace.open(fullpath, function(editor) {
                return _this.moveToLine(editor, line);
              });
            } else {
              return atom.confirm({
                detailedMessage: "Can't find file " + file.file + "\nPlease add path to tree-view and try again.",
                buttons: {
                  Exit: function() {
                    return _this.destroy();
                  }
                }
              });
            }
          }
        };
      })(this));
    };

    DebuggerView.prototype.toggleBreak = function(editor, line) {
      if (this.hasBreak(editor, line)) {
        return this.deleteBreak(editor, line);
      } else {
        return this.insertBreak(editor, line);
      }
    };

    DebuggerView.prototype.hasBreak = function(editor, line) {
      return line in this.breaks[editor.getPath()];
    };

    DebuggerView.prototype.deleteBreak = function(editor, line) {
      var abreak, fullpath, marker, ref1;
      fullpath = editor.getPath();
      ref1 = this.breaks[fullpath][line], abreak = ref1.abreak, marker = ref1.marker;
      return this.GDB.deleteBreak(abreak.number, (function(_this) {
        return function(done) {
          if (done) {
            marker.destroy();
            return delete _this.breaks[fullpath][line];
          }
        };
      })(this));
    };

    DebuggerView.prototype.insertBreak = function(editor, line) {
      var fullpath;
      fullpath = editor.getPath();
      return this.GDB.insertBreak({
        location: fullpath + ":" + (line + 1)
      }, (function(_this) {
        return function(abreak) {
          var marker;
          if (abreak) {
            marker = _this.markBreakLine(editor, line);
            return _this.breaks[fullpath][line] = {
              abreak: abreak,
              marker: marker
            };
          }
        };
      })(this));
    };

    DebuggerView.prototype.insertBreakWithoutEditor = function(fullpath, line) {
      var base;
      if ((base = this.breaks)[fullpath] == null) {
        base[fullpath] = {};
      }
      return this.GDB.insertBreak({
        location: fullpath + ":" + (line + 1)
      }, (function(_this) {
        return function(abreak) {
          var editor, marker;
          if (abreak) {
            if (editor = _this.getEditor(fullpath)) {
              marker = _this.markBreakLine(editor, line);
            } else {
              marker = null;
            }
            return _this.breaks[fullpath][line] = {
              abreak: abreak,
              marker: marker
            };
          }
        };
      })(this));
    };

    DebuggerView.prototype.moveToLine = function(editor, line) {
      editor.scrollToBufferPosition(new Point(line));
      editor.setCursorBufferPosition(new Point(line));
      return editor.moveToFirstCharacterOfLine();
    };

    DebuggerView.prototype.markBreakLine = function(editor, line) {
      var marker, range;
      range = new Range([line, 0], [line + 1, 0]);
      marker = editor.markBufferRange(range, {
        invalidate: 'never'
      });
      editor.decorateMarker(marker, {
        type: 'line-number',
        "class": 'debugger-breakpoint-line'
      });
      return marker;
    };

    DebuggerView.prototype.markStoppedLine = function(editor, line) {
      var marker, range;
      range = new Range([line, 0], [line + 1, 0]);
      marker = editor.markBufferRange(range, {
        invalidate: 'never'
      });
      editor.decorateMarker(marker, {
        type: 'line-number',
        "class": 'debugger-stopped-line'
      });
      editor.decorateMarker(marker, {
        type: 'highlight',
        "class": 'selection'
      });
      this.moveToLine(editor, line);
      return marker;
    };

    DebuggerView.prototype.refreshBreakMarkers = function(editor) {
      var abreak, fullpath, line, marker, ref1, ref2, results;
      fullpath = editor.getPath();
      ref1 = this.breaks[fullpath];
      results = [];
      for (line in ref1) {
        ref2 = ref1[line], abreak = ref2.abreak, marker = ref2.marker;
        marker = this.markBreakLine(editor, Number(line));
        results.push(this.breaks[fullpath][line] = {
          abreak: abreak,
          marker: marker
        });
      }
      return results;
    };

    DebuggerView.prototype.refreshStoppedMarker = function(editor) {
      var fullpath;
      fullpath = editor.getPath();
      if (fullpath === this.stopped.fullpath) {
        return this.stopped.marker = this.markStoppedLine(editor, this.stopped.line);
      }
    };

    DebuggerView.prototype.hackGutterDblClick = function(editor) {
      var component, gutter;
      component = atom.views.getView(editor).component;
      gutter = component.gutterComponent;
      if (gutter == null) {
        gutter = component.gutterContainerComponent;
      }
      return gutter.domNode.addEventListener('dblclick', (function(_this) {
        return function(event) {
          var line, position, selection;
          position = component.screenPositionForMouseEvent(event);
          line = editor.bufferPositionForScreenPosition(position).row;
          _this.toggleBreak(editor, line);
          selection = editor.selectionsForScreenRows(line, line + 1)[0];
          return selection != null ? selection.clear() : void 0;
        };
      })(this));
    };

    DebuggerView.prototype.handleEvents = function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', 'debugger:toggle-breakpoint', (function(_this) {
        return function() {
          return _this.toggleBreak(_this.getActiveTextEditor(), _this.contextLine);
        };
      })(this)));
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var base, fullpath;
          fullpath = editor.getPath();
          _this.cachedEditors[fullpath] = editor;
          if ((base = _this.breaks)[fullpath] == null) {
            base[fullpath] = {};
          }
          _this.refreshBreakMarkers(editor);
          _this.refreshStoppedMarker(editor);
          return _this.hackGutterDblClick(editor);
        };
      })(this)));
      this.subscriptions.add(atom.project.onDidChangePaths((function(_this) {
        return function(paths) {
          return _this.GDB.setSourceDirectories(paths, function(done) {});
        };
      })(this)));
      this.runButton.on('click', (function(_this) {
        return function() {
          return _this.GDB.run(function(result) {});
        };
      })(this));
      this.continueButton.on('click', (function(_this) {
        return function() {
          return _this.GDB["continue"](function(result) {});
        };
      })(this));
      this.interruptButton.on('click', (function(_this) {
        return function() {
          return _this.GDB.interrupt(function(result) {});
        };
      })(this));
      this.nextButton.on('click', (function(_this) {
        return function() {
          return _this.GDB.next(function(result) {});
        };
      })(this));
      this.stepButton.on('click', (function(_this) {
        return function() {
          return _this.GDB.step(function(result) {});
        };
      })(this));
      this.GDB.onExecAsyncRunning((function(_this) {
        return function(result) {
          return _this.goRunningStatus();
        };
      })(this));
      return this.GDB.onExecAsyncStopped((function(_this) {
        return function(result) {
          var frame, fullpath, line;
          _this.goStoppedStatus();
          if (!(frame = result.frame)) {
            return _this.goExitedStatus();
          } else {
            fullpath = path.resolve(frame.fullname);
            line = Number(frame.line) - 1;
            if (_this.exists(fullpath)) {
              return atom.workspace.open(fullpath, {
                debugging: true,
                fullpath: fullpath,
                startline: line
              }).done(function(editor) {
                return _this.stopped = {
                  marker: _this.markStoppedLine(editor, line),
                  fullpath: fullpath,
                  line: line
                };
              });
            } else {
              return _this.GDB.next(function(result) {});
            }
          }
        };
      })(this));
    };

    DebuggerView.prototype.destroy = function() {
      var abreak, breaks, component, editor, fullpath, gutter, i, len, line, marker, ref1, ref2, ref3, ref4;
      this.GDB.destroy();
      this.subscriptions.dispose();
      if ((ref1 = this.stopped.marker) != null) {
        ref1.destroy();
      }
      this.menu.dispose();
      ref2 = this.breaks;
      for (fullpath in ref2) {
        breaks = ref2[fullpath];
        for (line in breaks) {
          ref3 = breaks[line], abreak = ref3.abreak, marker = ref3.marker;
          marker.destroy();
        }
      }
      ref4 = atom.workspace.getTextEditors();
      for (i = 0, len = ref4.length; i < len; i++) {
        editor = ref4[i];
        component = atom.views.getView(editor).component;
        gutter = component.gutterComponent;
        if (gutter == null) {
          gutter = component.gutterContainerComponent;
        }
        gutter.domNode.removeEventListener('dblclick');
      }
      this.panel.destroy();
      return this.detach();
    };

    return DebuggerView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdG9tLWRlYnVnZ2VyL2xpYi9kZWJ1Z2dlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEdBQUE7SUFBQTs7O0VBQUEsTUFBOEQsT0FBQSxDQUFRLE1BQVIsQ0FBOUQsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWUsMkJBQWYsRUFBMkIsMkJBQTNCLEVBQXVDOztFQUN0QyxPQUFRLE9BQUEsQ0FBUSxzQkFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLG1CQUFSOztFQUNOLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUdaLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO09BQUwsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzNCLEtBQUMsQ0FBQSxNQUFELENBQVE7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7V0FBUixFQUF5QixTQUFBO1lBQ3ZCLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1CQUFQO2FBQU4sRUFBa0MsZUFBbEM7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sdUJBQVA7Y0FBZ0MsTUFBQSxFQUFRLGFBQXhDO2FBQU47VUFGdUIsQ0FBekI7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtXQUFMLEVBQTJCLFNBQUE7bUJBQ3pCLEtBQUMsQ0FBQSxHQUFELENB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IENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuR0RCID0gcmVxdWlyZSAnLi9iYWNrZW5kL2dkYi9nZGInXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5Bc21WaWV3ZXIgPSByZXF1aXJlICcuL2FzbS12aWV3ZXInXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGVidWdnZXJWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnYXRvbS1kZWJ1Z2dlcicsID0+XG4gICAgICBAaGVhZGVyIGNsYXNzOiAnaGVhZGVyJywgPT5cbiAgICAgICAgQHNwYW4gY2xhc3M6ICdoZWFkZXItaXRlbSB0aXRsZScsICdBdG9tIERlYnVnZ2VyJ1xuICAgICAgICBAc3BhbiBjbGFzczogJ2hlYWRlci1pdGVtIHN1Yi10aXRsZScsIG91dGxldDogJ3RhcmdldExhYmxlJ1xuICAgICAgQGRpdiBjbGFzczogJ2J0bi10b29sYmFyJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCcsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0bicsIG91dGxldDogJ3J1bkJ1dHRvbicsICdSdW4nXG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0biBkaXNhYmxlZCcsIG91dGxldDogJ2NvbnRpbnVlQnV0dG9uJywgJ0NvbnRpbnVlJ1xuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4gZGlzYWJsZWQnLCBvdXRsZXQ6ICdpbnRlcnJ1cHRCdXR0b24nLCAnSW50ZXJydXB0J1xuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4gZGlzYWJsZWQnLCBvdXRsZXQ6ICduZXh0QnV0dG9uJywgJ05leHQnXG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0biBkaXNhYmxlZCcsIG91dGxldDogJ3N0ZXBCdXR0b24nLCAnU3RlcCdcblxuICBpbml0aWFsaXplOiAodGFyZ2V0LCBtYWluQnJlYWspIC0+XG4gICAgQEdEQiA9IG5ldyBHREIodGFyZ2V0KVxuICAgIEB0YXJnZXRMYWJsZS50ZXh0KHRhcmdldClcblxuICAgIEBHREIuc2V0ICd0YXJnZXQtYXN5bmMnLCAnb24nLCAocmVzdWx0KSAtPlxuICAgIEBHREIuc2V0U291cmNlRGlyZWN0b3JpZXMgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksIChkb25lKSAtPlxuXG4gICAgQGJyZWFrcyA9IHt9XG4gICAgQHN0b3BwZWQgPSB7bWFya2VyOiBudWxsLCBmdWxscGF0aDogbnVsbCwgbGluZTogbnVsbH1cbiAgICBAYXNtcyA9IHt9XG4gICAgQGNhY2hlZEVkaXRvcnMgPSB7fVxuICAgIEBoYW5kbGVFdmVudHMoKVxuXG4gICAgY29udGV4dE1lbnVDcmVhdGVkID0gKGV2ZW50KSA9PlxuICAgICAgaWYgZWRpdG9yID0gQGdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBjb21wb25lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKS5jb21wb25lbnRcbiAgICAgICAgcG9zaXRpb24gPSBjb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuICAgICAgICBAY29udGV4dExpbmUgPSBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihwb3NpdGlvbikucm93XG5cbiAgICBAbWVudSA9IGF0b20uY29udGV4dE1lbnUuYWRkIHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW3tcbiAgICAgICAgbGFiZWw6ICdUb2dnbGUgQnJlYWtwb2ludCcsXG4gICAgICAgIGNvbW1hbmQ6ICdkZWJ1Z2dlcjp0b2dnbGUtYnJlYWtwb2ludCcsXG4gICAgICAgIGNyZWF0ZWQ6IGNvbnRleHRNZW51Q3JlYXRlZFxuICAgICAgfV1cbiAgICB9XG5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiBALCB2aXNpYmxlOiB0cnVlKVxuXG4gICAgQGluc2VydE1haW5CcmVhaygpIGlmIG1haW5CcmVha1xuICAgIEBsaXN0RXhlY0ZpbGUoKVxuXG4gIGdldEFjdGl2ZVRleHRFZGl0b3I6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgZXhpc3RzOiAoZnVsbHBhdGgpIC0+XG4gICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoZnVsbHBhdGgpXG5cbiAgZ2V0RWRpdG9yOiAoZnVsbHBhdGgpIC0+XG4gICAgcmV0dXJuIEBjYWNoZWRFZGl0b3JzW2Z1bGxwYXRoXVxuXG4gIGdvRXhpdGVkU3RhdHVzOiAtPlxuICAgIEBjb250aW51ZUJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKVxuICAgIEBpbnRlcnJ1cHRCdXR0b24uYWRkQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICBAc3RlcEJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKVxuICAgIEBuZXh0QnV0dG9uLmFkZENsYXNzKCdkaXNhYmxlZCcpXG4gICAgQHJlbW92ZUNsYXNzKCdydW5uaW5nJylcbiAgICBAYWRkQ2xhc3MoJ3N0b3BwZWQnKVxuXG4gIGdvU3RvcHBlZFN0YXR1czogLT5cbiAgICBAY29udGludWVCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICBAaW50ZXJydXB0QnV0dG9uLmFkZENsYXNzKCdkaXNhYmxlZCcpXG4gICAgQHN0ZXBCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICBAbmV4dEJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKVxuICAgIEByZW1vdmVDbGFzcygncnVubmluZycpXG4gICAgQGFkZENsYXNzKCdzdG9wcGVkJylcblxuICBnb1J1bm5pbmdTdGF0dXM6IC0+XG4gICAgQHN0b3BwZWQubWFya2VyPy5kZXN0cm95KClcbiAgICBAc3RvcHBlZCA9IHttYXJrZXI6IG51bGwsIGZ1bGxwYXRoOiBudWxsLCBsaW5lOiBudWxsfVxuICAgIEBjb250aW51ZUJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKVxuICAgIEBpbnRlcnJ1cHRCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJylcbiAgICBAc3RlcEJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKVxuICAgIEBuZXh0QnV0dG9uLmFkZENsYXNzKCdkaXNhYmxlZCcpXG4gICAgQHJlbW92ZUNsYXNzKCdzdG9wcGVkJylcbiAgICBAYWRkQ2xhc3MoJ3J1bm5pbmcnKVxuXG4gIGluc2VydE1haW5CcmVhazogLT5cbiAgICBAR0RCLmluc2VydEJyZWFrIHtsb2NhdGlvbjogJ21haW4nfSwgKGFicmVhaykgPT5cbiAgICAgIGlmIGFicmVha1xuICAgICAgICBpZiBhYnJlYWsuZnVsbG5hbWVcbiAgICAgICAgICBmdWxscGF0aCA9IHBhdGgucmVzb2x2ZShhYnJlYWsuZnVsbG5hbWUpXG4gICAgICAgICAgbGluZSA9IE51bWJlcihhYnJlYWsubGluZSktMVxuICAgICAgICAgIEBpbnNlcnRCcmVha1dpdGhvdXRFZGl0b3IoZnVsbHBhdGgsIGxpbmUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogXCJDYW4ndCBmaW5kIGRlYnVnZ2luZyBzeW1ib2xzXFxuUGxlYXNlIHJlY29tcGlsZSB3aXRoIGAtZ2Agb3B0aW9uLlwiXG4gICAgICAgICAgICBidXR0b25zOlxuICAgICAgICAgICAgICBFeGl0OiA9PiBAZGVzdHJveSgpXG5cbiAgbGlzdEV4ZWNGaWxlOiAtPlxuICAgIEBHREIubGlzdEV4ZWNGaWxlIChmaWxlKSA9PlxuICAgICAgaWYgZmlsZVxuICAgICAgICBmdWxscGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlLmZ1bGxuYW1lKVxuICAgICAgICBsaW5lID0gTnVtYmVyKGZpbGUubGluZSkgLSAxXG4gICAgICAgIGlmIEBleGlzdHMoZnVsbHBhdGgpXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBmdWxscGF0aCwgKGVkaXRvcikgPT5cbiAgICAgICAgICAgIEBtb3ZlVG9MaW5lKGVkaXRvciwgbGluZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0b20uY29uZmlybVxuICAgICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIkNhbid0IGZpbmQgZmlsZSAje2ZpbGUuZmlsZX1cXG5QbGVhc2UgYWRkIHBhdGggdG8gdHJlZS12aWV3IGFuZCB0cnkgYWdhaW4uXCJcbiAgICAgICAgICAgIGJ1dHRvbnM6XG4gICAgICAgICAgICAgIEV4aXQ6ID0+IEBkZXN0cm95KClcblxuICB0b2dnbGVCcmVhazogKGVkaXRvciwgbGluZSkgLT5cbiAgICBpZiBAaGFzQnJlYWsoZWRpdG9yLCBsaW5lKVxuICAgICAgQGRlbGV0ZUJyZWFrKGVkaXRvciwgbGluZSlcbiAgICBlbHNlXG4gICAgICBAaW5zZXJ0QnJlYWsoZWRpdG9yLCBsaW5lKVxuXG4gIGhhc0JyZWFrOiAoZWRpdG9yLCBsaW5lKSAtPlxuICAgIHJldHVybiBsaW5lIG9mIEBicmVha3NbZWRpdG9yLmdldFBhdGgoKV1cblxuICBkZWxldGVCcmVhazogKGVkaXRvciwgbGluZSkgLT5cbiAgICBmdWxscGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICB7YWJyZWFrLCBtYXJrZXJ9ID0gQGJyZWFrc1tmdWxscGF0aF1bbGluZV1cbiAgICBAR0RCLmRlbGV0ZUJyZWFrIGFicmVhay5udW1iZXIsIChkb25lKSA9PlxuICAgICAgaWYgZG9uZVxuICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgICAgIGRlbGV0ZSBAYnJlYWtzW2Z1bGxwYXRoXVtsaW5lXVxuXG4gIGluc2VydEJyZWFrOiAoZWRpdG9yLCBsaW5lKSAtPlxuICAgIGZ1bGxwYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIEBHREIuaW5zZXJ0QnJlYWsge2xvY2F0aW9uOiBcIiN7ZnVsbHBhdGh9OiN7bGluZSsxfVwifSwgKGFicmVhaykgPT5cbiAgICAgIGlmIGFicmVha1xuICAgICAgICBtYXJrZXIgPSBAbWFya0JyZWFrTGluZShlZGl0b3IsIGxpbmUpXG4gICAgICAgIEBicmVha3NbZnVsbHBhdGhdW2xpbmVdID0ge2FicmVhaywgbWFya2VyfVxuXG4gIGluc2VydEJyZWFrV2l0aG91dEVkaXRvcjogKGZ1bGxwYXRoLCBsaW5lKSAtPlxuICAgIEBicmVha3NbZnVsbHBhdGhdID89IHt9XG4gICAgQEdEQi5pbnNlcnRCcmVhayB7bG9jYXRpb246IFwiI3tmdWxscGF0aH06I3tsaW5lKzF9XCJ9LCAoYWJyZWFrKSA9PlxuICAgICAgaWYgYWJyZWFrXG4gICAgICAgIGlmIGVkaXRvciA9IEBnZXRFZGl0b3IoZnVsbHBhdGgpXG4gICAgICAgICAgbWFya2VyID0gQG1hcmtCcmVha0xpbmUoZWRpdG9yLCBsaW5lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWFya2VyID0gbnVsbFxuICAgICAgICBAYnJlYWtzW2Z1bGxwYXRoXVtsaW5lXSA9IHthYnJlYWssIG1hcmtlcn1cblxuICBtb3ZlVG9MaW5lOiAoZWRpdG9yLCBsaW5lKSAtPlxuICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKG5ldyBQb2ludChsaW5lKSlcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KGxpbmUpKVxuICAgIGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbiAgbWFya0JyZWFrTGluZTogKGVkaXRvciwgbGluZSkgLT5cbiAgICByYW5nZSA9IG5ldyBSYW5nZShbbGluZSwgMF0sIFtsaW5lKzEsIDBdKVxuICAgIG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSlcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2xpbmUtbnVtYmVyJywgY2xhc3M6ICdkZWJ1Z2dlci1icmVha3BvaW50LWxpbmUnfSlcbiAgICByZXR1cm4gbWFya2VyXG5cbiAgbWFya1N0b3BwZWRMaW5lOiAoZWRpdG9yLCBsaW5lKSAtPlxuICAgIHJhbmdlID0gbmV3IFJhbmdlKFtsaW5lLCAwXSwgW2xpbmUrMSwgMF0pXG4gICAgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KVxuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnbGluZS1udW1iZXInLCBjbGFzczogJ2RlYnVnZ2VyLXN0b3BwZWQtbGluZSd9KVxuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6ICdzZWxlY3Rpb24nfSlcblxuICAgIEBtb3ZlVG9MaW5lKGVkaXRvciwgbGluZSlcbiAgICByZXR1cm4gbWFya2VyXG5cbiAgcmVmcmVzaEJyZWFrTWFya2VyczogKGVkaXRvcikgLT5cbiAgICBmdWxscGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICBmb3IgbGluZSwge2FicmVhaywgbWFya2VyfSBvZiBAYnJlYWtzW2Z1bGxwYXRoXVxuICAgICAgbWFya2VyID0gQG1hcmtCcmVha0xpbmUoZWRpdG9yLCBOdW1iZXIobGluZSkpXG4gICAgICBAYnJlYWtzW2Z1bGxwYXRoXVtsaW5lXSA9IHthYnJlYWssIG1hcmtlcn1cblxuICByZWZyZXNoU3RvcHBlZE1hcmtlcjogKGVkaXRvcikgLT5cbiAgICBmdWxscGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICBpZiBmdWxscGF0aCA9PSBAc3RvcHBlZC5mdWxscGF0aFxuICAgICAgQHN0b3BwZWQubWFya2VyID0gQG1hcmtTdG9wcGVkTGluZShlZGl0b3IsIEBzdG9wcGVkLmxpbmUpXG5cbiAgaGFja0d1dHRlckRibENsaWNrOiAoZWRpdG9yKSAtPlxuICAgIGNvbXBvbmVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLmNvbXBvbmVudFxuICAgICMgZ3V0dGVyQ29tcG9uZW50IGhhcyBiZWVuIHJlbmFtZWQgdG8gZ3V0dGVyQ29udGFpbmVyQ29tcG9uZW50XG4gICAgZ3V0dGVyICA9IGNvbXBvbmVudC5ndXR0ZXJDb21wb25lbnRcbiAgICBndXR0ZXIgPz0gY29tcG9uZW50Lmd1dHRlckNvbnRhaW5lckNvbXBvbmVudFxuXG4gICAgZ3V0dGVyLmRvbU5vZGUuYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICBwb3NpdGlvbiA9IGNvbXBvbmVudC5zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQpXG4gICAgICBsaW5lID0gZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24ocG9zaXRpb24pLnJvd1xuICAgICAgQHRvZ2dsZUJyZWFrKGVkaXRvciwgbGluZSlcbiAgICAgIHNlbGVjdGlvbiA9IGVkaXRvci5zZWxlY3Rpb25zRm9yU2NyZWVuUm93cyhsaW5lLCBsaW5lICsgMSlbMF1cbiAgICAgIHNlbGVjdGlvbj8uY2xlYXIoKVxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2RlYnVnZ2VyOnRvZ2dsZS1icmVha3BvaW50JywgPT5cbiAgICAgIEB0b2dnbGVCcmVhayhAZ2V0QWN0aXZlVGV4dEVkaXRvcigpLCBAY29udGV4dExpbmUpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBmdWxscGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIEBjYWNoZWRFZGl0b3JzW2Z1bGxwYXRoXSA9IGVkaXRvclxuICAgICAgQGJyZWFrc1tmdWxscGF0aF0gPz0ge31cbiAgICAgIEByZWZyZXNoQnJlYWtNYXJrZXJzKGVkaXRvcilcbiAgICAgIEByZWZyZXNoU3RvcHBlZE1hcmtlcihlZGl0b3IpXG4gICAgICBAaGFja0d1dHRlckRibENsaWNrKGVkaXRvcilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyAocGF0aHMpID0+XG4gICAgICBAR0RCLnNldFNvdXJjZURpcmVjdG9yaWVzIHBhdGhzLCAoZG9uZSkgLT5cblxuICAgIEBydW5CdXR0b24ub24gJ2NsaWNrJywgPT5cbiAgICAgIEBHREIucnVuIChyZXN1bHQpIC0+XG5cbiAgICBAY29udGludWVCdXR0b24ub24gJ2NsaWNrJywgPT5cbiAgICAgIEBHREIuY29udGludWUgKHJlc3VsdCkgLT5cblxuICAgIEBpbnRlcnJ1cHRCdXR0b24ub24gJ2NsaWNrJywgPT5cbiAgICAgIEBHREIuaW50ZXJydXB0IChyZXN1bHQpIC0+XG5cbiAgICBAbmV4dEJ1dHRvbi5vbiAnY2xpY2snLCA9PlxuICAgICAgQEdEQi5uZXh0IChyZXN1bHQpIC0+XG5cbiAgICBAc3RlcEJ1dHRvbi5vbiAnY2xpY2snLCA9PlxuICAgICAgQEdEQi5zdGVwIChyZXN1bHQpIC0+XG5cbiAgICBAR0RCLm9uRXhlY0FzeW5jUnVubmluZyAocmVzdWx0KSA9PlxuICAgICAgQGdvUnVubmluZ1N0YXR1cygpXG5cbiAgICBAR0RCLm9uRXhlY0FzeW5jU3RvcHBlZCAocmVzdWx0KSA9PlxuICAgICAgQGdvU3RvcHBlZFN0YXR1cygpXG5cbiAgICAgIHVubGVzcyBmcmFtZSA9IHJlc3VsdC5mcmFtZVxuICAgICAgICBAZ29FeGl0ZWRTdGF0dXMoKVxuICAgICAgZWxzZVxuICAgICAgICBmdWxscGF0aCA9IHBhdGgucmVzb2x2ZShmcmFtZS5mdWxsbmFtZSlcbiAgICAgICAgbGluZSA9IE51bWJlcihmcmFtZS5saW5lKS0xXG5cbiAgICAgICAgaWYgQGV4aXN0cyhmdWxscGF0aClcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZ1bGxwYXRoLCB7ZGVidWdnaW5nOiB0cnVlLCBmdWxscGF0aDogZnVsbHBhdGgsIHN0YXJ0bGluZTogbGluZX0pLmRvbmUgKGVkaXRvcikgPT5cbiAgICAgICAgICAgIEBzdG9wcGVkID0ge21hcmtlcjogQG1hcmtTdG9wcGVkTGluZShlZGl0b3IsIGxpbmUpLCBmdWxscGF0aCwgbGluZX1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBHREIubmV4dCAocmVzdWx0KSAtPlxuXG4gICMgVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3k6IC0+XG4gICAgQEdEQi5kZXN0cm95KClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAc3RvcHBlZC5tYXJrZXI/LmRlc3Ryb3koKVxuICAgIEBtZW51LmRpc3Bvc2UoKVxuXG4gICAgZm9yIGZ1bGxwYXRoLCBicmVha3Mgb2YgQGJyZWFrc1xuICAgICAgZm9yIGxpbmUsIHthYnJlYWssIG1hcmtlcn0gb2YgYnJlYWtzXG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcblxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgY29tcG9uZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcikuY29tcG9uZW50XG4gICAgICBndXR0ZXIgID0gY29tcG9uZW50Lmd1dHRlckNvbXBvbmVudFxuICAgICAgZ3V0dGVyID89IGNvbXBvbmVudC5ndXR0ZXJDb250YWluZXJDb21wb25lbnRcbiAgICAgIGd1dHRlci5kb21Ob2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2RibGNsaWNrJ1xuXG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgIEBkZXRhY2goKVxuIl19
