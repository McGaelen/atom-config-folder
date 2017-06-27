(function() {
  var BufferedProcess, Emitter, GDB, RESULT, parser, ref, ref1;

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Emitter = ref.Emitter;

  ref1 = require('./gdb-mi-parser'), RESULT = ref1.RESULT, parser = ref1.parser;

  module.exports = GDB = (function() {
    var STATUS;

    STATUS = {
      NOTHING: 0,
      RUNNING: 1
    };

    function GDB(target) {
      var args, command, stderr, stdout;
      this.token = 0;
      this.handler = {};
      this.emitter = new Emitter;
      stdout = (function(_this) {
        return function(lines) {
          var clazz, i, len, line, ref2, ref3, ref4, result, results, token;
          ref2 = lines.split('\n');
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            line = ref2[i];
            switch (line[0]) {
              case '+':
                results.push(null);
                break;
              case '=':
                results.push(null);
                break;
              case '~':
                results.push(null);
                break;
              case '@':
                results.push(null);
                break;
              case '&':
                results.push(null);
                break;
              case '*':
                ref3 = parser.parse(line.substr(1)), clazz = ref3.clazz, result = ref3.result;
                _this.emitter.emit('exec-async-output', {
                  clazz: clazz,
                  result: result
                });
                if (clazz === RESULT.RUNNING) {
                  _this.emitter.emit("exec-async-running", result);
                }
                if (clazz === RESULT.STOPPED) {
                  results.push(_this.emitter.emit("exec-async-stopped", result));
                } else {
                  results.push(void 0);
                }
                break;
              default:
                if (line[0] <= '9' && line[0] >= '0') {
                  ref4 = parser.parse(line), token = ref4.token, clazz = ref4.clazz, result = ref4.result;
                  _this.handler[token](clazz, result);
                  results.push(delete _this.handler[token]);
                } else {
                  results.push(void 0);
                }
            }
          }
          return results;
        };
      })(this);
      stderr = (function(_this) {
        return function(lines) {};
      })(this);
      command = 'gdb';
      args = ['--interpreter=mi2', target];
      console.log("target", target);
      this.process = new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr
      }).process;
      this.stdin = this.process.stdin;
      this.status = STATUS.NOTHING;
    }

    GDB.prototype.destroy = function() {
      this.process.kill();
      return this.emitter.dispose();
    };

    GDB.prototype.onExecAsyncOutput = function(callback) {
      return this.emitter.on('exec-async-output', callback);
    };

    GDB.prototype.onExecAsyncStopped = function(callback) {
      return this.emitter.on('exec-async-stopped', callback);
    };

    GDB.prototype.onExecAsyncRunning = function(callback) {
      return this.emitter.on('exec-async-running', callback);
    };

    GDB.prototype.listFiles = function(handler) {
      return this.postCommand('file-list-exec-source-files', (function(_this) {
        return function(clazz, result) {
          var file, files, i, len, ref2;
          files = [];
          if (clazz === RESULT.DONE) {
            ref2 = result.files;
            for (i = 0, len = ref2.length; i < len; i++) {
              file = ref2[i];
              files.push(file.fullname);
            }
          }
          return handler(files);
        };
      })(this));
    };

    GDB.prototype.listExecFile = function(handler) {
      return this.postCommand('file-list-exec-source-file', (function(_this) {
        return function(clazz, result) {
          var file;
          file = null;
          if (clazz === RESULT.DONE) {
            file = result;
          }
          return handler(file);
        };
      })(this));
    };

    GDB.prototype.setSourceDirectories = function(directories, handler) {
      var args, command, directory, i, len;
      args = [];
      for (i = 0, len = directories.length; i < len; i++) {
        directory = directories[i];
        args.push("\"" + directory + "\"");
      }
      command = 'environment-directory ' + args.join(' ');
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.DONE);
        };
      })(this));
    };

    GDB.prototype.listBreaks = function(handler) {
      return this.postCommand('break-list', (function(_this) {
        return function(clazz, result) {
          var breaks;
          breaks = [];
          if (clazz === RESULT.DONE && result.BreakpointTable.body.bkpt) {
            breaks = result.BreakpointTable.body.bkpt;
          }
          return handler(breaks);
        };
      })(this));
    };

    GDB.prototype.deleteBreak = function(number, handler) {
      var command;
      command = "break-delete " + number;
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.DONE);
        };
      })(this));
    };

    GDB.prototype.disassembleData = function(arg, handler) {
      var address, args, command, file, mode;
      address = arg.address, file = arg.file, mode = arg.mode;
      args = [];
      if (address) {
        args.push("-s " + address.start);
        args.push("-e " + address.end);
      } else if (file) {
        args.push("-f " + file.name);
        args.push("-l " + file.linenum);
        if (file.lines) {
          args.push("-n " + file.lines);
        }
      }
      args.push("-- " + mode);
      command = 'data-disassemble ' + args.join(' ');
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          var instructions;
          instructions = [];
          if (clazz === RESULT.DONE) {
            instructions = result.asm_insns.src_and_asm_line;
          }
          return handler(instructions);
        };
      })(this));
    };

    GDB.prototype.insertBreak = function(arg, handler) {
      var args, command, condition, count, disabled, hardware, location, temporary, thread, tracepoint;
      location = arg.location, condition = arg.condition, count = arg.count, thread = arg.thread, temporary = arg.temporary, hardware = arg.hardware, disabled = arg.disabled, tracepoint = arg.tracepoint;
      args = [];
      if (temporary === true) {
        args.push('-t');
      }
      if (hardware === true) {
        args.push('-h');
      }
      if (disabled === true) {
        args.push('-d');
      }
      if (tracepoint === true) {
        args.push('-a');
      }
      if (condition) {
        args.push("-c " + condition);
      }
      if (count) {
        args.push("-i " + count);
      }
      if (thread) {
        args.push("-p " + thread);
      }
      args.push(location);
      command = 'break-insert ' + args.join(' ');
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          var abreak;
          abreak = null;
          if (clazz === RESULT.DONE) {
            abreak = result.bkpt;
          }
          return handler(abreak);
        };
      })(this));
    };

    GDB.prototype.run = function(handler) {
      var command;
      command = 'exec-run';
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.RUNNING);
        };
      })(this));
    };

    GDB.prototype["continue"] = function(handler) {
      var command;
      command = 'exec-continue';
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.RUNNING);
        };
      })(this));
    };

    GDB.prototype.interrupt = function(handler) {
      var command;
      command = 'exec-interrupt';
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.DONE);
        };
      })(this));
    };

    GDB.prototype.next = function(handler) {
      var command;
      command = 'exec-next';
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.RUNNING);
        };
      })(this));
    };

    GDB.prototype.step = function(handler) {
      var command;
      command = 'exec-step';
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.RUNNING);
        };
      })(this));
    };

    GDB.prototype.set = function(key, value, handler) {
      var command;
      command = "gdb-set " + key + " " + value;
      return this.postCommand(command, (function(_this) {
        return function(clazz, result) {
          return handler(clazz === RESULT.DONE);
        };
      })(this));
    };

    GDB.prototype.postCommand = function(command, handler) {
      this.handler[this.token] = handler;
      this.stdin.write(this.token + "-" + command + "\n");
      return this.token = this.token + 1;
    };

    return GDB;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdG9tLWRlYnVnZ2VyL2xpYi9iYWNrZW5kL2dkYi9nZGIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLHFDQUFELEVBQWtCOztFQUNsQixPQUFtQixPQUFBLENBQVEsaUJBQVIsQ0FBbkIsRUFBQyxvQkFBRCxFQUFTOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ1E7QUFFSixRQUFBOztJQUFBLE1BQUEsR0FDRTtNQUFBLE9BQUEsRUFBUyxDQUFUO01BQ0EsT0FBQSxFQUFTLENBRFQ7OztJQUdXLGFBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO01BQ1QsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNQLGNBQUE7QUFBQTtBQUFBO2VBQUEsc0NBQUE7O0FBQ0Usb0JBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWjtBQUFBLG1CQUNPLEdBRFA7NkJBQ2dCO0FBQVQ7QUFEUCxtQkFFTyxHQUZQOzZCQUVnQjtBQUFUO0FBRlAsbUJBR08sR0FIUDs2QkFHZ0I7QUFBVDtBQUhQLG1CQUlPLEdBSlA7NkJBSWdCO0FBQVQ7QUFKUCxtQkFLTyxHQUxQOzZCQUtnQjtBQUFUO0FBTFAsbUJBTU8sR0FOUDtnQkFPSSxPQUFrQixNQUFNLENBQUMsS0FBUCxDQUFhLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBWixDQUFiLENBQWxCLEVBQUMsa0JBQUQsRUFBUTtnQkFDUixLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxtQkFBZCxFQUFtQztrQkFBQyxPQUFBLEtBQUQ7a0JBQVEsUUFBQSxNQUFSO2lCQUFuQztnQkFD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TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRkk7O2tCQUtOLEdBQUEsR0FBSyxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsT0FBYjtBQUNILFVBQUE7TUFBQSxPQUFBLEdBQVUsVUFBQSxHQUFXLEdBQVgsR0FBZSxHQUFmLEdBQWtCO2FBQzVCLElBQUMsQ0FBQSxXQUFELENBQWEsT0FBYixFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRCxFQUFRLE1BQVI7aUJBQ3BCLE9BQUEsQ0FBUSxLQUFBLEtBQVMsTUFBTSxDQUFDLElBQXhCO1FBRG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUZHOztrQkFLTCxXQUFBLEdBQWEsU0FBQyxPQUFELEVBQVUsT0FBVjtNQUNYLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBVCxHQUFtQjtNQUNuQixJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBZ0IsSUFBQyxDQUFBLEtBQUYsR0FBUSxHQUFSLEdBQVcsT0FBWCxHQUFtQixJQUFsQzthQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUhQOzs7OztBQWhLakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG57UkVTVUxULCBwYXJzZXJ9ID0gcmVxdWlyZSAnLi9nZGItbWktcGFyc2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIEdEQlxuXG4gICAgU1RBVFVTID1cbiAgICAgIE5PVEhJTkc6IDBcbiAgICAgIFJVTk5JTkc6IDFcblxuICAgIGNvbnN0cnVjdG9yOiAodGFyZ2V0KSAtPlxuICAgICAgQHRva2VuID0gMFxuICAgICAgQGhhbmRsZXIgPSB7fVxuICAgICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgICBzdGRvdXQgPSAobGluZXMpID0+XG4gICAgICAgIGZvciBsaW5lIGluIGxpbmVzLnNwbGl0KCdcXG4nKVxuICAgICAgICAgIHN3aXRjaCBsaW5lWzBdXG4gICAgICAgICAgICB3aGVuICcrJyB0aGVuIG51bGwgICMgc3RhdHVzLWFzeW5jLW91dHB1dFxuICAgICAgICAgICAgd2hlbiAnPScgdGhlbiBudWxsICAjIG5vdGlmeS1hc3luYy1vdXRwdXRcbiAgICAgICAgICAgIHdoZW4gJ34nIHRoZW4gbnVsbCAgIyBjb25zb2xlLXN0cmVhbS1vdXRwdXRcbiAgICAgICAgICAgIHdoZW4gJ0AnIHRoZW4gbnVsbCAgIyB0YXJnZXQtc3RyZWFtLW91dHB1dFxuICAgICAgICAgICAgd2hlbiAnJicgdGhlbiBudWxsICAjIGxvZy1zdHJlYW0tb3V0cHV0XG4gICAgICAgICAgICB3aGVuICcqJyAgICAgICAgICAgICMgZXhlYy1hc3luYy1vdXRwdXRcbiAgICAgICAgICAgICAge2NsYXp6LCByZXN1bHR9ID0gcGFyc2VyLnBhcnNlKGxpbmUuc3Vic3RyKDEpKVxuICAgICAgICAgICAgICBAZW1pdHRlci5lbWl0ICdleGVjLWFzeW5jLW91dHB1dCcsIHtjbGF6eiwgcmVzdWx0fVxuICAgICAgICAgICAgICBAZW1pdHRlci5lbWl0IFwiZXhlYy1hc3luYy1ydW5uaW5nXCIsIHJlc3VsdCBpZiBjbGF6eiA9PSBSRVNVTFQuUlVOTklOR1xuICAgICAgICAgICAgICBAZW1pdHRlci5lbWl0IFwiZXhlYy1hc3luYy1zdG9wcGVkXCIsIHJlc3VsdCBpZiBjbGF6eiA9PSBSRVNVTFQuU1RPUFBFRFxuXG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICMgcmVzdWx0LXJlY29yZFxuICAgICAgICAgICAgICBpZiBsaW5lWzBdIDw9ICc5JyBhbmQgbGluZVswXSA+PSAnMCdcbiAgICAgICAgICAgICAgICB7dG9rZW4sIGNsYXp6LCByZXN1bHR9ID0gcGFyc2VyLnBhcnNlKGxpbmUpXG4gICAgICAgICAgICAgICAgQGhhbmRsZXJbdG9rZW5dKGNsYXp6LCByZXN1bHQpXG4gICAgICAgICAgICAgICAgZGVsZXRlIEBoYW5kbGVyW3Rva2VuXVxuXG4gICAgICBzdGRlcnIgPSAobGluZXMpID0+XG5cbiAgICAgIGNvbW1hbmQgPSAnZ2RiJ1xuICAgICAgYXJncyA9IFsnLS1pbnRlcnByZXRlcj1taTInLCB0YXJnZXRdICNcbiAgICAgIGNvbnNvbGUubG9nKFwidGFyZ2V0XCIsIHRhcmdldClcbiAgICAgIEBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnJ9KS5wcm9jZXNzXG4gICAgICBAc3RkaW4gPSBAcHJvY2Vzcy5zdGRpblxuICAgICAgQHN0YXR1cyA9IFNUQVRVUy5OT1RISU5HXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgQHByb2Nlc3Mua2lsbCgpXG4gICAgICBAZW1pdHRlci5kaXNwb3NlKClcblxuICAgIG9uRXhlY0FzeW5jT3V0cHV0OiAoY2FsbGJhY2spIC0+XG4gICAgICBAZW1pdHRlci5vbiAnZXhlYy1hc3luYy1vdXRwdXQnLCBjYWxsYmFja1xuXG4gICAgb25FeGVjQXN5bmNTdG9wcGVkOiAoY2FsbGJhY2spIC0+XG4gICAgICBAZW1pdHRlci5vbiAnZXhlYy1hc3luYy1zdG9wcGVkJywgY2FsbGJhY2tcblxuICAgIG9uRXhlY0FzeW5jUnVubmluZzogKGNhbGxiYWNrKSAtPlxuICAgICAgQGVtaXR0ZXIub24gJ2V4ZWMtYXN5bmMtcnVubmluZycsIGNhbGxiYWNrXG5cbiAgICBsaXN0RmlsZXM6IChoYW5kbGVyKSAtPlxuICAgICAgQHBvc3RDb21tYW5kICdmaWxlLWxpc3QtZXhlYy1zb3VyY2UtZmlsZXMnLCAoY2xhenosIHJlc3VsdCkgPT5cbiAgICAgICAgZmlsZXMgPSBbXVxuICAgICAgICBpZiBjbGF6eiA9PSBSRVNVTFQuRE9ORVxuICAgICAgICAgIGZvciBmaWxlIGluIHJlc3VsdC5maWxlc1xuICAgICAgICAgICAgZmlsZXMucHVzaChmaWxlLmZ1bGxuYW1lKVxuICAgICAgICBoYW5kbGVyKGZpbGVzKVxuXG4gICAgbGlzdEV4ZWNGaWxlOiAoaGFuZGxlcikgLT5cbiAgICAgIEBwb3N0Q29tbWFuZCAnZmlsZS1saXN0LWV4ZWMtc291cmNlLWZpbGUnLCAoY2xhenosIHJlc3VsdCkgPT5cbiAgICAgICAgZmlsZSA9IG51bGxcbiAgICAgICAgaWYgY2xhenogPT0gUkVTVUxULkRPTkVcbiAgICAgICAgICBmaWxlID0gcmVzdWx0XG4gICAgICAgIGhhbmRsZXIoZmlsZSlcblxuICAgIHNldFNvdXJjZURpcmVjdG9yaWVzOiAoZGlyZWN0b3JpZXMsIGhhbmRsZXIpIC0+XG4gICAgICBhcmdzID0gW11cbiAgICAgIGFyZ3MucHVzaChcIlxcXCIje2RpcmVjdG9yeX1cXFwiXCIpIGZvciBkaXJlY3RvcnkgaW4gZGlyZWN0b3JpZXNcblxuICAgICAgY29tbWFuZCA9ICdlbnZpcm9ubWVudC1kaXJlY3RvcnkgJyArIGFyZ3Muam9pbignICcpXG4gICAgICBAcG9zdENvbW1hbmQgY29tbWFuZCwgKGNsYXp6LCByZXN1bHQpID0+XG4gICAgICAgIGhhbmRsZXIoY2xhenogPT0gUkVTVUxULkRPTkUpXG5cbiAgICBsaXN0QnJlYWtzOiAoaGFuZGxlcikgLT5cbiAgICAgIEBwb3N0Q29tbWFuZCAnYnJlYWstbGlzdCcsIChjbGF6eiwgcmVzdWx0KSA9PlxuICAgICAgICBicmVha3MgPSBbXVxuICAgICAgICBpZiBjbGF6eiA9PSBSRVNVTFQuRE9ORSBhbmQgcmVzdWx0LkJyZWFrcG9pbnRUYWJsZS5ib2R5LmJrcHRcbiAgICAgICAgICBicmVha3MgPSByZXN1bHQuQnJlYWtwb2ludFRhYmxlLmJvZHkuYmtwdFxuICAgICAgICBoYW5kbGVyKGJyZWFrcylcblxuICAgIGRlbGV0ZUJyZWFrOiAobnVtYmVyLCBoYW5kbGVyKSAtPlxuICAgICAgY29tbWFuZCA9IFwiYnJlYWstZGVsZXRlICN7bnVtYmVyfVwiXG4gICAgICBAcG9zdENvbW1hbmQgY29tbWFuZCwgKGNsYXp6LCByZXN1bHQpID0+XG4gICAgICAgIGhhbmRsZXIoY2xhenogPT0gUkVTVUxULkRPTkUpXG5cbiAgICBkaXNhc3NlbWJsZURhdGE6ICh7YWRkcmVzcywgZmlsZSwgbW9kZX0sIGhhbmRsZXIpIC0+XG4gICAgICBhcmdzID0gW11cbiAgICAgIGlmIGFkZHJlc3NcbiAgICAgICAgYXJncy5wdXNoKFwiLXMgI3thZGRyZXNzLnN0YXJ0fVwiKVxuICAgICAgICBhcmdzLnB1c2goXCItZSAje2FkZHJlc3MuZW5kfVwiKVxuICAgICAgZWxzZSBpZiBmaWxlXG4gICAgICAgIGFyZ3MucHVzaChcIi1mICN7ZmlsZS5uYW1lfVwiKVxuICAgICAgICBhcmdzLnB1c2goXCItbCAje2ZpbGUubGluZW51bX1cIilcbiAgICAgICAgYXJncy5wdXNoKFwiLW4gI3tmaWxlLmxpbmVzfVwiKSBpZiBmaWxlLmxpbmVzXG4gICAgICBhcmdzLnB1c2goXCItLSAje21vZGV9XCIpXG5cbiAgICAgIGNvbW1hbmQgPSAnZGF0YS1kaXNhc3NlbWJsZSAnICsgYXJncy5qb2luKCcgJylcblxuICAgICAgQHBvc3RDb21tYW5kIGNvbW1hbmQsIChjbGF6eiwgcmVzdWx0KSA9PlxuICAgICAgICBpbnN0cnVjdGlvbnMgPSBbXVxuICAgICAgICBpZiBjbGF6eiA9PSBSRVNVTFQuRE9ORVxuICAgICAgICAgIGluc3RydWN0aW9ucyA9IHJlc3VsdC5hc21faW5zbnMuc3JjX2FuZF9hc21fbGluZVxuICAgICAgICBoYW5kbGVyKGluc3RydWN0aW9ucylcblxuICAgIGluc2VydEJyZWFrOiAoe2xvY2F0aW9uLCBjb25kaXRpb24sIGNvdW50LCB0aHJlYWQsIHRlbXBvcmFyeSwgaGFyZHdhcmUsIGRpc2FibGVkLCB0cmFjZXBvaW50fSwgaGFuZGxlcikgLT5cbiAgICAgIGFyZ3MgPSBbXVxuICAgICAgYXJncy5wdXNoKCctdCcpIGlmIHRlbXBvcmFyeSBpcyB0cnVlXG4gICAgICBhcmdzLnB1c2goJy1oJykgaWYgaGFyZHdhcmUgaXMgdHJ1ZVxuICAgICAgYXJncy5wdXNoKCctZCcpIGlmIGRpc2FibGVkIGlzIHRydWVcbiAgICAgIGFyZ3MucHVzaCgnLWEnKSBpZiB0cmFjZXBvaW50IGlzIHRydWVcbiAgICAgIGFyZ3MucHVzaChcIi1jICN7Y29uZGl0aW9ufVwiKSBpZiBjb25kaXRpb25cbiAgICAgIGFyZ3MucHVzaChcIi1pICN7Y291bnR9XCIpIGlmIGNvdW50XG4gICAgICBhcmdzLnB1c2goXCItcCAje3RocmVhZH1cIikgaWYgdGhyZWFkXG4gICAgICBhcmdzLnB1c2gobG9jYXRpb24pXG5cbiAgICAgIGNvbW1hbmQgPSAnYnJlYWstaW5zZXJ0ICcgKyBhcmdzLmpvaW4oJyAnKVxuXG4gICAgICBAcG9zdENvbW1hbmQgY29tbWFuZCwgKGNsYXp6LCByZXN1bHQpID0+XG4gICAgICAgIGFicmVhayA9IG51bGxcbiAgICAgICAgaWYgY2xhenogPT0gUkVTVUxULkRPTkVcbiAgICAgICAgICBhYnJlYWsgPSByZXN1bHQuYmtwdFxuICAgICAgICBoYW5kbGVyKGFicmVhaylcblxuICAgIHJ1bjogKGhhbmRsZXIpIC0+XG4gICAgICBjb21tYW5kID0gJ2V4ZWMtcnVuJ1xuICAgICAgQHBvc3RDb21tYW5kIGNvbW1hbmQsIChjbGF6eiwgcmVzdWx0KSA9PlxuICAgICAgICBoYW5kbGVyKGNsYXp6ID09IFJFU1VMVC5SVU5OSU5HKVxuXG4gICAgY29udGludWU6IChoYW5kbGVyKSAtPlxuICAgICAgY29tbWFuZCA9ICdleGVjLWNvbnRpbnVlJ1xuICAgICAgQHBvc3RDb21tYW5kIGNvbW1hbmQsIChjbGF6eiwgcmVzdWx0KSA9PlxuICAgICAgICBoYW5kbGVyKGNsYXp6ID09IFJFU1VMVC5SVU5OSU5HKVxuXG4gICAgaW50ZXJydXB0OiAoaGFuZGxlcikgLT5cbiAgICAgIGNvbW1hbmQgPSAnZXhlYy1pbnRlcnJ1cHQnXG4gICAgICBAcG9zdENvbW1hbmQgY29tbWFuZCwgKGNsYXp6LCByZXN1bHQpID0+XG4gICAgICAgIGhhbmRsZXIoY2xhenogPT0gUkVTVUxULkRPTkUpXG5cbiAgICBuZXh0OiAoaGFuZGxlcikgLT5cbiAgICAgIGNvbW1hbmQgPSAnZXhlYy1uZXh0J1xuICAgICAgQHBvc3RDb21tYW5kIGNvbW1hbmQsIChjbGF6eiwgcmVzdWx0KSA9PlxuICAgICAgICBoYW5kbGVyKGNsYXp6ID09IFJFU1VMVC5SVU5OSU5HKVxuXG4gICAgc3RlcDogKGhhbmRsZXIpIC0+XG4gICAgICBjb21tYW5kID0gJ2V4ZWMtc3RlcCdcbiAgICAgIEBwb3N0Q29tbWFuZCBjb21tYW5kLCAoY2xhenosIHJlc3VsdCkgPT5cbiAgICAgICAgaGFuZGxlcihjbGF6eiA9PSBSRVNVTFQuUlVOTklORylcblxuICAgIHNldDogKGtleSwgdmFsdWUsIGhhbmRsZXIpIC0+XG4gICAgICBjb21tYW5kID0gXCJnZGItc2V0ICN7a2V5fSAje3ZhbHVlfVwiXG4gICAgICBAcG9zdENvbW1hbmQgY29tbWFuZCwgKGNsYXp6LCByZXN1bHQpID0+XG4gICAgICAgIGhhbmRsZXIoY2xhenogPT0gUkVTVUxULkRPTkUpXG5cbiAgICBwb3N0Q29tbWFuZDogKGNvbW1hbmQsIGhhbmRsZXIpIC0+XG4gICAgICBAaGFuZGxlcltAdG9rZW5dID0gaGFuZGxlclxuICAgICAgQHN0ZGluLndyaXRlKFwiI3tAdG9rZW59LSN7Y29tbWFuZH1cXG5cIilcbiAgICAgIEB0b2tlbiA9IEB0b2tlbiArIDFcbiJdfQ==
