(function() {
  var $, CompositeDisposable, Emitter, InputDialog, Pty, Task, Terminal, TerminalPlusView, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = TerminalPlusView = (function(superClass) {
    extend(TerminalPlusView, superClass);

    function TerminalPlusView() {
      this.blurTerminal = bind(this.blurTerminal, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = bind(this.setAnimationSpeed, this);
      return TerminalPlusView.__super__.constructor.apply(this, arguments);
    }

    TerminalPlusView.prototype.animating = false;

    TerminalPlusView.prototype.id = '';

    TerminalPlusView.prototype.maximized = false;

    TerminalPlusView.prototype.opened = false;

    TerminalPlusView.prototype.pwd = '';

    TerminalPlusView.prototype.windowHeight = $(window).height();

    TerminalPlusView.prototype.rowHeight = 20;

    TerminalPlusView.prototype.shell = '';

    TerminalPlusView.prototype.tabView = false;

    TerminalPlusView.content = function() {
      return this.div({
        "class": 'terminal-plus terminal-view',
        outlet: 'terminalPlusView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.div({
            "class": 'btn-toolbar',
            outlet: 'toolbar'
          }, function() {
            _this.button({
              outlet: 'closeBtn',
              "class": 'btn inline-block-tight right',
              click: 'destroy'
            }, function() {
              return _this.span({
                "class": 'icon icon-x'
              });
            });
            _this.button({
              outlet: 'hideBtn',
              "class": 'btn inline-block-tight right',
              click: 'hide'
            }, function() {
              return _this.span({
                "class": 'icon icon-chevron-down'
              });
            });
            _this.button({
              outlet: 'maximizeBtn',
              "class": 'btn inline-block-tight right',
              click: 'maximize'
            }, function() {
              return _this.span({
                "class": 'icon icon-screen-full'
              });
            });
            return _this.button({
              outlet: 'inputBtn',
              "class": 'btn inline-block-tight left',
              click: 'inputDialog'
            }, function() {
              return _this.span({
                "class": 'icon icon-keyboard'
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    TerminalPlusView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    TerminalPlusView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('terminal-plus.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('terminal-plus') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      return this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
    };

    TerminalPlusView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    TerminalPlusView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('terminal-plus.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref2, results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input(filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input(filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        ref2 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          file = ref2[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    TerminalPlusView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    TerminalPlusView.prototype.getId = function() {
      return this.id;
    };

    TerminalPlusView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('terminal-plus.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    TerminalPlusView.prototype.attachListeners = function() {
      this.ptyProcess.on("terminal-plus:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:exit", (function(_this) {
        return function() {
          if (atom.config.get('terminal-plus.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('terminal-plus.core.autoRunCommand');
          if (autoRunCommand) {
            return _this.input("" + autoRunCommand + os.EOL);
          }
        };
      })(this));
    };

    TerminalPlusView.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((ref2 = this.ptyProcess) != null) {
        ref2.terminate();
      }
      return (ref3 = this.terminal) != null ? ref3.destroy() : void 0;
    };

    TerminalPlusView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + $('.item-views').height();
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    TerminalPlusView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            return _this.xterm.height(_this.prevHeight);
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    TerminalPlusView.prototype.hide = function() {
      var ref2;
      if ((ref2 = this.terminal) != null) {
        ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    TerminalPlusView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    TerminalPlusView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    TerminalPlusView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    TerminalPlusView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('terminal-plus');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    TerminalPlusView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    TerminalPlusView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    TerminalPlusView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    TerminalPlusView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    TerminalPlusView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    TerminalPlusView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    TerminalPlusView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    TerminalPlusView.prototype.insertSelection = function() {
      var cursor, editor, line, runCommand, selection;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('terminal-plus.toggles.runInsertedText');
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        return this.input("" + selection + (runCommand ? os.EOL : ''));
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        this.input("" + line + (runCommand ? os.EOL : ''));
        return editor.moveDown(1);
      }
    };

    TerminalPlusView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return TerminalPlusView.__super__.focus.call(this);
    };

    TerminalPlusView.prototype.blur = function() {
      this.blurTerminal();
      return TerminalPlusView.__super__.blur.call(this);
    };

    TerminalPlusView.prototype.focusTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    TerminalPlusView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      return this.terminal.element.blur();
    };

    TerminalPlusView.prototype.resizeTerminalToView = function() {
      var cols, ref2, rows;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    TerminalPlusView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    TerminalPlusView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    TerminalPlusView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    TerminalPlusView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    TerminalPlusView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    TerminalPlusView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "Terminal-Plus";
    };

    TerminalPlusView.prototype.getIconName = function() {
      return "terminal";
    };

    TerminalPlusView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    TerminalPlusView.prototype.getShellPath = function() {
      return this.shell;
    };

    TerminalPlusView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    TerminalPlusView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    TerminalPlusView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    TerminalPlusView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    TerminalPlusView.prototype.getTerminal = function() {
      return this.terminal;
    };

    TerminalPlusView.prototype.isAnimating = function() {
      return this.animating;
    };

    return TerminalPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi92aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUpBQUE7SUFBQTs7OztFQUFBLE1BQXVDLE9BQUEsQ0FBUSxNQUFSLENBQXZDLEVBQUMsZUFBRCxFQUFPLDZDQUFQLEVBQTRCOztFQUM1QixPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsVUFBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0VBQ1gsV0FBQSxHQUFjOztFQUVkLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsY0FBQSxHQUFpQjs7RUFDakIsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JBQ0osU0FBQSxHQUFXOzsrQkFDWCxFQUFBLEdBQUk7OytCQUNKLFNBQUEsR0FBVzs7K0JBQ1gsTUFBQSxHQUFROzsrQkFDUixHQUFBLEdBQUs7OytCQUNMLFlBQUEsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBOzsrQkFDZCxTQUFBLEdBQVc7OytCQUNYLEtBQUEsR0FBTzs7K0JBQ1AsT0FBQSxHQUFTOztJQUVULGdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw2QkFBUDtRQUFzQyxNQUFBLEVBQVEsa0JBQTlDO09BQUwsRUFBdUUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JFLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7WUFBd0IsTUFBQSxFQUFRLGNBQWhDO1dBQUw7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO1lBQXNCLE1BQUEsRUFBTyxTQUE3QjtXQUFMLEVBQTZDLFNBQUE7WUFDM0MsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLE1BQUEsRUFBUSxVQUFSO2NBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sOEJBQTNCO2NBQTJELEtBQUEsRUFBTyxTQUFsRTthQUFSLEVBQXFGLFNBQUE7cUJBQ25GLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2VBQU47WUFEbUYsQ0FBckY7WUFFQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLFNBQVI7Y0FBbUIsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBMUI7Y0FBMEQsS0FBQSxFQUFPLE1BQWpFO2FBQVIsRUFBaUYsU0FBQTtxQkFDL0UsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO2VBQU47WUFEK0UsQ0FBakY7WUFFQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLGFBQVI7Y0FBdUIsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBOUI7Y0FBOEQsS0FBQSxFQUFPLFVBQXJFO2FBQVIsRUFBeUYsU0FBQTtxQkFDdkYsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHVCQUFQO2VBQU47WUFEdUYsQ0FBekY7bUJBRUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLE1BQUEsRUFBUSxVQUFSO2NBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sNkJBQTNCO2NBQTBELEtBQUEsRUFBTyxhQUFqRTthQUFSLEVBQXdGLFNBQUE7cUJBQ3RGLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBUDtlQUFOO1lBRHNGLENBQXhGO1VBUDJDLENBQTdDO2lCQVNBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7WUFBZ0IsTUFBQSxFQUFRLE9BQXhCO1dBQUw7UUFYcUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZFO0lBRFE7O0lBY1YsZ0JBQUMsQ0FBQSxrQkFBRCxHQUFxQixTQUFBO0FBQ25CLGFBQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUROOzsrQkFHckIsVUFBQSxHQUFZLFNBQUMsRUFBRCxFQUFNLEdBQU4sRUFBWSxVQUFaLEVBQXlCLFNBQXpCLEVBQXFDLEtBQXJDLEVBQTZDLElBQTdDO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxLQUFEO01BQUssSUFBQyxDQUFBLE1BQUQ7TUFBTSxJQUFDLENBQUEsYUFBRDtNQUFhLElBQUMsQ0FBQSxZQUFEO01BQVksSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsc0JBQUQsT0FBTTtNQUM3RCxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFFBQW5CLEVBQ2pCO1FBQUEsS0FBQSxFQUFPLE9BQVA7T0FEaUIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNqQjtRQUFBLEtBQUEsRUFBTyxNQUFQO09BRGlCLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3hDO1FBQUEsS0FBQSxFQUFPLFlBQVA7T0FEd0MsQ0FBMUM7TUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxRQUFuQixFQUNsQjtRQUFBLEtBQUEsRUFBTyxhQUFQO09BRGtCO01BR3BCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQjtNQUNkLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLEdBQXBCLENBQUEsR0FBMkIsQ0FBOUI7UUFDRSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsQ0FBVyxJQUFDLENBQUEsVUFBWixDQUFBLEdBQTBCLEtBQW5DLEVBQTBDLENBQTFDLENBQVQ7UUFDVixZQUFBLEdBQWUsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsZ0JBQWhDLENBQWlELENBQUMsTUFBbEQsQ0FBQSxDQUFBLElBQThEO1FBQzdFLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBQSxHQUFVLENBQUMsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxNQUFqQixDQUFBLENBQUEsR0FBNEIsWUFBN0IsRUFIMUI7O01BSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsQ0FBZDtNQUVBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixvQ0FBeEIsRUFBOEQsSUFBQyxDQUFBLGlCQUEvRCxDQUFuQjtNQUVBLFFBQUEsR0FBVyxTQUFDLEtBQUQ7UUFDVCxJQUFVLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQWpDLENBQXlDLGVBQXpDLENBQUEsS0FBNkQsTUFBdkU7QUFBQSxpQkFBQTs7UUFDQSxLQUFLLENBQUMsY0FBTixDQUFBO2VBQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtNQUhTO01BS1gsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNuQixjQUFBO1VBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLENBQWxCO1lBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBcUIsQ0FBQyxRQUF0QixDQUFBO1lBQ1AsSUFBQSxDQUFPLElBQVA7cUJBQ0UsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQURGO2FBRkY7O1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQUtBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsUUFBdkI7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXNCLFFBQXRCO01BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixJQUFDLENBQUEsaUJBQW5CO01BRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxPQUFKLEVBQWEsSUFBQyxDQUFBLEtBQWQ7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUI7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDMUIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsS0FBQyxDQUFBLEtBQWY7VUFEMEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7T0FBbkI7SUF0Q1U7OytCQXlDWixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQVUsa0JBQVY7QUFBQSxlQUFBOzthQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFBWSxPQUFBLEVBQVMsS0FBckI7T0FBOUI7SUFGSDs7K0JBSVIsaUJBQUEsR0FBbUIsU0FBQTtNQUNqQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCO01BQ2xCLElBQXlCLElBQUMsQ0FBQSxjQUFELEtBQW1CLENBQTVDO1FBQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBbEI7O2FBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixTQUFBLEdBQVMsQ0FBQyxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQVQsQ0FBVCxHQUFpQyxVQUExRDtJQUppQjs7K0JBTW5CLGlCQUFBLEdBQW1CLFNBQUMsS0FBRDtBQUNqQixVQUFBO01BQUEsS0FBSyxDQUFDLGNBQU4sQ0FBQTtNQUNBLEtBQUssQ0FBQyxlQUFOLENBQUE7TUFDQyxlQUFnQixLQUFLLENBQUM7TUFFdkIsSUFBRyxZQUFZLENBQUMsT0FBYixDQUFxQixZQUFyQixDQUFBLEtBQXNDLE1BQXpDO1FBQ0UsUUFBQSxHQUFXLFlBQVksQ0FBQyxPQUFiLENBQXFCLFlBQXJCO1FBQ1gsSUFBeUIsUUFBekI7aUJBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBVSxRQUFELEdBQVUsR0FBbkIsRUFBQTtTQUZGO09BQUEsTUFHSyxJQUFHLFFBQUEsR0FBVyxZQUFZLENBQUMsT0FBYixDQUFxQixhQUFyQixDQUFkO2VBQ0gsSUFBQyxDQUFBLEtBQUQsQ0FBVSxRQUFELEdBQVUsR0FBbkIsRUFERztPQUFBLE1BRUEsSUFBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQW5CLEdBQTRCLENBQS9CO0FBQ0g7QUFBQTthQUFBLHNDQUFBOzt1QkFDRSxJQUFDLENBQUEsS0FBRCxDQUFVLElBQUksQ0FBQyxJQUFOLEdBQVcsR0FBcEI7QUFERjt1QkFERzs7SUFWWTs7K0JBY25CLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBQyxDQUFBLEdBQWQsQ0FBZixFQUFtQyxJQUFDLENBQUEsS0FBcEMsRUFBMkMsSUFBQyxDQUFBLElBQTVDLEVBQWtELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNoRCxLQUFDLENBQUEsS0FBRCxHQUFTLFNBQUEsR0FBQTtpQkFDVCxLQUFDLENBQUEsTUFBRCxHQUFVLFNBQUEsR0FBQTtRQUZzQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEQ7SUFEYzs7K0JBS2hCLEtBQUEsR0FBTyxTQUFBO0FBQ0wsYUFBTyxJQUFDLENBQUE7SUFESDs7K0JBR1AsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE9BQWUsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFmLEVBQUMsZ0JBQUQsRUFBTztNQUNQLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBQTtNQUVkLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFTO1FBQ3ZCLFdBQUEsRUFBa0IsS0FESztRQUV2QixVQUFBLEVBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsQ0FGSztRQUd2QixNQUFBLElBSHVCO1FBR2pCLE1BQUEsSUFIaUI7T0FBVDtNQU1oQixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLENBQVgsQ0FBZjtJQWJlOzsrQkFlakIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsb0JBQWYsRUFBcUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQ25DLEtBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixJQUFoQjtRQURtQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7TUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxvQkFBZixFQUFxQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDbkMsSUFBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQWQ7bUJBQUEsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFBOztRQURtQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7TUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsR0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFFaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsTUFBYixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDbkIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxJQUFQO1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLHFCQUFmLEVBQXNDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO2lCQUNwQyxLQUFDLENBQUEsT0FBRCxHQUFXO1FBRHlCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBVixDQUFhLE9BQWIsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQ3BCLEtBQUMsQ0FBQSxLQUFELEdBQVM7UUFEVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7YUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNyQixjQUFBO1VBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxvQkFBRCxDQUFBO1VBRUEsSUFBYyxxQ0FBZDtBQUFBLG1CQUFBOztVQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQjtVQUNqQixJQUF1QyxjQUF2QzttQkFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLEVBQUEsR0FBRyxjQUFILEdBQW9CLEVBQUUsQ0FBQyxHQUE5QixFQUFBOztRQU5xQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7SUFqQmU7OytCQXlCakIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQTtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsa0JBQVgsQ0FBOEIsSUFBOUI7TUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BRUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUFGRjtPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxFQUpGOztNQU1BLElBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZ0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUEvQjtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQXZCLENBQW1DLElBQUMsQ0FBQSxVQUFwQyxFQURGOzs7WUFHVyxDQUFFLFNBQWIsQ0FBQTs7a0RBQ1MsQ0FBRSxPQUFYLENBQUE7SUFqQk87OytCQW1CVCxRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFuQztNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQXJCLENBQUE7TUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxNQUFqQixDQUFBO01BQzNCLEdBQUEsR0FBTSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBc0IsTUFBdEI7TUFDTixJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQUVBLElBQUcsSUFBQyxDQUFBLFNBQUo7UUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxXQUFuQixFQUNyQjtVQUFBLEtBQUEsRUFBTyxZQUFQO1NBRHFCO1FBRXZCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWhDO1FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsVUFBZjtRQUNBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLG9CQUFoQixDQUFxQyxDQUFDLFFBQXRDLENBQStDLGtCQUEvQztlQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFOZjtPQUFBLE1BQUE7UUFRRSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsR0FBdUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxXQUFuQixFQUNyQjtVQUFBLEtBQUEsRUFBTyxRQUFQO1NBRHFCO1FBRXZCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWhDO1FBQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsU0FBZjtRQUNBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGtCQUFoQixDQUFtQyxDQUFDLFFBQXBDLENBQTZDLG9CQUE3QztlQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FiZjs7SUFSUTs7K0JBdUJWLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTs7UUFBQSxvQkFBcUIsQ0FBQSxDQUFFLFFBQVEsQ0FBQyxhQUFYOztNQUVyQixJQUFHLGNBQUEsSUFBbUIsY0FBQSxLQUFrQixJQUF4QztRQUNFLElBQUcsY0FBYyxDQUFDLFNBQWxCO1VBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBbkM7VUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFyQixDQUFBO1VBQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFzQixNQUF0QjtVQUVQLElBQUMsQ0FBQSxTQUFELEdBQWEsY0FBYyxDQUFDO1VBQzVCLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1lBQUEsS0FBQSxFQUFPLFFBQVA7V0FEcUI7VUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7VUFDQSxJQUFJLENBQUMsV0FBTCxDQUFpQixrQkFBakIsQ0FBb0MsQ0FBQyxRQUFyQyxDQUE4QyxvQkFBOUM7VUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBVmY7O1FBV0EsY0FBYyxDQUFDLElBQWYsQ0FBQSxFQVpGOztNQWNBLGNBQUEsR0FBaUI7TUFDakIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxxQkFBWCxDQUFpQyxJQUFqQztNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBO01BRUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2YsSUFBRyxDQUFJLEtBQUMsQ0FBQSxNQUFSO1lBQ0UsS0FBQyxDQUFBLE1BQUQsR0FBVTtZQUNWLEtBQUMsQ0FBQSxlQUFELENBQUE7WUFDQSxLQUFDLENBQUEsVUFBRCxHQUFjLEtBQUMsQ0FBQSxVQUFELENBQVksS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBWjttQkFDZCxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxLQUFDLENBQUEsVUFBZixFQUpGO1dBQUEsTUFBQTttQkFNRSxLQUFDLENBQUEsS0FBRCxDQUFBLEVBTkY7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BU0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFpQixJQUFDLENBQUEsU0FBSixHQUFtQixJQUFDLENBQUEsU0FBcEIsR0FBbUMsSUFBQyxDQUFBLFVBQWxEO0lBakNJOzsrQkFtQ04sSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOztZQUFTLENBQUUsSUFBWCxDQUFBOztNQUNBLGNBQUEsR0FBaUI7TUFDakIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLENBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDZixLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtVQUNBLElBQU8sc0JBQVA7WUFDRSxJQUFHLHlCQUFIO2NBQ0UsaUJBQWlCLENBQUMsS0FBbEIsQ0FBQTtxQkFDQSxpQkFBQSxHQUFvQixLQUZ0QjthQURGOztRQUZlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQU9BLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFpQixJQUFDLENBQUEsU0FBSixHQUFtQixJQUFDLENBQUEsU0FBcEIsR0FBbUMsSUFBQyxDQUFBLFVBQWxEO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLENBQWQ7SUFkSTs7K0JBZ0JOLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGVBQUE7O01BRUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFIRjs7SUFITTs7K0JBUVIsS0FBQSxHQUFPLFNBQUMsSUFBRDtNQUNMLElBQWMsb0NBQWQ7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCO1FBQUEsS0FBQSxFQUFPLE9BQVA7UUFBZ0IsSUFBQSxFQUFNLElBQXRCO09BQWpCO0lBSks7OytCQU1QLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxJQUFQO01BQ04sSUFBYyxvQ0FBZDtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCO1FBQUMsS0FBQSxFQUFPLFFBQVI7UUFBa0IsTUFBQSxJQUFsQjtRQUF3QixNQUFBLElBQXhCO09BQWpCO0lBSE07OytCQUtSLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZUFBaEI7TUFFVCxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUE3QjtNQUNBLElBQWtDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBakQ7UUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsY0FBaEIsRUFBQTs7TUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQjtNQUNiLFdBQUEsR0FBYztNQUNkLFlBQUEsR0FBZSxNQUFNLENBQUMsS0FBSyxDQUFDO01BQzVCLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUF4QixHQUFxQyxZQUFBLElBQWdCLFVBQWhCLElBQThCO01BRW5FLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsbUJBQXhCLEVBQTZDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQzlELFVBQUEsR0FBYSxLQUFLLENBQUM7aUJBQ25CLEtBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUF4QixHQUFxQyxZQUFBLElBQWdCLFVBQWhCLElBQThCO1FBRkw7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDLENBQW5CO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixnQ0FBeEIsRUFBMEQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDM0UsWUFBQSxHQUFlLEtBQUssQ0FBQztpQkFDckIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQXhCLEdBQXFDLFlBQUEsSUFBZ0IsVUFBaEIsSUFBOEI7UUFGUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUQsQ0FBbkI7TUFJQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEI7TUFDakIsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDLEtBQUssQ0FBQztNQUNoQyxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBeEIsR0FBcUMsQ0FBQyxnQkFBQSxJQUFvQixjQUFyQixDQUFBLEdBQW9DO01BRXpFLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsaUJBQXhCLEVBQTJDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQzVELGNBQUEsR0FBaUIsS0FBSyxDQUFDO1VBQ3ZCLEtBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUF4QixHQUFxQyxDQUFDLGdCQUFBLElBQW9CLGNBQXJCLENBQUEsR0FBb0M7aUJBQ3pFLEtBQUMsQ0FBQSxvQkFBRCxDQUFBO1FBSDREO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQUFuQjtNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsOEJBQXhCLEVBQXdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQ3pFLGdCQUFBLEdBQW1CLEtBQUssQ0FBQztVQUN6QixLQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBeEIsR0FBcUMsQ0FBQyxnQkFBQSxJQUFvQixjQUFyQixDQUFBLEdBQW9DO2lCQUN6RSxLQUFDLENBQUEsb0JBQUQsQ0FBQTtRQUh5RTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FBbkI7TUFNQSwyREFBeUIsQ0FDdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQS9CLENBQUEsQ0FEdUIsRUFFdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQTdCLENBQUEsQ0FGdUIsRUFHdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQS9CLENBQUEsQ0FIdUIsRUFJdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQWhDLENBQUEsQ0FKdUIsRUFLdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQTlCLENBQUEsQ0FMdUIsRUFNdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWpDLENBQUEsQ0FOdUIsRUFPdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQTlCLENBQUEsQ0FQdUIsRUFRdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQS9CLENBQUEsQ0FSdUIsQ0FBekIsSUFBeUI7YUFXekIsQ0FBQSwyREFBMEIsQ0FDeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQXRDLENBQUEsQ0FEd0IsRUFFeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQXBDLENBQUEsQ0FGd0IsRUFHeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQXRDLENBQUEsQ0FId0IsRUFJeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQXZDLENBQUEsQ0FKd0IsRUFLeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXJDLENBQUEsQ0FMd0IsRUFNeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFdBQXhDLENBQUEsQ0FOd0IsRUFPeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXJDLENBQUEsQ0FQd0IsRUFReEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQXRDLENBQUEsQ0FSd0IsQ0FBMUIsSUFBMEIsSUFBMUI7SUEzQ1U7OytCQXNEWixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsUUFBYixFQUF1QixJQUFDLENBQUEsY0FBeEI7SUFEa0I7OytCQUdwQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxHQUFWLENBQWMsUUFBZCxFQUF3QixJQUFDLENBQUEsY0FBekI7SUFEa0I7OytCQUdwQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxZQUFZLENBQUMsRUFBZCxDQUFpQixXQUFqQixFQUE4QixJQUFDLENBQUEsYUFBL0I7SUFEa0I7OytCQUdwQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixXQUFsQjtJQURrQjs7K0JBR3BCLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLE9BQVI7UUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLEVBQXpCO1FBQ0EsU0FBQSxHQUFZLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUE7UUFDWixXQUFBLEdBQWMsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsS0FBakMsQ0FBQSxDQUF3QyxDQUFDLEdBQXpDLENBQTZDLENBQTdDO1FBQ2QsUUFBQSxHQUFXLFdBQVcsQ0FBQyxZQUFaLEdBQTJCLFdBQVcsQ0FBQztRQUVsRCxLQUFBLEdBQVEsU0FBQSxHQUFZLElBQUMsQ0FBQTtRQUNyQixJQUFDLENBQUEsWUFBRCxHQUFnQjtRQUVoQixJQUFHLElBQUMsQ0FBQSxTQUFKO1VBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUF0QixFQUE2QixJQUFDLENBQUEsU0FBOUI7VUFFVixJQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUF6QjtZQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxFQUFBOztVQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7VUFFYixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQVYsRUFBc0IsSUFBQyxDQUFBLFNBQXZCLEVBTmhCO1NBQUEsTUFPSyxJQUFHLFFBQUEsR0FBVyxDQUFkO1VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQTFCLENBQVQsRUFBMkMsSUFBQyxDQUFBLFNBQTVDO1VBRVYsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7WUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsRUFBQTs7VUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBSlg7O1FBTUwsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixTQUFBLEdBQVMsQ0FBQyxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQVQsQ0FBVCxHQUFpQyxVQUExRCxFQXRCRjs7YUF1QkEsSUFBQyxDQUFBLG9CQUFELENBQUE7SUF4QmM7OytCQTBCaEIsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxNQUFqQixDQUFBO01BQzNCLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixJQUFDLENBQUEsV0FBN0I7TUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsSUFBQyxDQUFBLGFBQTNCO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixFQUF6QjtJQUxhOzsrQkFPZixhQUFBLEdBQWUsU0FBQTtNQUNiLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFdBQWhCLEVBQTZCLElBQUMsQ0FBQSxXQUE5QjtNQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFNBQWhCLEVBQTJCLElBQUMsQ0FBQSxhQUE1QjthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsU0FBQSxHQUFTLENBQUMsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFULENBQVQsR0FBaUMsVUFBMUQ7SUFIYTs7K0JBS2YsVUFBQSxHQUFZLFNBQUMsS0FBRDtBQUNWLFVBQUE7TUFBQSxJQUFBLGNBQU8sUUFBUyxJQUFDLENBQUE7QUFDakIsYUFBTyxJQUFBLEdBQU8sSUFBQyxDQUFBO0lBRkw7OytCQUlaLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxVQUFBO01BQUEsSUFBK0IsS0FBSyxDQUFDLEtBQU4sS0FBZSxDQUE5QztBQUFBLGVBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUFQOztNQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsS0FBSyxDQUFDO01BQ3BDLEtBQUEsR0FBUSxNQUFBLEdBQVMsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsTUFBakMsQ0FBQTtNQUNqQixJQUFBLENBQUEsQ0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBQSxHQUFrQixDQUFDLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBYixHQUFpQixDQUFsQixDQUFoQyxDQUFBO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxVQUFELEdBQWMsS0FBMUIsQ0FBVCxFQUEyQyxJQUFDLENBQUEsU0FBNUM7TUFDVixJQUFVLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBckI7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLE9BQWQ7TUFDQSxDQUFBLENBQUUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFaLENBQW9CLENBQUMsTUFBckIsQ0FBNEIsT0FBNUI7TUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjO2FBRWQsSUFBQyxDQUFBLG9CQUFELENBQUE7SUFkVzs7K0JBZ0JiLFlBQUEsR0FBYyxTQUFDLE1BQUQ7TUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxNQUFkO2FBQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBWixDQUFvQixDQUFDLE1BQXJCLENBQTRCLE1BQTVCO0lBRlk7OytCQUlkLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFiO1FBQ0UsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUFBO1FBQ1gsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUNMLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRGYsRUFDbUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFEdkMsRUFFTCxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUZmLEVBRW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRnZDLEVBRlQ7T0FBQSxNQUFBO1FBTUUsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQWxCLENBQUEsQ0FBZ0MsQ0FBQyxRQUFqQyxDQUFBO1FBQ1YsUUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFSLENBQWMsUUFBZDtRQUNYLEtBQUEsR0FBUSxRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsSUFBRDtpQkFDbkIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEdBQXBCLENBQXdCLENBQUMsU0FBekIsQ0FBQTtRQURtQixDQUFiO1FBRVIsSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQVZUOzthQVdBLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixJQUFyQjtJQVpJOzsrQkFjTixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxLQUFELENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsQ0FBUDtJQURLOzsrQkFHUCxlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBQSxDQUFjLENBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCO01BRWIsSUFBRyxTQUFBLEdBQVksTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUFmO1FBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxhQUFWLENBQUE7ZUFDQSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQUEsR0FBRyxTQUFILEdBQWMsQ0FBSSxVQUFILEdBQW1CLEVBQUUsQ0FBQyxHQUF0QixHQUErQixFQUFoQyxDQUFyQixFQUZGO09BQUEsTUFHSyxJQUFHLE1BQUEsR0FBUyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFaO1FBQ0gsSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixNQUFNLENBQUMsR0FBbkM7UUFDUCxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFHLElBQUgsR0FBUyxDQUFJLFVBQUgsR0FBbUIsRUFBRSxDQUFDLEdBQXRCLEdBQStCLEVBQWhDLENBQWhCO2VBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsQ0FBaEIsRUFKRzs7SUFQVTs7K0JBYWpCLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLG9CQUFELENBQUE7TUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxxQkFBWCxDQUFpQyxJQUFqQzthQUNBLDBDQUFBO0lBSks7OytCQU1QLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLHlDQUFBO0lBRkk7OytCQUlOLGFBQUEsR0FBZSxTQUFBO01BQ2IsSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFmO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQTtNQUNBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFiO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBcEIsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQWxCLENBQUEsRUFIRjs7SUFKYTs7K0JBU2YsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBQTtJQUpZOzsrQkFNZCxvQkFBQSxHQUFzQixTQUFBO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLENBQUEsQ0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFBLElBQXNCLElBQUMsQ0FBQSxPQUFyQyxDQUFBO0FBQUEsZUFBQTs7TUFFQSxPQUFlLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZixFQUFDLGdCQUFELEVBQU87TUFDUCxJQUFBLENBQUEsQ0FBYyxJQUFBLEdBQU8sQ0FBUCxJQUFhLElBQUEsR0FBTyxDQUFsQyxDQUFBO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUNBLElBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEtBQWtCLElBQWxCLElBQTJCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixLQUFrQixJQUF2RDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLEVBQWMsSUFBZDthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFqQixFQUF1QixJQUF2QjtJQVRvQjs7K0JBV3RCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsZ0NBQUY7TUFFVixJQUFHLElBQUMsQ0FBQSxRQUFKO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxXQUFOLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsT0FBMUI7UUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEtBQW5CLENBQUEsQ0FBMkIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxxQkFBOUIsQ0FBQTtRQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsQ0FBQyxPQUFPLENBQUMsS0FBUixJQUFpQixDQUFsQixDQUE1QjtRQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQUEsR0FBa0IsQ0FBQyxPQUFPLENBQUMsTUFBUixJQUFrQixFQUFuQixDQUE3QjtRQUNQLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxNQUFSLENBQUEsRUFORjtPQUFBLE1BQUE7UUFRRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLENBQTVCO1FBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxHQUFrQixFQUE3QixFQVRUOzthQVdBO1FBQUMsTUFBQSxJQUFEO1FBQU8sTUFBQSxJQUFQOztJQWRhOzsrQkFnQmYsZUFBQSxHQUFpQixTQUFDLFFBQUQ7YUFDZixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxxQkFBWCxFQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDaEMsUUFBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxTQUFELEdBQWE7UUFGbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO0lBRGU7OytCQUtqQixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7O1FBQUEsY0FBZSxPQUFBLENBQVEsZ0JBQVI7O01BQ2YsTUFBQSxHQUFhLElBQUEsV0FBQSxDQUFZLElBQVo7YUFDYixNQUFNLENBQUMsTUFBUCxDQUFBO0lBSFc7OytCQUtiLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUE7SUFETTs7K0JBR1IsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFHLElBQUMsQ0FBQSxPQUFKO1FBQ0UsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7VUFBQSxJQUFBLEVBQU0sSUFBTjtVQUFZLE9BQUEsRUFBUyxLQUFyQjtTQUE5QjtRQUNULElBQUMsQ0FBQSxrQkFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUE7UUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFBO2VBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxNQU5iO09BQUEsTUFBQTtRQVFFLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO1FBQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7UUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLEVBQXFCLEVBQXJCO1FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztRQUNYLElBQXlCLGNBQUEsS0FBa0IsSUFBM0M7aUJBQUEsY0FBQSxHQUFpQixLQUFqQjtTQWZGOztJQURhOzsrQkFrQmYsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFBLElBQXlCO0lBRGpCOzsrQkFHVixXQUFBLEdBQWEsU0FBQTthQUNYO0lBRFc7OytCQUdiLFFBQUEsR0FBVSxTQUFBO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUMsQ0FBQSxLQUFmO0lBREM7OytCQUdWLFlBQUEsR0FBYyxTQUFBO0FBQ1osYUFBTyxJQUFDLENBQUE7SUFESTs7K0JBR2QsSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLElBQVI7YUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxLQUFkLEVBQXFCLElBQXJCO0lBREk7OytCQUdOLGdCQUFBLEdBQWtCLFNBQUMsUUFBRDthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQztJQURnQjs7K0JBR2xCLE9BQUEsR0FBUyxTQUFBO0FBQ1AsYUFBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtJQURBOzsrQkFHVCxnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLGFBQU8sSUFBQyxDQUFBLEtBQUQsSUFBVSxJQUFDLENBQUE7SUFERjs7K0JBR2xCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFDLENBQUE7SUFERzs7K0JBR2IsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOzs7O0tBemdCZ0I7QUFkL0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGFzaywgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblB0eSA9IHJlcXVpcmUucmVzb2x2ZSAnLi9wcm9jZXNzJ1xuVGVybWluYWwgPSByZXF1aXJlICd0ZXJtLmpzJ1xuSW5wdXREaWFsb2cgPSBudWxsXG5cbnBhdGggPSByZXF1aXJlICdwYXRoJ1xub3MgPSByZXF1aXJlICdvcydcblxubGFzdE9wZW5lZFZpZXcgPSBudWxsXG5sYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVGVybWluYWxQbHVzVmlldyBleHRlbmRzIFZpZXdcbiAgYW5pbWF0aW5nOiBmYWxzZVxuICBpZDogJydcbiAgbWF4aW1pemVkOiBmYWxzZVxuICBvcGVuZWQ6IGZhbHNlXG4gIHB3ZDogJydcbiAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgcm93SGVpZ2h0OiAyMFxuICBzaGVsbDogJydcbiAgdGFiVmlldzogZmFsc2VcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAndGVybWluYWwtcGx1cyB0ZXJtaW5hbC12aWV3Jywgb3V0bGV0OiAndGVybWluYWxQbHVzVmlldycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncGFuZWwtZGl2aWRlcicsIG91dGxldDogJ3BhbmVsRGl2aWRlcidcbiAgICAgIEBkaXYgY2xhc3M6ICdidG4tdG9vbGJhcicsIG91dGxldDondG9vbGJhcicsID0+XG4gICAgICAgIEBidXR0b24gb3V0bGV0OiAnY2xvc2VCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgcmlnaHQnLCBjbGljazogJ2Rlc3Ryb3knLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLXgnXG4gICAgICAgIEBidXR0b24gb3V0bGV0OiAnaGlkZUJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCByaWdodCcsIGNsaWNrOiAnaGlkZScsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpY29uIGljb24tY2hldnJvbi1kb3duJ1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ21heGltaXplQnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IHJpZ2h0JywgY2xpY2s6ICdtYXhpbWl6ZScsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpY29uIGljb24tc2NyZWVuLWZ1bGwnXG4gICAgICAgIEBidXR0b24gb3V0bGV0OiAnaW5wdXRCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgbGVmdCcsIGNsaWNrOiAnaW5wdXREaWFsb2cnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLWtleWJvYXJkJ1xuICAgICAgQGRpdiBjbGFzczogJ3h0ZXJtJywgb3V0bGV0OiAneHRlcm0nXG5cbiAgQGdldEZvY3VzZWRUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gVGVybWluYWwuVGVybWluYWwuZm9jdXNcblxuICBpbml0aWFsaXplOiAoQGlkLCBAcHdkLCBAc3RhdHVzSWNvbiwgQHN0YXR1c0JhciwgQHNoZWxsLCBAYXJncz1bXSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBjbG9zZUJ0bixcbiAgICAgIHRpdGxlOiAnQ2xvc2UnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBoaWRlQnRuLFxuICAgICAgdGl0bGU6ICdIaWRlJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICBAaW5wdXRCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBpbnB1dEJ0bixcbiAgICAgIHRpdGxlOiAnSW5zZXJ0IFRleHQnXG5cbiAgICBAcHJldkhlaWdodCA9IGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy5zdHlsZS5kZWZhdWx0UGFuZWxIZWlnaHQnKVxuICAgIGlmIEBwcmV2SGVpZ2h0LmluZGV4T2YoJyUnKSA+IDBcbiAgICAgIHBlcmNlbnQgPSBNYXRoLmFicyhNYXRoLm1pbihwYXJzZUZsb2F0KEBwcmV2SGVpZ2h0KSAvIDEwMC4wLCAxKSlcbiAgICAgIGJvdHRvbUhlaWdodCA9ICQoJ2F0b20tcGFuZWwuYm90dG9tJykuY2hpbGRyZW4oXCIudGVybWluYWwtdmlld1wiKS5oZWlnaHQoKSBvciAwXG4gICAgICBAcHJldkhlaWdodCA9IHBlcmNlbnQgKiAoJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKSArIGJvdHRvbUhlaWdodClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICAgIEBzZXRBbmltYXRpb25TcGVlZCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0ZXJtaW5hbC1wbHVzLnN0eWxlLmFuaW1hdGlvblNwZWVkJywgQHNldEFuaW1hdGlvblNwZWVkXG5cbiAgICBvdmVycmlkZSA9IChldmVudCkgLT5cbiAgICAgIHJldHVybiBpZiBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hbC1wbHVzJykgaXMgJ3RydWUnXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgQHh0ZXJtLm9uICdtb3VzZXVwJywgKGV2ZW50KSA9PlxuICAgICAgaWYgZXZlbnQud2hpY2ggIT0gM1xuICAgICAgICB0ZXh0ID0gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgICAgdW5sZXNzIHRleHRcbiAgICAgICAgICBAZm9jdXMoKVxuICAgIEB4dGVybS5vbiAnZHJhZ2VudGVyJywgb3ZlcnJpZGVcbiAgICBAeHRlcm0ub24gJ2RyYWdvdmVyJywgb3ZlcnJpZGVcbiAgICBAeHRlcm0ub24gJ2Ryb3AnLCBAcmVjaWV2ZUl0ZW1PckZpbGVcblxuICAgIEBvbiAnZm9jdXMnLCBAZm9jdXNcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogPT5cbiAgICAgIEBvZmYgJ2ZvY3VzJywgQGZvY3VzXG5cbiAgYXR0YWNoOiAtPlxuICAgIHJldHVybiBpZiBAcGFuZWw/XG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG5cbiAgc2V0QW5pbWF0aW9uU3BlZWQ6ID0+XG4gICAgQGFuaW1hdGlvblNwZWVkID0gYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnN0eWxlLmFuaW1hdGlvblNwZWVkJylcbiAgICBAYW5pbWF0aW9uU3BlZWQgPSAxMDAgaWYgQGFuaW1hdGlvblNwZWVkIGlzIDBcblxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIHJlY2lldmVJdGVtT3JGaWxlOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG5cbiAgICBpZiBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnYXRvbS1ldmVudCcpIGlzICd0cnVlJ1xuICAgICAgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIiBpZiBmaWxlUGF0aFxuICAgIGVsc2UgaWYgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnaW5pdGlhbFBhdGgnKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCJcbiAgICBlbHNlIGlmIGRhdGFUcmFuc2Zlci5maWxlcy5sZW5ndGggPiAwXG4gICAgICBmb3IgZmlsZSBpbiBkYXRhVHJhbnNmZXIuZmlsZXNcbiAgICAgICAgQGlucHV0IFwiI3tmaWxlLnBhdGh9IFwiXG5cbiAgZm9ya1B0eVByb2Nlc3M6IC0+XG4gICAgVGFzay5vbmNlIFB0eSwgcGF0aC5yZXNvbHZlKEBwd2QpLCBAc2hlbGwsIEBhcmdzLCA9PlxuICAgICAgQGlucHV0ID0gLT5cbiAgICAgIEByZXNpemUgPSAtPlxuXG4gIGdldElkOiAtPlxuICAgIHJldHVybiBAaWRcblxuICBkaXNwbGF5VGVybWluYWw6IC0+XG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIEBwdHlQcm9jZXNzID0gQGZvcmtQdHlQcm9jZXNzKClcblxuICAgIEB0ZXJtaW5hbCA9IG5ldyBUZXJtaW5hbCB7XG4gICAgICBjdXJzb3JCbGluayAgICAgOiBmYWxzZVxuICAgICAgc2Nyb2xsYmFjayAgICAgIDogYXRvbS5jb25maWcuZ2V0ICd0ZXJtaW5hbC1wbHVzLmNvcmUuc2Nyb2xsYmFjaydcbiAgICAgIGNvbHMsIHJvd3NcbiAgICB9XG5cbiAgICBAYXR0YWNoTGlzdGVuZXJzKClcbiAgICBAYXR0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAYXR0YWNoV2luZG93RXZlbnRzKClcbiAgICBAdGVybWluYWwub3BlbiBAeHRlcm0uZ2V0KDApXG5cbiAgYXR0YWNoTGlzdGVuZXJzOiAtPlxuICAgIEBwdHlQcm9jZXNzLm9uIFwidGVybWluYWwtcGx1czpkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgQHRlcm1pbmFsLndyaXRlIGRhdGFcblxuICAgIEBwdHlQcm9jZXNzLm9uIFwidGVybWluYWwtcGx1czpleGl0XCIsID0+XG4gICAgICBAZGVzdHJveSgpIGlmIGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy50b2dnbGVzLmF1dG9DbG9zZScpXG5cbiAgICBAdGVybWluYWwuZW5kID0gPT4gQGRlc3Ryb3koKVxuXG4gICAgQHRlcm1pbmFsLm9uIFwiZGF0YVwiLCAoZGF0YSkgPT5cbiAgICAgIEBpbnB1dCBkYXRhXG5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInRlcm1pbmFsLXBsdXM6dGl0bGVcIiwgKHRpdGxlKSA9PlxuICAgICAgQHByb2Nlc3MgPSB0aXRsZVxuICAgIEB0ZXJtaW5hbC5vbiBcInRpdGxlXCIsICh0aXRsZSkgPT5cbiAgICAgIEB0aXRsZSA9IHRpdGxlXG5cbiAgICBAdGVybWluYWwub25jZSBcIm9wZW5cIiwgPT5cbiAgICAgIEBhcHBseVN0eWxlKClcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuICAgICAgYXV0b1J1bkNvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMuY29yZS5hdXRvUnVuQ29tbWFuZCcpXG4gICAgICBAaW5wdXQgXCIje2F1dG9SdW5Db21tYW5kfSN7b3MuRU9MfVwiIGlmIGF1dG9SdW5Db21tYW5kXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAc3RhdHVzSWNvbi5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyLnJlbW92ZVRlcm1pbmFsVmlldyB0aGlzXG4gICAgQGRldGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGRldGFjaFdpbmRvd0V2ZW50cygpXG5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBoaWRlKClcbiAgICAgIEBvblRyYW5zaXRpb25FbmQgPT4gQHBhbmVsLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcblxuICAgIGlmIEBzdGF0dXNJY29uIGFuZCBAc3RhdHVzSWNvbi5wYXJlbnROb2RlXG4gICAgICBAc3RhdHVzSWNvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKEBzdGF0dXNJY29uKVxuXG4gICAgQHB0eVByb2Nlc3M/LnRlcm1pbmF0ZSgpXG4gICAgQHRlcm1pbmFsPy5kZXN0cm95KClcblxuICBtYXhpbWl6ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICBAbWF4aW1pemVCdG4udG9vbHRpcC5kaXNwb3NlKClcblxuICAgIEBtYXhIZWlnaHQgPSBAcHJldkhlaWdodCArICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KClcbiAgICBidG4gPSBAbWF4aW1pemVCdG4uY2hpbGRyZW4oJ3NwYW4nKVxuICAgIEBvblRyYW5zaXRpb25FbmQgPT4gQGZvY3VzKClcblxuICAgIGlmIEBtYXhpbWl6ZWRcbiAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICB0aXRsZTogJ0Z1bGxzY3JlZW4nXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgIEBhZGp1c3RIZWlnaHQgQHByZXZIZWlnaHRcbiAgICAgIGJ0bi5yZW1vdmVDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKVxuICAgICAgQG1heGltaXplZCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgIHRpdGxlOiAnTm9ybWFsJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICBAYWRqdXN0SGVpZ2h0IEBtYXhIZWlnaHRcbiAgICAgIGJ0bi5yZW1vdmVDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKVxuICAgICAgQG1heGltaXplZCA9IHRydWVcblxuICBvcGVuOiA9PlxuICAgIGxhc3RBY3RpdmVFbGVtZW50ID89ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcblxuICAgIGlmIGxhc3RPcGVuZWRWaWV3IGFuZCBsYXN0T3BlbmVkVmlldyAhPSB0aGlzXG4gICAgICBpZiBsYXN0T3BlbmVkVmlldy5tYXhpbWl6ZWRcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwLmRpc3Bvc2UoKVxuICAgICAgICBpY29uID0gQG1heGltaXplQnRuLmNoaWxkcmVuKCdzcGFuJylcblxuICAgICAgICBAbWF4SGVpZ2h0ID0gbGFzdE9wZW5lZFZpZXcubWF4SGVpZ2h0XG4gICAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICAgIHRpdGxlOiAnTm9ybWFsJ1xuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgICAgaWNvbi5yZW1vdmVDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKVxuICAgICAgICBAbWF4aW1pemVkID0gdHJ1ZVxuICAgICAgbGFzdE9wZW5lZFZpZXcuaGlkZSgpXG5cbiAgICBsYXN0T3BlbmVkVmlldyA9IHRoaXNcbiAgICBAc3RhdHVzQmFyLnNldEFjdGl2ZVRlcm1pbmFsVmlldyB0aGlzXG4gICAgQHN0YXR1c0ljb24uYWN0aXZhdGUoKVxuXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PlxuICAgICAgaWYgbm90IEBvcGVuZWRcbiAgICAgICAgQG9wZW5lZCA9IHRydWVcbiAgICAgICAgQGRpc3BsYXlUZXJtaW5hbCgpXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gQG5lYXJlc3RSb3coQHh0ZXJtLmhlaWdodCgpKVxuICAgICAgICBAeHRlcm0uaGVpZ2h0KEBwcmV2SGVpZ2h0KVxuICAgICAgZWxzZVxuICAgICAgICBAZm9jdXMoKVxuXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEB4dGVybS5oZWlnaHQgMFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHh0ZXJtLmhlaWdodCBpZiBAbWF4aW1pemVkIHRoZW4gQG1heEhlaWdodCBlbHNlIEBwcmV2SGVpZ2h0XG5cbiAgaGlkZTogPT5cbiAgICBAdGVybWluYWw/LmJsdXIoKVxuICAgIGxhc3RPcGVuZWRWaWV3ID0gbnVsbFxuICAgIEBzdGF0dXNJY29uLmRlYWN0aXZhdGUoKVxuXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PlxuICAgICAgQHBhbmVsLmhpZGUoKVxuICAgICAgdW5sZXNzIGxhc3RPcGVuZWRWaWV3P1xuICAgICAgICBpZiBsYXN0QWN0aXZlRWxlbWVudD9cbiAgICAgICAgICBsYXN0QWN0aXZlRWxlbWVudC5mb2N1cygpXG4gICAgICAgICAgbGFzdEFjdGl2ZUVsZW1lbnQgPSBudWxsXG5cbiAgICBAeHRlcm0uaGVpZ2h0IGlmIEBtYXhpbWl6ZWQgdGhlbiBAbWF4SGVpZ2h0IGVsc2UgQHByZXZIZWlnaHRcbiAgICBAYW5pbWF0aW5nID0gdHJ1ZVxuICAgIEB4dGVybS5oZWlnaHQgMFxuXG4gIHRvZ2dsZTogLT5cbiAgICByZXR1cm4gaWYgQGFuaW1hdGluZ1xuXG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAaGlkZSgpXG4gICAgZWxzZVxuICAgICAgQG9wZW4oKVxuXG4gIGlucHV0OiAoZGF0YSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cblxuICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICBAcHR5UHJvY2Vzcy5zZW5kIGV2ZW50OiAnaW5wdXQnLCB0ZXh0OiBkYXRhXG5cbiAgcmVzaXplOiAoY29scywgcm93cykgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cblxuICAgIEBwdHlQcm9jZXNzLnNlbmQge2V2ZW50OiAncmVzaXplJywgcm93cywgY29sc31cblxuICBhcHBseVN0eWxlOiAtPlxuICAgIGNvbmZpZyA9IGF0b20uY29uZmlnLmdldCAndGVybWluYWwtcGx1cydcblxuICAgIEB4dGVybS5hZGRDbGFzcyBjb25maWcuc3R5bGUudGhlbWVcbiAgICBAeHRlcm0uYWRkQ2xhc3MgJ2N1cnNvci1ibGluaycgaWYgY29uZmlnLnRvZ2dsZXMuY3Vyc29yQmxpbmtcblxuICAgIGVkaXRvckZvbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBkZWZhdWx0Rm9udCA9IFwiTWVubG8sIENvbnNvbGFzLCAnRGVqYVZ1IFNhbnMgTW9ubycsIG1vbm9zcGFjZVwiXG4gICAgb3ZlcnJpZGVGb250ID0gY29uZmlnLnN0eWxlLmZvbnRGYW1pbHlcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRGYW1pbHknLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndGVybWluYWwtcGx1cy5zdHlsZS5mb250RmFtaWx5JywgKGV2ZW50KSA9PlxuICAgICAgb3ZlcnJpZGVGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgZWRpdG9yRm9udFNpemUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpXG4gICAgb3ZlcnJpZGVGb250U2l6ZSA9IGNvbmZpZy5zdHlsZS5mb250U2l6ZVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250U2l6ZSA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICd0ZXJtaW5hbC1wbHVzLnN0eWxlLmZvbnRTaXplJywgKGV2ZW50KSA9PlxuICAgICAgb3ZlcnJpZGVGb250U2l6ZSA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgICAjIGZpcnN0IDggY29sb3JzIGkuZS4gJ2RhcmsnIGNvbG9yc1xuICAgIEB0ZXJtaW5hbC5jb2xvcnNbMC4uN10gPSBbXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuYmxhY2sudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLnJlZC50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuZ3JlZW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLnllbGxvdy50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuYmx1ZS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwubWFnZW50YS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwuY3lhbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwud2hpdGUudG9IZXhTdHJpbmcoKVxuICAgIF1cbiAgICAjICdicmlnaHQnIGNvbG9yc1xuICAgIEB0ZXJtaW5hbC5jb2xvcnNbOC4uMTVdID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFJlZC50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0WWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0Qmx1ZS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodE1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRDeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0V2hpdGUudG9IZXhTdHJpbmcoKVxuICAgIF1cblxuICBhdHRhY2hXaW5kb3dFdmVudHM6IC0+XG4gICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBkZXRhY2hXaW5kb3dFdmVudHM6IC0+XG4gICAgJCh3aW5kb3cpLm9mZiAncmVzaXplJywgQG9uV2luZG93UmVzaXplXG5cbiAgYXR0YWNoUmVzaXplRXZlbnRzOiAtPlxuICAgIEBwYW5lbERpdmlkZXIub24gJ21vdXNlZG93bicsIEByZXNpemVTdGFydGVkXG5cbiAgZGV0YWNoUmVzaXplRXZlbnRzOiAtPlxuICAgIEBwYW5lbERpdmlkZXIub2ZmICdtb3VzZWRvd24nXG5cbiAgb25XaW5kb3dSZXNpemU6ID0+XG4gICAgaWYgbm90IEB0YWJWaWV3XG4gICAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgJydcbiAgICAgIG5ld0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuICAgICAgYm90dG9tUGFuZWwgPSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5ib3R0b20nKS5maXJzdCgpLmdldCgwKVxuICAgICAgb3ZlcmZsb3cgPSBib3R0b21QYW5lbC5zY3JvbGxIZWlnaHQgLSBib3R0b21QYW5lbC5vZmZzZXRIZWlnaHRcblxuICAgICAgZGVsdGEgPSBuZXdIZWlnaHQgLSBAd2luZG93SGVpZ2h0XG4gICAgICBAd2luZG93SGVpZ2h0ID0gbmV3SGVpZ2h0XG5cbiAgICAgIGlmIEBtYXhpbWl6ZWRcbiAgICAgICAgY2xhbXBlZCA9IE1hdGgubWF4KEBtYXhIZWlnaHQgKyBkZWx0YSwgQHJvd0hlaWdodClcblxuICAgICAgICBAYWRqdXN0SGVpZ2h0IGNsYW1wZWQgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICAgIEBtYXhIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICAgICAgQHByZXZIZWlnaHQgPSBNYXRoLm1pbihAcHJldkhlaWdodCwgQG1heEhlaWdodClcbiAgICAgIGVsc2UgaWYgb3ZlcmZsb3cgPiAwXG4gICAgICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbmVhcmVzdFJvdyhAcHJldkhlaWdodCArIGRlbHRhKSwgQHJvd0hlaWdodClcblxuICAgICAgICBAYWRqdXN0SGVpZ2h0IGNsYW1wZWQgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gIHJlc2l6ZVN0YXJ0ZWQ6ID0+XG4gICAgcmV0dXJuIGlmIEBtYXhpbWl6ZWRcbiAgICBAbWF4SGVpZ2h0ID0gQHByZXZIZWlnaHQgKyAkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCAnJ1xuXG4gIHJlc2l6ZVN0b3BwZWQ6ID0+XG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBAcmVzaXplUGFuZWwpXG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG5cbiAgbmVhcmVzdFJvdzogKHZhbHVlKSAtPlxuICAgIHJvd3MgPSB2YWx1ZSAvLyBAcm93SGVpZ2h0XG4gICAgcmV0dXJuIHJvd3MgKiBAcm93SGVpZ2h0XG5cbiAgcmVzaXplUGFuZWw6IChldmVudCkgPT5cbiAgICByZXR1cm4gQHJlc2l6ZVN0b3BwZWQoKSB1bmxlc3MgZXZlbnQud2hpY2ggaXMgMVxuXG4gICAgbW91c2VZID0gJCh3aW5kb3cpLmhlaWdodCgpIC0gZXZlbnQucGFnZVlcbiAgICBkZWx0YSA9IG1vdXNlWSAtICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmJvdHRvbScpLmhlaWdodCgpXG4gICAgcmV0dXJuIHVubGVzcyBNYXRoLmFicyhkZWx0YSkgPiAoQHJvd0hlaWdodCAqIDUgLyA2KVxuXG4gICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuICAgIHJldHVybiBpZiBjbGFtcGVkID4gQG1heEhlaWdodFxuXG4gICAgQHh0ZXJtLmhlaWdodCBjbGFtcGVkXG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGNsYW1wZWRcbiAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgYWRqdXN0SGVpZ2h0OiAoaGVpZ2h0KSAtPlxuICAgIEB4dGVybS5oZWlnaHQgaGVpZ2h0XG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGhlaWdodFxuXG4gIGNvcHk6IC0+XG4gICAgaWYgQHRlcm1pbmFsLl9zZWxlY3RlZFxuICAgICAgdGV4dGFyZWEgPSBAdGVybWluYWwuZ2V0Q29weVRleHRhcmVhKClcbiAgICAgIHRleHQgPSBAdGVybWluYWwuZ3JhYlRleHQoXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDIsXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTIpXG4gICAgZWxzZVxuICAgICAgcmF3VGV4dCA9IEB0ZXJtaW5hbC5jb250ZXh0LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgIHJhd0xpbmVzID0gcmF3VGV4dC5zcGxpdCgvXFxyP1xcbi9nKVxuICAgICAgbGluZXMgPSByYXdMaW5lcy5tYXAgKGxpbmUpIC0+XG4gICAgICAgIGxpbmUucmVwbGFjZSgvXFxzL2csIFwiIFwiKS50cmltUmlnaHQoKVxuICAgICAgdGV4dCA9IGxpbmVzLmpvaW4oXCJcXG5cIilcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSB0ZXh0XG5cbiAgcGFzdGU6IC0+XG4gICAgQGlucHV0IGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIGluc2VydFNlbGVjdGlvbjogLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJ1bkNvbW1hbmQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMudG9nZ2xlcy5ydW5JbnNlcnRlZFRleHQnKVxuXG4gICAgaWYgc2VsZWN0aW9uID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgICBAaW5wdXQgXCIje3NlbGVjdGlvbn0je2lmIHJ1bkNvbW1hbmQgdGhlbiBvcy5FT0wgZWxzZSAnJ31cIlxuICAgIGVsc2UgaWYgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcbiAgICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICAgIEBpbnB1dCBcIiN7bGluZX0je2lmIHJ1bkNvbW1hbmQgdGhlbiBvcy5FT0wgZWxzZSAnJ31cIlxuICAgICAgZWRpdG9yLm1vdmVEb3duKDEpO1xuXG4gIGZvY3VzOiA9PlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG4gICAgQGZvY3VzVGVybWluYWwoKVxuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3KHRoaXMpXG4gICAgc3VwZXIoKVxuXG4gIGJsdXI6ID0+XG4gICAgQGJsdXJUZXJtaW5hbCgpXG4gICAgc3VwZXIoKVxuXG4gIGZvY3VzVGVybWluYWw6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcblxuICAgIEB0ZXJtaW5hbC5mb2N1cygpXG4gICAgaWYgQHRlcm1pbmFsLl90ZXh0YXJlYVxuICAgICAgQHRlcm1pbmFsLl90ZXh0YXJlYS5mb2N1cygpXG4gICAgZWxzZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuZm9jdXMoKVxuXG4gIGJsdXJUZXJtaW5hbDogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgQHRlcm1pbmFsLmJsdXIoKVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LmJsdXIoKVxuXG4gIHJlc2l6ZVRlcm1pbmFsVG9WaWV3OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhbmVsLmlzVmlzaWJsZSgpIG9yIEB0YWJWaWV3XG5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgcmV0dXJuIHVubGVzcyBjb2xzID4gMCBhbmQgcm93cyA+IDBcbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuICAgIHJldHVybiBpZiBAdGVybWluYWwucm93cyBpcyByb3dzIGFuZCBAdGVybWluYWwuY29scyBpcyBjb2xzXG5cbiAgICBAcmVzaXplIGNvbHMsIHJvd3NcbiAgICBAdGVybWluYWwucmVzaXplIGNvbHMsIHJvd3NcblxuICBnZXREaW1lbnNpb25zOiAtPlxuICAgIGZha2VSb3cgPSAkKFwiPGRpdj48c3Bhbj4mbmJzcDs8L3NwYW4+PC9kaXY+XCIpXG5cbiAgICBpZiBAdGVybWluYWxcbiAgICAgIEBmaW5kKCcudGVybWluYWwnKS5hcHBlbmQgZmFrZVJvd1xuICAgICAgZmFrZUNvbCA9IGZha2VSb3cuY2hpbGRyZW4oKS5maXJzdCgpWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAeHRlcm0ud2lkdGgoKSAvIChmYWtlQ29sLndpZHRoIG9yIDkpXG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAeHRlcm0uaGVpZ2h0KCkgLyAoZmFrZUNvbC5oZWlnaHQgb3IgMjApXG4gICAgICBAcm93SGVpZ2h0ID0gZmFrZUNvbC5oZWlnaHRcbiAgICAgIGZha2VSb3cucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAeHRlcm0ud2lkdGgoKSAvIDlcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEB4dGVybS5oZWlnaHQoKSAvIDIwXG5cbiAgICB7Y29scywgcm93c31cblxuICBvblRyYW5zaXRpb25FbmQ6IChjYWxsYmFjaykgLT5cbiAgICBAeHRlcm0ub25lICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgPT5cbiAgICAgIGNhbGxiYWNrKClcbiAgICAgIEBhbmltYXRpbmcgPSBmYWxzZVxuXG4gIGlucHV0RGlhbG9nOiAtPlxuICAgIElucHV0RGlhbG9nID89IHJlcXVpcmUoJy4vaW5wdXQtZGlhbG9nJylcbiAgICBkaWFsb2cgPSBuZXcgSW5wdXREaWFsb2cgdGhpc1xuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIHJlbmFtZTogLT5cbiAgICBAc3RhdHVzSWNvbi5yZW5hbWUoKVxuXG4gIHRvZ2dsZVRhYlZpZXc6IC0+XG4gICAgaWYgQHRhYlZpZXdcbiAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuICAgICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgICBAY2xvc2VCdG4uc2hvdygpXG4gICAgICBAaGlkZUJ0bi5zaG93KClcbiAgICAgIEBtYXhpbWl6ZUJ0bi5zaG93KClcbiAgICAgIEB0YWJWaWV3ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgICBAZGV0YWNoUmVzaXplRXZlbnRzKClcbiAgICAgIEBjbG9zZUJ0bi5oaWRlKClcbiAgICAgIEBoaWRlQnRuLmhpZGUoKVxuICAgICAgQG1heGltaXplQnRuLmhpZGUoKVxuICAgICAgQHh0ZXJtLmNzcyBcImhlaWdodFwiLCBcIlwiXG4gICAgICBAdGFiVmlldyA9IHRydWVcbiAgICAgIGxhc3RPcGVuZWRWaWV3ID0gbnVsbCBpZiBsYXN0T3BlbmVkVmlldyA9PSB0aGlzXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgQHN0YXR1c0ljb24uZ2V0TmFtZSgpIG9yIFwiVGVybWluYWwtUGx1c1wiXG5cbiAgZ2V0SWNvbk5hbWU6IC0+XG4gICAgXCJ0ZXJtaW5hbFwiXG5cbiAgZ2V0U2hlbGw6IC0+XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUgQHNoZWxsXG5cbiAgZ2V0U2hlbGxQYXRoOiAtPlxuICAgIHJldHVybiBAc2hlbGxcblxuICBlbWl0OiAoZXZlbnQsIGRhdGEpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCBldmVudCwgZGF0YVxuXG4gIG9uRGlkQ2hhbmdlVGl0bGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrXG5cbiAgZ2V0UGF0aDogLT5cbiAgICByZXR1cm4gQGdldFRlcm1pbmFsVGl0bGUoKVxuXG4gIGdldFRlcm1pbmFsVGl0bGU6IC0+XG4gICAgcmV0dXJuIEB0aXRsZSBvciBAcHJvY2Vzc1xuXG4gIGdldFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBAdGVybWluYWxcblxuICBpc0FuaW1hdGluZzogLT5cbiAgICByZXR1cm4gQGFuaW1hdGluZ1xuIl19
