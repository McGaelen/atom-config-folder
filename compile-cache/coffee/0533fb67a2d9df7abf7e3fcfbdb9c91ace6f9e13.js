(function() {
  var $, CompositeDisposable, Emitter, InputDialog, PlatformIOTerminalView, Pty, Task, Terminal, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
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

  module.exports = PlatformIOTerminalView = (function(superClass) {
    extend(PlatformIOTerminalView, superClass);

    function PlatformIOTerminalView() {
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
      return PlatformIOTerminalView.__super__.constructor.apply(this, arguments);
    }

    PlatformIOTerminalView.prototype.animating = false;

    PlatformIOTerminalView.prototype.id = '';

    PlatformIOTerminalView.prototype.maximized = false;

    PlatformIOTerminalView.prototype.opened = false;

    PlatformIOTerminalView.prototype.pwd = '';

    PlatformIOTerminalView.prototype.windowHeight = $(window).height();

    PlatformIOTerminalView.prototype.rowHeight = 20;

    PlatformIOTerminalView.prototype.shell = '';

    PlatformIOTerminalView.prototype.tabView = false;

    PlatformIOTerminalView.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal terminal-view',
        outlet: 'platformIOTerminalView'
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

    PlatformIOTerminalView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    PlatformIOTerminalView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args, autoRun) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.autoRun = autoRun != null ? autoRun : [];
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
      this.prevHeight = atom.config.get('platformio-ide-terminal.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') === 'true') {
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
            if (atom.config.get('platformio-ide-terminal.toggles.selectToCopy') && text) {
              atom.clipboard.write(text);
            }
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

    PlatformIOTerminalView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    PlatformIOTerminalView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('platformio-ide-terminal.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.recieveItemOrFile = function(event) {
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

    PlatformIOTerminalView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.getId = function() {
      return this.id;
    };

    PlatformIOTerminalView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('platformio-ide-terminal.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    PlatformIOTerminalView.prototype.attachListeners = function() {
      this.ptyProcess.on("platformio-ide-terminal:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:exit", (function(_this) {
        return function() {
          if (atom.config.get('platformio-ide-terminal.toggles.autoClose')) {
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
      this.ptyProcess.on("platformio-ide-terminal:title", (function(_this) {
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
          var autoRunCommand, command, i, len, ref2, results;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('platformio-ide-terminal.core.autoRunCommand');
          if (autoRunCommand) {
            _this.input("" + autoRunCommand + os.EOL);
          }
          ref2 = _this.autoRun;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            command = ref2[i];
            results.push(_this.input("" + command + os.EOL));
          }
          return results;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.destroy = function() {
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

    PlatformIOTerminalView.prototype.maximize = function() {
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

    PlatformIOTerminalView.prototype.open = function() {
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
            _this.xterm.height(_this.prevHeight);
            return _this.emit("platformio-ide-terminal:terminal-open");
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

    PlatformIOTerminalView.prototype.hide = function() {
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

    PlatformIOTerminalView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    PlatformIOTerminalView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    PlatformIOTerminalView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    PlatformIOTerminalView.prototype.pty = function() {
      var wait;
      if (!this.opened) {
        wait = new Promise((function(_this) {
          return function(resolve, reject) {
            _this.emitter.on("platformio-ide-terminal:terminal-open", function() {
              return resolve();
            });
            return setTimeout(reject, 1000);
          };
        })(this));
        return wait.then((function(_this) {
          return function() {
            return _this.ptyPromise();
          };
        })(this));
      } else {
        return this.ptyPromise();
      }
    };

    PlatformIOTerminalView.prototype.ptyPromise = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          if (_this.ptyProcess != null) {
            _this.ptyProcess.on("platformio-ide-terminal:pty", function(pty) {
              return resolve(pty);
            });
            _this.ptyProcess.send({
              event: 'pty'
            });
            return setTimeout(reject, 1000);
          } else {
            return reject();
          }
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('platformio-ide-terminal');
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
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontFamily', (function(_this) {
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
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    PlatformIOTerminalView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    PlatformIOTerminalView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    PlatformIOTerminalView.prototype.onWindowResize = function() {
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

    PlatformIOTerminalView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    PlatformIOTerminalView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    PlatformIOTerminalView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height() - $('atom-panel-container.footer').height();
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

    PlatformIOTerminalView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    PlatformIOTerminalView.prototype.copy = function() {
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

    PlatformIOTerminalView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    PlatformIOTerminalView.prototype.insertSelection = function(customText) {
      var cursor, editor, line, ref2, ref3, ref4, ref5, runCommand, selection, selectionText;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('platformio-ide-terminal.toggles.runInsertedText');
      selectionText = '';
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        selectionText = selection;
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        selectionText = line;
        editor.moveDown(1);
      }
      return this.input("" + (customText.replace(/\$L/, "" + (editor.getCursorBufferPosition().row + 1)).replace(/\$F/, path.basename(editor != null ? (ref4 = editor.buffer) != null ? (ref5 = ref4.file) != null ? ref5.path : void 0 : void 0 : void 0)).replace(/\$D/, path.dirname(editor != null ? (ref2 = editor.buffer) != null ? (ref3 = ref2.file) != null ? ref3.path : void 0 : void 0 : void 0)).replace(/\$S/, selectionText).replace(/\$\$/, '$')) + (runCommand ? os.EOL : ''));
    };

    PlatformIOTerminalView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return PlatformIOTerminalView.__super__.focus.call(this);
    };

    PlatformIOTerminalView.prototype.blur = function() {
      this.blurTerminal();
      return PlatformIOTerminalView.__super__.blur.call(this);
    };

    PlatformIOTerminalView.prototype.focusTerminal = function() {
      if (!this.terminal) {
        return;
      }
      lastActiveElement = $(document.activeElement);
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    PlatformIOTerminalView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      this.terminal.element.blur();
      if (lastActiveElement != null) {
        return lastActiveElement.focus();
      }
    };

    PlatformIOTerminalView.prototype.resizeTerminalToView = function() {
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

    PlatformIOTerminalView.prototype.getDimensions = function() {
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

    PlatformIOTerminalView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    PlatformIOTerminalView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    PlatformIOTerminalView.prototype.toggleTabView = function() {
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

    PlatformIOTerminalView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "platformio-ide-terminal";
    };

    PlatformIOTerminalView.prototype.getIconName = function() {
      return "terminal";
    };

    PlatformIOTerminalView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    PlatformIOTerminalView.prototype.getShellPath = function() {
      return this.shell;
    };

    PlatformIOTerminalView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    PlatformIOTerminalView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    PlatformIOTerminalView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    PlatformIOTerminalView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    PlatformIOTerminalView.prototype.getTerminal = function() {
      return this.terminal;
    };

    PlatformIOTerminalView.prototype.isAnimating = function() {
      return this.animating;
    };

    return PlatformIOTerminalView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC9saWIvdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVKQUFBO0lBQUE7Ozs7RUFBQSxNQUF1QyxPQUFBLENBQVEsTUFBUixDQUF2QyxFQUFDLGVBQUQsRUFBTyw2Q0FBUCxFQUE0Qjs7RUFDNUIsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFVBQUQsRUFBSTs7RUFFSixHQUFBLEdBQU0sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztFQUNYLFdBQUEsR0FBYzs7RUFFZCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLGNBQUEsR0FBaUI7O0VBQ2pCLGlCQUFBLEdBQW9COztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQUNKLFNBQUEsR0FBVzs7cUNBQ1gsRUFBQSxHQUFJOztxQ0FDSixTQUFBLEdBQVc7O3FDQUNYLE1BQUEsR0FBUTs7cUNBQ1IsR0FBQSxHQUFLOztxQ0FDTCxZQUFBLEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQTs7cUNBQ2QsU0FBQSxHQUFXOztxQ0FDWCxLQUFBLEdBQU87O3FDQUNQLE9BQUEsR0FBUzs7SUFFVCxzQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sdUNBQVA7UUFBZ0QsTUFBQSxFQUFRLHdCQUF4RDtPQUFMLEVBQXVGLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNyRixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxl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dWlyZSAnYXRvbSdcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5QdHkgPSByZXF1aXJlLnJlc29sdmUgJy4vcHJvY2VzcydcblRlcm1pbmFsID0gcmVxdWlyZSAndGVybS5qcydcbklucHV0RGlhbG9nID0gbnVsbFxuXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG5cbmxhc3RPcGVuZWRWaWV3ID0gbnVsbFxubGFzdEFjdGl2ZUVsZW1lbnQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBsYXRmb3JtSU9UZXJtaW5hbFZpZXcgZXh0ZW5kcyBWaWV3XG4gIGFuaW1hdGluZzogZmFsc2VcbiAgaWQ6ICcnXG4gIG1heGltaXplZDogZmFsc2VcbiAgb3BlbmVkOiBmYWxzZVxuICBwd2Q6ICcnXG4gIHdpbmRvd0hlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpXG4gIHJvd0hlaWdodDogMjBcbiAgc2hlbGw6ICcnXG4gIHRhYlZpZXc6IGZhbHNlXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsIHRlcm1pbmFsLXZpZXcnLCBvdXRsZXQ6ICdwbGF0Zm9ybUlPVGVybWluYWxWaWV3JywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1kaXZpZGVyJywgb3V0bGV0OiAncGFuZWxEaXZpZGVyJ1xuICAgICAgQGRpdiBjbGFzczogJ2J0bi10b29sYmFyJywgb3V0bGV0Oid0b29sYmFyJywgPT5cbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdjbG9zZUJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCByaWdodCcsIGNsaWNrOiAnZGVzdHJveScsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpY29uIGljb24teCdcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdoaWRlQnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IHJpZ2h0JywgY2xpY2s6ICdoaWRlJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1jaGV2cm9uLWRvd24nXG4gICAgICAgIEBidXR0b24gb3V0bGV0OiAnbWF4aW1pemVCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgcmlnaHQnLCBjbGljazogJ21heGltaXplJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1zY3JlZW4tZnVsbCdcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdpbnB1dEJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCBsZWZ0JywgY2xpY2s6ICdpbnB1dERpYWxvZycsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpY29uIGljb24ta2V5Ym9hcmQnXG4gICAgICBAZGl2IGNsYXNzOiAneHRlcm0nLCBvdXRsZXQ6ICd4dGVybSdcblxuICBAZ2V0Rm9jdXNlZFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBUZXJtaW5hbC5UZXJtaW5hbC5mb2N1c1xuXG4gIGluaXRpYWxpemU6IChAaWQsIEBwd2QsIEBzdGF0dXNJY29uLCBAc3RhdHVzQmFyLCBAc2hlbGwsIEBhcmdzPVtdLCBAYXV0b1J1bj1bXSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBjbG9zZUJ0bixcbiAgICAgIHRpdGxlOiAnQ2xvc2UnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBoaWRlQnRuLFxuICAgICAgdGl0bGU6ICdIaWRlJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICBAaW5wdXRCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBpbnB1dEJ0bixcbiAgICAgIHRpdGxlOiAnSW5zZXJ0IFRleHQnXG5cbiAgICBAcHJldkhlaWdodCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZGVmYXVsdFBhbmVsSGVpZ2h0JylcbiAgICBpZiBAcHJldkhlaWdodC5pbmRleE9mKCclJykgPiAwXG4gICAgICBwZXJjZW50ID0gTWF0aC5hYnMoTWF0aC5taW4ocGFyc2VGbG9hdChAcHJldkhlaWdodCkgLyAxMDAuMCwgMSkpXG4gICAgICBib3R0b21IZWlnaHQgPSAkKCdhdG9tLXBhbmVsLmJvdHRvbScpLmNoaWxkcmVuKFwiLnRlcm1pbmFsLXZpZXdcIikuaGVpZ2h0KCkgb3IgMFxuICAgICAgQHByZXZIZWlnaHQgPSBwZXJjZW50ICogKCQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KCkgKyBib3R0b21IZWlnaHQpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgICBAc2V0QW5pbWF0aW9uU3BlZWQoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuYW5pbWF0aW9uU3BlZWQnLCBAc2V0QW5pbWF0aW9uU3BlZWRcblxuICAgIG92ZXJyaWRlID0gKGV2ZW50KSAtPlxuICAgICAgcmV0dXJuIGlmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJykgaXMgJ3RydWUnXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgQHh0ZXJtLm9uICdtb3VzZXVwJywgKGV2ZW50KSA9PlxuICAgICAgaWYgZXZlbnQud2hpY2ggIT0gM1xuICAgICAgICB0ZXh0ID0gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dCkgaWYgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLnNlbGVjdFRvQ29weScpIGFuZCB0ZXh0XG4gICAgICAgIHVubGVzcyB0ZXh0XG4gICAgICAgICAgQGZvY3VzKClcbiAgICBAeHRlcm0ub24gJ2RyYWdlbnRlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcmFnb3ZlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcm9wJywgQHJlY2lldmVJdGVtT3JGaWxlXG5cbiAgICBAb24gJ2ZvY3VzJywgQGZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6ID0+XG4gICAgICBAb2ZmICdmb2N1cycsIEBmb2N1c1xuXG4gIGF0dGFjaDogLT5cbiAgICByZXR1cm4gaWYgQHBhbmVsP1xuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuXG4gIHNldEFuaW1hdGlvblNwZWVkOiA9PlxuICAgIEBhbmltYXRpb25TcGVlZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuYW5pbWF0aW9uU3BlZWQnKVxuICAgIEBhbmltYXRpb25TcGVlZCA9IDEwMCBpZiBAYW5pbWF0aW9uU3BlZWQgaXMgMFxuXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG5cbiAgcmVjaWV2ZUl0ZW1PckZpbGU6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnRcblxuICAgIGlmIGRhdGFUcmFuc2Zlci5nZXREYXRhKCdhdG9tLWV2ZW50JykgaXMgJ3RydWUnXG4gICAgICBmaWxlUGF0aCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXh0L3BsYWluJylcbiAgICAgIEBpbnB1dCBcIiN7ZmlsZVBhdGh9IFwiIGlmIGZpbGVQYXRoXG4gICAgZWxzZSBpZiBmaWxlUGF0aCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCdpbml0aWFsUGF0aCcpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIlxuICAgIGVsc2UgaWYgZGF0YVRyYW5zZmVyLmZpbGVzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBmaWxlIGluIGRhdGFUcmFuc2Zlci5maWxlc1xuICAgICAgICBAaW5wdXQgXCIje2ZpbGUucGF0aH0gXCJcblxuICBmb3JrUHR5UHJvY2VzczogLT5cbiAgICBUYXNrLm9uY2UgUHR5LCBwYXRoLnJlc29sdmUoQHB3ZCksIEBzaGVsbCwgQGFyZ3MsID0+XG4gICAgICBAaW5wdXQgPSAtPlxuICAgICAgQHJlc2l6ZSA9IC0+XG5cbiAgZ2V0SWQ6IC0+XG4gICAgcmV0dXJuIEBpZFxuXG4gIGRpc3BsYXlUZXJtaW5hbDogLT5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgQHB0eVByb2Nlc3MgPSBAZm9ya1B0eVByb2Nlc3MoKVxuXG4gICAgQHRlcm1pbmFsID0gbmV3IFRlcm1pbmFsIHtcbiAgICAgIGN1cnNvckJsaW5rICAgICA6IGZhbHNlXG4gICAgICBzY3JvbGxiYWNrICAgICAgOiBhdG9tLmNvbmZpZy5nZXQgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmNvcmUuc2Nyb2xsYmFjaydcbiAgICAgIGNvbHMsIHJvd3NcbiAgICB9XG5cbiAgICBAYXR0YWNoTGlzdGVuZXJzKClcbiAgICBAYXR0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAYXR0YWNoV2luZG93RXZlbnRzKClcbiAgICBAdGVybWluYWwub3BlbiBAeHRlcm0uZ2V0KDApXG5cbiAgYXR0YWNoTGlzdGVuZXJzOiAtPlxuICAgIEBwdHlQcm9jZXNzLm9uIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZGF0YVwiLCAoZGF0YSkgPT5cbiAgICAgIEB0ZXJtaW5hbC53cml0ZSBkYXRhXG5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmV4aXRcIiwgPT5cbiAgICAgIEBkZXN0cm95KCkgaWYgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLmF1dG9DbG9zZScpXG5cbiAgICBAdGVybWluYWwuZW5kID0gPT4gQGRlc3Ryb3koKVxuXG4gICAgQHRlcm1pbmFsLm9uIFwiZGF0YVwiLCAoZGF0YSkgPT5cbiAgICAgIEBpbnB1dCBkYXRhXG5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnRpdGxlXCIsICh0aXRsZSkgPT5cbiAgICAgIEBwcm9jZXNzID0gdGl0bGVcbiAgICBAdGVybWluYWwub24gXCJ0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAdGl0bGUgPSB0aXRsZVxuXG4gICAgQHRlcm1pbmFsLm9uY2UgXCJvcGVuXCIsID0+XG4gICAgICBAYXBwbHlTdHlsZSgpXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gICAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cbiAgICAgIGF1dG9SdW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLmF1dG9SdW5Db21tYW5kJylcbiAgICAgIEBpbnB1dCBcIiN7YXV0b1J1bkNvbW1hbmR9I3tvcy5FT0x9XCIgaWYgYXV0b1J1bkNvbW1hbmRcbiAgICAgIEBpbnB1dCBcIiN7Y29tbWFuZH0je29zLkVPTH1cIiBmb3IgY29tbWFuZCBpbiBAYXV0b1J1blxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHN0YXR1c0ljb24uZGVzdHJveSgpXG4gICAgQHN0YXR1c0Jhci5yZW1vdmVUZXJtaW5hbFZpZXcgdGhpc1xuICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuICAgIEBkZXRhY2hXaW5kb3dFdmVudHMoKVxuXG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAaGlkZSgpXG4gICAgICBAb25UcmFuc2l0aW9uRW5kID0+IEBwYW5lbC5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgICBpZiBAc3RhdHVzSWNvbiBhbmQgQHN0YXR1c0ljb24ucGFyZW50Tm9kZVxuICAgICAgQHN0YXR1c0ljb24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChAc3RhdHVzSWNvbilcblxuICAgIEBwdHlQcm9jZXNzPy50ZXJtaW5hdGUoKVxuICAgIEB0ZXJtaW5hbD8uZGVzdHJveSgpXG5cbiAgbWF4aW1pemU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG5cbiAgICBAbWF4SGVpZ2h0ID0gQHByZXZIZWlnaHQgKyAkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpXG4gICAgYnRuID0gQG1heGltaXplQnRuLmNoaWxkcmVuKCdzcGFuJylcbiAgICBAb25UcmFuc2l0aW9uRW5kID0+IEBmb2N1cygpXG5cbiAgICBpZiBAbWF4aW1pemVkXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICBAYWRqdXN0SGVpZ2h0IEBwcmV2SGVpZ2h0XG4gICAgICBidG4ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1mdWxsJylcbiAgICAgIEBtYXhpbWl6ZWQgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICB0aXRsZTogJ05vcm1hbCdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAbWF4SGVpZ2h0XG4gICAgICBidG4ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJylcbiAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG5cbiAgb3BlbjogPT5cbiAgICBsYXN0QWN0aXZlRWxlbWVudCA/PSAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG5cbiAgICBpZiBsYXN0T3BlbmVkVmlldyBhbmQgbGFzdE9wZW5lZFZpZXcgIT0gdGhpc1xuICAgICAgaWYgbGFzdE9wZW5lZFZpZXcubWF4aW1pemVkXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBAbWF4aW1pemVCdG4udG9vbHRpcC5kaXNwb3NlKClcbiAgICAgICAgaWNvbiA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG5cbiAgICAgICAgQG1heEhlaWdodCA9IGxhc3RPcGVuZWRWaWV3Lm1heEhlaWdodFxuICAgICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgICB0aXRsZTogJ05vcm1hbCdcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICAgIGljb24ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJylcbiAgICAgICAgQG1heGltaXplZCA9IHRydWVcbiAgICAgIGxhc3RPcGVuZWRWaWV3LmhpZGUoKVxuXG4gICAgbGFzdE9wZW5lZFZpZXcgPSB0aGlzXG4gICAgQHN0YXR1c0Jhci5zZXRBY3RpdmVUZXJtaW5hbFZpZXcgdGhpc1xuICAgIEBzdGF0dXNJY29uLmFjdGl2YXRlKClcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIGlmIG5vdCBAb3BlbmVkXG4gICAgICAgIEBvcGVuZWQgPSB0cnVlXG4gICAgICAgIEBkaXNwbGF5VGVybWluYWwoKVxuICAgICAgICBAcHJldkhlaWdodCA9IEBuZWFyZXN0Um93KEB4dGVybS5oZWlnaHQoKSlcbiAgICAgICAgQHh0ZXJtLmhlaWdodChAcHJldkhlaWdodClcbiAgICAgICAgQGVtaXQgXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0ZXJtaW5hbC1vcGVuXCJcbiAgICAgIGVsc2VcbiAgICAgICAgQGZvY3VzKClcblxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcbiAgICBAYW5pbWF0aW5nID0gdHJ1ZVxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuXG4gIGhpZGU6ID0+XG4gICAgQHRlcm1pbmFsPy5ibHVyKClcbiAgICBsYXN0T3BlbmVkVmlldyA9IG51bGxcbiAgICBAc3RhdHVzSWNvbi5kZWFjdGl2YXRlKClcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIEBwYW5lbC5oaWRlKClcbiAgICAgIHVubGVzcyBsYXN0T3BlbmVkVmlldz9cbiAgICAgICAgaWYgbGFzdEFjdGl2ZUVsZW1lbnQ/XG4gICAgICAgICAgbGFzdEFjdGl2ZUVsZW1lbnQuZm9jdXMoKVxuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50ID0gbnVsbFxuXG4gICAgQHh0ZXJtLmhlaWdodCBpZiBAbWF4aW1pemVkIHRoZW4gQG1heEhlaWdodCBlbHNlIEBwcmV2SGVpZ2h0XG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICB0b2dnbGU6IC0+XG4gICAgcmV0dXJuIGlmIEBhbmltYXRpbmdcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICBpbnB1dDogKGRhdGEpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG5cbiAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgQHB0eVByb2Nlc3Muc2VuZCBldmVudDogJ2lucHV0JywgdGV4dDogZGF0YVxuXG4gIHJlc2l6ZTogKGNvbHMsIHJvd3MpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG5cbiAgICBAcHR5UHJvY2Vzcy5zZW5kIHtldmVudDogJ3Jlc2l6ZScsIHJvd3MsIGNvbHN9XG5cbiAgcHR5OiAoKSAtPlxuICAgIGlmIG5vdCBAb3BlbmVkXG4gICAgICB3YWl0ID0gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgQGVtaXR0ZXIub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0ZXJtaW5hbC1vcGVuXCIsICgpID0+XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIHNldFRpbWVvdXQgcmVqZWN0LCAxMDAwXG5cbiAgICAgIHdhaXQudGhlbiAoKSA9PlxuICAgICAgICBAcHR5UHJvbWlzZSgpXG4gICAgZWxzZVxuICAgICAgQHB0eVByb21pc2UoKVxuXG4gIHB0eVByb21pc2U6ICgpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIGlmIEBwdHlQcm9jZXNzP1xuICAgICAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnB0eVwiLCAocHR5KSA9PlxuICAgICAgICAgIHJlc29sdmUocHR5KVxuICAgICAgICBAcHR5UHJvY2Vzcy5zZW5kIHtldmVudDogJ3B0eSd9XG4gICAgICAgIHNldFRpbWVvdXQgcmVqZWN0LCAxMDAwXG4gICAgICBlbHNlXG4gICAgICAgIHJlamVjdCgpXG5cbiAgYXBwbHlTdHlsZTogLT5cbiAgICBjb25maWcgPSBhdG9tLmNvbmZpZy5nZXQgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJ1xuXG4gICAgQHh0ZXJtLmFkZENsYXNzIGNvbmZpZy5zdHlsZS50aGVtZVxuICAgIEB4dGVybS5hZGRDbGFzcyAnY3Vyc29yLWJsaW5rJyBpZiBjb25maWcudG9nZ2xlcy5jdXJzb3JCbGlua1xuXG4gICAgZWRpdG9yRm9udCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKVxuICAgIGRlZmF1bHRGb250ID0gXCJNZW5sbywgQ29uc29sYXMsICdEZWphVnUgU2FucyBNb25vJywgbW9ub3NwYWNlXCJcbiAgICBvdmVycmlkZUZvbnQgPSBjb25maWcuc3R5bGUuZm9udEZhbWlseVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnQgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5mb250RmFtaWx5JywgKGV2ZW50KSA9PlxuICAgICAgb3ZlcnJpZGVGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgZWRpdG9yRm9udFNpemUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpXG4gICAgb3ZlcnJpZGVGb250U2l6ZSA9IGNvbmZpZy5zdHlsZS5mb250U2l6ZVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250U2l6ZSA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5mb250U2l6ZScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gICAgIyBmaXJzdCA4IGNvbG9ycyBpLmUuICdkYXJrJyBjb2xvcnNcbiAgICBAdGVybWluYWwuY29sb3JzWzAuLjddID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5yZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC55ZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLm1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLndoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG4gICAgIyAnYnJpZ2h0JyBjb2xvcnNcbiAgICBAdGVybWluYWwuY29sb3JzWzguLjE1XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0QmxhY2sudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRSZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRHcmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFllbGxvdy50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRNYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0Q3lhbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFdoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG5cbiAgYXR0YWNoV2luZG93RXZlbnRzOiAtPlxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgQG9uV2luZG93UmVzaXplXG5cbiAgZGV0YWNoV2luZG93RXZlbnRzOiAtPlxuICAgICQod2luZG93KS5vZmYgJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGF0dGFjaFJlc2l6ZUV2ZW50czogLT5cbiAgICBAcGFuZWxEaXZpZGVyLm9uICdtb3VzZWRvd24nLCBAcmVzaXplU3RhcnRlZFxuXG4gIGRldGFjaFJlc2l6ZUV2ZW50czogLT5cbiAgICBAcGFuZWxEaXZpZGVyLm9mZiAnbW91c2Vkb3duJ1xuXG4gIG9uV2luZG93UmVzaXplOiA9PlxuICAgIGlmIG5vdCBAdGFiVmlld1xuICAgICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG4gICAgICBuZXdIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICAgIGJvdHRvbVBhbmVsID0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuZmlyc3QoKS5nZXQoMClcbiAgICAgIG92ZXJmbG93ID0gYm90dG9tUGFuZWwuc2Nyb2xsSGVpZ2h0IC0gYm90dG9tUGFuZWwub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGRlbHRhID0gbmV3SGVpZ2h0IC0gQHdpbmRvd0hlaWdodFxuICAgICAgQHdpbmRvd0hlaWdodCA9IG5ld0hlaWdodFxuXG4gICAgICBpZiBAbWF4aW1pemVkXG4gICAgICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbWF4SGVpZ2h0ICsgZGVsdGEsIEByb3dIZWlnaHQpXG5cbiAgICAgICAgQGFkanVzdEhlaWdodCBjbGFtcGVkIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgICBAbWF4SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gTWF0aC5taW4oQHByZXZIZWlnaHQsIEBtYXhIZWlnaHQpXG4gICAgICBlbHNlIGlmIG92ZXJmbG93ID4gMFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG5lYXJlc3RSb3coQHByZXZIZWlnaHQgKyBkZWx0YSksIEByb3dIZWlnaHQpXG5cbiAgICAgICAgQGFkanVzdEhlaWdodCBjbGFtcGVkIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICByZXNpemVTdGFydGVkOiA9PlxuICAgIHJldHVybiBpZiBAbWF4aW1pemVkXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAcmVzaXplUGFuZWwpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgJydcblxuICByZXNpemVTdG9wcGVkOiA9PlxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIG5lYXJlc3RSb3c6ICh2YWx1ZSkgLT5cbiAgICByb3dzID0gdmFsdWUgLy8gQHJvd0hlaWdodFxuICAgIHJldHVybiByb3dzICogQHJvd0hlaWdodFxuXG4gIHJlc2l6ZVBhbmVsOiAoZXZlbnQpID0+XG4gICAgcmV0dXJuIEByZXNpemVTdG9wcGVkKCkgdW5sZXNzIGV2ZW50LndoaWNoIGlzIDFcblxuICAgIG1vdXNlWSA9ICQod2luZG93KS5oZWlnaHQoKSAtIGV2ZW50LnBhZ2VZXG4gICAgZGVsdGEgPSBtb3VzZVkgLSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5ib3R0b20nKS5oZWlnaHQoKSAtICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmZvb3RlcicpLmhlaWdodCgpXG4gICAgcmV0dXJuIHVubGVzcyBNYXRoLmFicyhkZWx0YSkgPiAoQHJvd0hlaWdodCAqIDUgLyA2KVxuXG4gICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuICAgIHJldHVybiBpZiBjbGFtcGVkID4gQG1heEhlaWdodFxuXG4gICAgQHh0ZXJtLmhlaWdodCBjbGFtcGVkXG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGNsYW1wZWRcbiAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgYWRqdXN0SGVpZ2h0OiAoaGVpZ2h0KSAtPlxuICAgIEB4dGVybS5oZWlnaHQgaGVpZ2h0XG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGhlaWdodFxuXG4gIGNvcHk6IC0+XG4gICAgaWYgQHRlcm1pbmFsLl9zZWxlY3RlZFxuICAgICAgdGV4dGFyZWEgPSBAdGVybWluYWwuZ2V0Q29weVRleHRhcmVhKClcbiAgICAgIHRleHQgPSBAdGVybWluYWwuZ3JhYlRleHQoXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDIsXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTIpXG4gICAgZWxzZVxuICAgICAgcmF3VGV4dCA9IEB0ZXJtaW5hbC5jb250ZXh0LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgIHJhd0xpbmVzID0gcmF3VGV4dC5zcGxpdCgvXFxyP1xcbi9nKVxuICAgICAgbGluZXMgPSByYXdMaW5lcy5tYXAgKGxpbmUpIC0+XG4gICAgICAgIGxpbmUucmVwbGFjZSgvXFxzL2csIFwiIFwiKS50cmltUmlnaHQoKVxuICAgICAgdGV4dCA9IGxpbmVzLmpvaW4oXCJcXG5cIilcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSB0ZXh0XG5cbiAgcGFzdGU6IC0+XG4gICAgQGlucHV0IGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIGluc2VydFNlbGVjdGlvbjogKGN1c3RvbVRleHQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBydW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLnJ1bkluc2VydGVkVGV4dCcpXG4gICAgc2VsZWN0aW9uVGV4dCA9ICcnXG4gICAgaWYgc2VsZWN0aW9uID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgICBzZWxlY3Rpb25UZXh0ID0gc2VsZWN0aW9uXG4gICAgZWxzZSBpZiBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhjdXJzb3Iucm93KVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgc2VsZWN0aW9uVGV4dCA9IGxpbmVcbiAgICAgIGVkaXRvci5tb3ZlRG93bigxKTtcbiAgICBAaW5wdXQgXCIje2N1c3RvbVRleHQuXG4gICAgICByZXBsYWNlKC9cXCRMLywgXCIje2VkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyArIDF9XCIpLlxuICAgICAgcmVwbGFjZSgvXFwkRi8sIHBhdGguYmFzZW5hbWUoZWRpdG9yPy5idWZmZXI/LmZpbGU/LnBhdGgpKS5cbiAgICAgIHJlcGxhY2UoL1xcJEQvLCBwYXRoLmRpcm5hbWUoZWRpdG9yPy5idWZmZXI/LmZpbGU/LnBhdGgpKS5cbiAgICAgIHJlcGxhY2UoL1xcJFMvLCBzZWxlY3Rpb25UZXh0KS5cbiAgICAgIHJlcGxhY2UoL1xcJFxcJC8sICckJyl9I3tpZiBydW5Db21tYW5kIHRoZW4gb3MuRU9MIGVsc2UgJyd9XCJcblxuICBmb2N1czogPT5cbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBmb2N1c1Rlcm1pbmFsKClcbiAgICBAc3RhdHVzQmFyLnNldEFjdGl2ZVRlcm1pbmFsVmlldyh0aGlzKVxuICAgIHN1cGVyKClcblxuICBibHVyOiA9PlxuICAgIEBibHVyVGVybWluYWwoKVxuICAgIHN1cGVyKClcblxuICBmb2N1c1Rlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG5cbiAgICBsYXN0QWN0aXZlRWxlbWVudCA9ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcblxuICAgIEB0ZXJtaW5hbC5mb2N1cygpXG4gICAgaWYgQHRlcm1pbmFsLl90ZXh0YXJlYVxuICAgICAgQHRlcm1pbmFsLl90ZXh0YXJlYS5mb2N1cygpXG4gICAgZWxzZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuZm9jdXMoKVxuXG4gIGJsdXJUZXJtaW5hbDogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgQHRlcm1pbmFsLmJsdXIoKVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LmJsdXIoKVxuXG4gICAgaWYgbGFzdEFjdGl2ZUVsZW1lbnQ/XG4gICAgICBsYXN0QWN0aXZlRWxlbWVudC5mb2N1cygpXG5cbiAgcmVzaXplVGVybWluYWxUb1ZpZXc6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcGFuZWwuaXNWaXNpYmxlKCkgb3IgQHRhYlZpZXdcblxuICAgIHtjb2xzLCByb3dzfSA9IEBnZXREaW1lbnNpb25zKClcbiAgICByZXR1cm4gdW5sZXNzIGNvbHMgPiAwIGFuZCByb3dzID4gMFxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG4gICAgcmV0dXJuIGlmIEB0ZXJtaW5hbC5yb3dzIGlzIHJvd3MgYW5kIEB0ZXJtaW5hbC5jb2xzIGlzIGNvbHNcblxuICAgIEByZXNpemUgY29scywgcm93c1xuICAgIEB0ZXJtaW5hbC5yZXNpemUgY29scywgcm93c1xuXG4gIGdldERpbWVuc2lvbnM6IC0+XG4gICAgZmFrZVJvdyA9ICQoXCI8ZGl2PjxzcGFuPiZuYnNwOzwvc3Bhbj48L2Rpdj5cIilcblxuICAgIGlmIEB0ZXJtaW5hbFxuICAgICAgQGZpbmQoJy50ZXJtaW5hbCcpLmFwcGVuZCBmYWtlUm93XG4gICAgICBmYWtlQ29sID0gZmFrZVJvdy5jaGlsZHJlbigpLmZpcnN0KClbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbHMgPSBNYXRoLmZsb29yIEB4dGVybS53aWR0aCgpIC8gKGZha2VDb2wud2lkdGggb3IgOSlcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEB4dGVybS5oZWlnaHQoKSAvIChmYWtlQ29sLmhlaWdodCBvciAyMClcbiAgICAgIEByb3dIZWlnaHQgPSBmYWtlQ29sLmhlaWdodFxuICAgICAgZmFrZVJvdy5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgIGNvbHMgPSBNYXRoLmZsb29yIEB4dGVybS53aWR0aCgpIC8gOVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gMjBcblxuICAgIHtjb2xzLCByb3dzfVxuXG4gIG9uVHJhbnNpdGlvbkVuZDogKGNhbGxiYWNrKSAtPlxuICAgIEB4dGVybS5vbmUgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCA9PlxuICAgICAgY2FsbGJhY2soKVxuICAgICAgQGFuaW1hdGluZyA9IGZhbHNlXG5cbiAgaW5wdXREaWFsb2c6IC0+XG4gICAgSW5wdXREaWFsb2cgPz0gcmVxdWlyZSgnLi9pbnB1dC1kaWFsb2cnKVxuICAgIGRpYWxvZyA9IG5ldyBJbnB1dERpYWxvZyB0aGlzXG4gICAgZGlhbG9nLmF0dGFjaCgpXG5cbiAgcmVuYW1lOiAtPlxuICAgIEBzdGF0dXNJY29uLnJlbmFtZSgpXG5cbiAgdG9nZ2xlVGFiVmlldzogLT5cbiAgICBpZiBAdGFiVmlld1xuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgICBAYXR0YWNoUmVzaXplRXZlbnRzKClcbiAgICAgIEBjbG9zZUJ0bi5zaG93KClcbiAgICAgIEBoaWRlQnRuLnNob3coKVxuICAgICAgQG1heGltaXplQnRuLnNob3coKVxuICAgICAgQHRhYlZpZXcgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLmhpZGUoKVxuICAgICAgQGhpZGVCdG4uaGlkZSgpXG4gICAgICBAbWF4aW1pemVCdG4uaGlkZSgpXG4gICAgICBAeHRlcm0uY3NzIFwiaGVpZ2h0XCIsIFwiXCJcbiAgICAgIEB0YWJWaWV3ID0gdHJ1ZVxuICAgICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsIGlmIGxhc3RPcGVuZWRWaWV3ID09IHRoaXNcblxuICBnZXRUaXRsZTogLT5cbiAgICBAc3RhdHVzSWNvbi5nZXROYW1lKCkgb3IgXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbFwiXG5cbiAgZ2V0SWNvbk5hbWU6IC0+XG4gICAgXCJ0ZXJtaW5hbFwiXG5cbiAgZ2V0U2hlbGw6IC0+XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUgQHNoZWxsXG5cbiAgZ2V0U2hlbGxQYXRoOiAtPlxuICAgIHJldHVybiBAc2hlbGxcblxuICBlbWl0OiAoZXZlbnQsIGRhdGEpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCBldmVudCwgZGF0YVxuXG4gIG9uRGlkQ2hhbmdlVGl0bGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrXG5cbiAgZ2V0UGF0aDogLT5cbiAgICByZXR1cm4gQGdldFRlcm1pbmFsVGl0bGUoKVxuXG4gIGdldFRlcm1pbmFsVGl0bGU6IC0+XG4gICAgcmV0dXJuIEB0aXRsZSBvciBAcHJvY2Vzc1xuXG4gIGdldFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBAdGVybWluYWxcblxuICBpc0FuaW1hdGluZzogLT5cbiAgICByZXR1cm4gQGFuaW1hdGluZ1xuIl19
