(function() {
  var $, RsenseClient, TableParser, exec, os,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('jquery');

  TableParser = require('table-parser');

  exec = require('child_process').exec;

  os = require('os');

  String.prototype.replaceAll = function(s, r) {
    return this.split(s).join(r);
  };

  module.exports = RsenseClient = (function() {
    function RsenseClient() {
      this.checkCompletion = bind(this.checkCompletion, this);
      this.stopRsense = bind(this.stopRsense, this);
      this.stopRsenseUnix = bind(this.stopRsenseUnix, this);
      this.startRsenseCommand = bind(this.startRsenseCommand, this);
      this.startRsenseWin32 = bind(this.startRsenseWin32, this);
      this.startRsenseUnix = bind(this.startRsenseUnix, this);
      this.projectPath = atom.project.getPaths()[0];
      if (!this.projectPath) {
        this.projectPath = '.';
      }
      this.rsensePath = atom.config.get('autocomplete-ruby.rsensePath');
      this.port = atom.config.get('autocomplete-ruby.port');
      this.serverUrl = "http://localhost:" + this.port;
      this.rsenseStarted = false;
      this.rsenseProcess = null;
    }

    RsenseClient.prototype.startRsenseUnix = function() {
      var start;
      start = this.startRsenseCommand;
      return exec("ps -ef | head -1; ps -ef | grep java", function(error, stdout, stderr) {
        if (error !== null) {
          return atom.notifications.addError('Error looking for resense process', {
            detail: "autocomplete-ruby: exec error: " + error,
            dismissable: true
          });
        } else {
          this.rsenseProcess = $.grep(TableParser.parse(stdout), function(process) {
            return process.CMD.join(' ').match(/rsense.*--port.*--path/);
          })[0];
          if (this.rsenseProcess === void 0 || this.rsenseProcess === null) {
            return start();
          } else {
            return this.rsenseStarted = true;
          }
        }
      });
    };

    RsenseClient.prototype.startRsenseWin32 = function() {
      var start;
      if (this.rsenseStarted) {
        return;
      }
      start = this.startRsenseCommand;
      return exec(this.rsensePath + " stop", (function(_this) {
        return function(error, stdout, stderr) {
          if (error === null) {
            return start();
          } else {
            atom.notifications.addError('Error stopping rsense', {
              detail: "autocomplete-ruby: exec error: " + error,
              dismissable: true
            });
            return _this.rsenseStarted = false;
          }
        };
      })(this));
    };

    RsenseClient.prototype.startRsenseCommand = function() {
      if (this.rsenseStarted) {
        return;
      }
      return exec(this.rsensePath + " start --port " + this.port + " --path " + this.projectPath, function(error, stdout, stderr) {
        if (error !== null) {
          return atom.notifications.addError('Error starting rsense', {
            detail: ("autocomplete-ruby: exec error: " + error + os.EOL) + "(You might need to set the rsense path, see the readme)",
            dismissable: true
          });
        } else {
          return this.rsenseStarted = true;
        }
      });
    };

    RsenseClient.prototype.stopRsenseUnix = function() {
      var stopCommand;
      stopCommand = this.stopRsense;
      return exec("ps -ef | head -1; ps -ef | grep atom", function(error, stdout, stderr) {
        var ex;
        if (error !== null) {
          return atom.notifications.addError('Error looking for atom process', {
            detail: "autocomplete-ruby: exec error: " + error,
            dismissable: true
          });
        } else {
          this.atomProcesses = $.grep(TableParser.parse(stdout), function(process) {
            return process.CMD.join(' ').match(/--type=renderer.*--node-integration=true/);
          });
          if (this.atomProcesses.length < 2) {
            try {
              if (this.rsenseProcess) {
                process.kill(this.rsenseProcess.PID[0], 'SIGKILL');
              }
            } catch (error1) {
              ex = error1;
              console.debug("exception killing process: " + ex);
            }
            return stopCommand();
          }
        }
      });
    };

    RsenseClient.prototype.stopRsense = function() {
      if (!this.rsenseStarted) {
        return;
      }
      return exec(this.rsensePath + " stop", function(error, stdout, stderr) {
        if (error !== null) {
          return atom.notifications.addError('Error stopping rsense', {
            detail: "autocomplete-ruby: exec error: " + error,
            dismissable: true
          });
        } else {
          return this.rsenseStarted = false;
        }
      });
    };

    RsenseClient.prototype.checkCompletion = function(editor, buffer, row, column, callback) {
      var code, request;
      code = buffer.getText().replaceAll('\n', '\n').replaceAll('%', '%25');
      request = {
        command: 'code_completion',
        project: this.projectPath,
        file: editor.getPath(),
        code: code,
        location: {
          row: row,
          column: column
        }
      };
      $.ajax(this.serverUrl, {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(request),
        error: function(jqXHR, textStatus, errorThrown) {
          callback([]);
          return console.error(textStatus);
        },
        success: function(data, textStatus, jqXHR) {
          return callback(data.completions);
        }
      });
      return [];
    };

    return RsenseClient;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcnVieS9saWIvYXV0b2NvbXBsZXRlLXJ1YnktY2xpZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0NBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osV0FBQSxHQUFjLE9BQUEsQ0FBUSxjQUFSOztFQUNkLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDOztFQUNoQyxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFqQixHQUE4QixTQUFDLENBQUQsRUFBSSxDQUFKO1dBQVUsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFQLENBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBZjtFQUFWOztFQUU5QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0JBQUE7Ozs7Ozs7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQTtNQUN2QyxJQUFBLENBQTBCLElBQUMsQ0FBQSxXQUEzQjtRQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBZjs7TUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEI7TUFDZCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEI7TUFDUixJQUFDLENBQUEsU0FBRCxHQUFhLG1CQUFBLEdBQW9CLElBQUMsQ0FBQTtNQUNsQyxJQUFDLENBQUEsYUFBRCxHQUFpQjtNQUNqQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQVBOOzsyQkFXYixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsS0FBQSxHQUFRLElB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RDVCLEVBQ2lDLEtBRGpDO01BR1AsT0FBQSxHQUNFO1FBQUEsT0FBQSxFQUFTLGlCQUFUO1FBQ0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxXQURWO1FBRUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FGTjtRQUdBLElBQUEsRUFBTSxJQUhOO1FBSUEsUUFBQSxFQUNFO1VBQUEsR0FBQSxFQUFLLEdBQUw7VUFDQSxNQUFBLEVBQVEsTUFEUjtTQUxGOztNQVFGLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLFNBQVIsRUFDRTtRQUFBLElBQUEsRUFBTSxNQUFOO1FBQ0EsUUFBQSxFQUFVLE1BRFY7UUFFQSxXQUFBLEVBQWEsa0JBRmI7UUFHQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLENBSE47UUFJQSxLQUFBLEVBQU8sU0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixXQUFwQjtVQUdMLFFBQUEsQ0FBUyxFQUFUO2lCQUNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsVUFBZDtRQUpLLENBSlA7UUFTQSxPQUFBLEVBQVMsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixLQUFuQjtpQkFDUCxRQUFBLENBQVMsSUFBSSxDQUFDLFdBQWQ7UUFETyxDQVRUO09BREY7QUFhQSxhQUFPO0lBMUJROzs7OztBQTVHbkIiLCJzb3VyY2VzQ29udGVudCI6WyIkID0gcmVxdWlyZSgnanF1ZXJ5JylcblRhYmxlUGFyc2VyID0gcmVxdWlyZSgndGFibGUtcGFyc2VyJylcbmV4ZWMgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1xub3MgPSByZXF1aXJlKCdvcycpXG5TdHJpbmcucHJvdG90eXBlLnJlcGxhY2VBbGwgPSAocywgcikgLT4gQHNwbGl0KHMpLmpvaW4ocilcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUnNlbnNlQ2xpZW50XG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgQHByb2plY3RQYXRoID0gJy4nIHVubGVzcyBAcHJvamVjdFBhdGhcbiAgICBAcnNlbnNlUGF0aCA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXJ1YnkucnNlbnNlUGF0aCcpXG4gICAgQHBvcnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1ydWJ5LnBvcnQnKVxuICAgIEBzZXJ2ZXJVcmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6I3tAcG9ydH1cIlxuICAgIEByc2Vuc2VTdGFydGVkID0gZmFsc2VcbiAgICBAcnNlbnNlUHJvY2VzcyA9IG51bGxcblxuICAjIENoZWNrIGlmIGFuIHJzZW5zZSBzZXJ2ZXIgaXMgYWxyZWFkeSBydW5uaW5nLlxuICAjIFRoaXMgY2FuIGRldGVjdCBhbGwgcnNlbnNlIHByb2Nlc3NlcyBldmVuIHRob3NlIHdpdGhvdXQgcGlkIGZpbGVzLlxuICBzdGFydFJzZW5zZVVuaXg6ID0+XG4gICAgc3RhcnQgPSBAc3RhcnRSc2Vuc2VDb21tYW5kXG5cbiAgICBleGVjKFwicHMgLWVmIHwgaGVhZCAtMTsgcHMgLWVmIHwgZ3JlcCBqYXZhXCIsXG4gICAgICAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgICBpZiBlcnJvciAhPSBudWxsXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdFcnJvciBsb29raW5nIGZvciByZXNlbnNlIHByb2Nlc3MnLFxuICAgICAgICAgICAgICB7ZGV0YWlsOiBcImF1dG9jb21wbGV0ZS1ydWJ5OiBleGVjIGVycm9yOiAje2Vycm9yfVwiLCBkaXNtaXNzYWJsZTogdHJ1ZX1cbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEByc2Vuc2VQcm9jZXNzID0gJC5ncmVwKFRhYmxlUGFyc2VyLnBhcnNlKHN0ZG91dCksIChwcm9jZXNzKSAtPlxuICAgICAgICAgICAgcHJvY2Vzcy5DTUQuam9pbignICcpLm1hdGNoKCAvcnNlbnNlLiotLXBvcnQuKi0tcGF0aC8gKVxuICAgICAgICAgIClbMF1cbiAgICAgICAgICBpZiBAcnNlbnNlUHJvY2VzcyA9PSB1bmRlZmluZWQgfHwgQHJzZW5zZVByb2Nlc3MgPT0gbnVsbFxuICAgICAgICAgICAgc3RhcnQoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEByc2Vuc2VTdGFydGVkID0gdHJ1ZVxuICAgIClcblxuICAjIEJlZm9yZSB0cnlpbmcgdG8gc3RhcnQgaW4gV2luZG93cyB3ZSBuZWVkIHRvIGtpbGwgYW55IGV4aXN0aW5nIHJzZW5zZSBzZXJ2ZXJzLCBzb1xuICAjIGFzIHRvIG5vdCBlbmQgdXAgd2l0aCBtdWx0aXBsZSByc2Vuc2Ugc2VydnNlcnMgdW5raWxsYWJsZSBieSAncnNlbnNlIHN0b3AnXG4gICMgVGhpcyBtZWFucyB0aGF0IHJ1bm5pbmcgdHdvIGF0b21zIGFuZCBjbG9zaW5nIG9uZSwga2lsbHMgcnNlbnNlIGZvciB0aGUgb3RoZXJcbiAgc3RhcnRSc2Vuc2VXaW4zMjogPT5cbiAgICByZXR1cm4gaWYgQHJzZW5zZVN0YXJ0ZWRcbiAgICBzdGFydCA9IEBzdGFydFJzZW5zZUNvbW1hbmRcblxuICAgIGV4ZWMoXCIje0Byc2Vuc2VQYXRofSBzdG9wXCIsXG4gICAgICAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSA9PlxuICAgICAgICBpZiBlcnJvciA9PSBudWxsXG4gICAgICAgICAgc3RhcnQoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdFcnJvciBzdG9wcGluZyByc2Vuc2UnLFxuICAgICAgICAgICAgICB7ZGV0YWlsOiBcImF1dG9jb21wbGV0ZS1ydWJ5OiBleGVjIGVycm9yOiAje2Vycm9yfVwiLCBkaXNtaXNzYWJsZTogdHJ1ZX1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBAcnNlbnNlU3RhcnRlZCA9IGZhbHNlXG4gICAgKVxuXG4gIHN0YXJ0UnNlbnNlQ29tbWFuZDogPT5cbiAgICByZXR1cm4gaWYgQHJzZW5zZVN0YXJ0ZWRcbiAgICBleGVjKFwiI3tAcnNlbnNlUGF0aH0gc3RhcnQgLS1wb3J0ICN7QHBvcnR9IC0tcGF0aCAje0Bwcm9qZWN0UGF0aH1cIixcbiAgICAgIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICAgIGlmIGVycm9yICE9IG51bGxcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0Vycm9yIHN0YXJ0aW5nIHJzZW5zZScsXG4gICAgICAgICAgICAgIHtkZXRhaWw6IFwiYXV0b2NvbXBsZXRlLXJ1Ynk6IGV4ZWMgZXJyb3I6ICN7ZXJyb3J9I3tvcy5FT0x9XCIgK1xuICAgICAgICAgICAgICBcIihZb3UgbWlnaHQgbmVlZCB0byBzZXQgdGhlIHJzZW5zZSBwYXRoLCBzZWUgdGhlIHJlYWRtZSlcIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcnNlbnNlU3RhcnRlZCA9IHRydWVcbiAgICApXG5cbiAgIyBGaXJzdCBjb3VudCBob3cgbWFueSBhdG9tIHdpbmRvd3MgYXJlIG9wZW4uXG4gICMgSWYgdGhlcmUgaXMgb25seSBvbmUgb3BlbiwgdGhlbiBraWxsIHRoZSByc2Vuc2UgcHJvY2Vzcy5cbiAgIyBUaGlzIGlzIGFsc28gYWJsZSB0byBraWxsIGFuIHJzZW5zZSBwcm9jZXNzIHdpdGhvdXQgYSBwaWQgZmlsZS5cbiAgIyBPdGhlcndpc2UgZG8gbm90aGluZyBzbyB5b3Ugd2lsbCBzdGlsbCBiZSBhYmxlIHRvIHVzZSByc2Vuc2UgaW4gb3RoZXIgd2luZG93cy5cbiAgc3RvcFJzZW5zZVVuaXg6ID0+XG4gICAgc3RvcENvbW1hbmQgPSBAc3RvcFJzZW5zZVxuXG4gICAgZXhlYyhcInBzIC1lZiB8IGhlYWQgLTE7IHBzIC1lZiB8IGdyZXAgYXRvbVwiLFxuICAgICAgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgLT5cbiAgICAgICAgaWYgZXJyb3IgIT0gbnVsbFxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRXJyb3IgbG9va2luZyBmb3IgYXRvbSBwcm9jZXNzJyxcbiAgICAgICAgICAgICAge2RldGFpbDogXCJhdXRvY29tcGxldGUtcnVieTogZXhlYyBlcnJvcjogI3tlcnJvcn1cIiwgZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAYXRvbVByb2Nlc3NlcyA9ICQuZ3JlcChUYWJsZVBhcnNlci5wYXJzZShzdGRvdXQpLCAocHJvY2VzcykgLT5cbiAgICAgICAgICAgIHByb2Nlc3MuQ01ELmpvaW4oJyAnKS5tYXRjaCggLy0tdHlwZT1yZW5kZXJlci4qLS1ub2RlLWludGVncmF0aW9uPXRydWUvIClcbiAgICAgICAgICApXG4gICAgICAgICAgaWYgQGF0b21Qcm9jZXNzZXMubGVuZ3RoIDwgMlxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgIHByb2Nlc3Mua2lsbChAcnNlbnNlUHJvY2Vzcy5QSURbMF0sICdTSUdLSUxMJykgaWYgQHJzZW5zZVByb2Nlc3NcbiAgICAgICAgICAgIGNhdGNoIGV4XG4gICAgICAgICAgICAgICMgaWdub3JlIGVycm9yIGlmIGtpbGwgZmFpbHNcbiAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyBcImV4Y2VwdGlvbiBraWxsaW5nIHByb2Nlc3M6ICN7ZXh9XCJcbiAgICAgICAgICAgIHN0b3BDb21tYW5kKClcbiAgICApXG5cbiAgc3RvcFJzZW5zZTogPT5cbiAgICByZXR1cm4gaWYgIUByc2Vuc2VTdGFydGVkXG4gICAgZXhlYyhcIiN7QHJzZW5zZVBhdGh9IHN0b3BcIixcbiAgICAgIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICAgIGlmIGVycm9yICE9IG51bGxcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0Vycm9yIHN0b3BwaW5nIHJzZW5zZScsXG4gICAgICAgICAgICAgIHtkZXRhaWw6IFwiYXV0b2NvbXBsZXRlLXJ1Ynk6IGV4ZWMgZXJyb3I6ICN7ZXJyb3J9XCIsIGRpc21pc3NhYmxlOiB0cnVlfVxuICAgICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHJzZW5zZVN0YXJ0ZWQgPSBmYWxzZVxuICAgIClcblxuICBjaGVja0NvbXBsZXRpb246IChlZGl0b3IsIGJ1ZmZlciwgcm93LCBjb2x1bW4sIGNhbGxiYWNrKSA9PlxuICAgIGNvZGUgPSBidWZmZXIuZ2V0VGV4dCgpLnJlcGxhY2VBbGwoJ1xcbicsICdcXG4nKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlQWxsKCclJywgJyUyNScpXG5cbiAgICByZXF1ZXN0ID1cbiAgICAgIGNvbW1hbmQ6ICdjb2RlX2NvbXBsZXRpb24nXG4gICAgICBwcm9qZWN0OiBAcHJvamVjdFBhdGhcbiAgICAgIGZpbGU6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIGNvZGU6IGNvZGVcbiAgICAgIGxvY2F0aW9uOlxuICAgICAgICByb3c6IHJvd1xuICAgICAgICBjb2x1bW46IGNvbHVtblxuXG4gICAgJC5hamF4IEBzZXJ2ZXJVcmwsXG4gICAgICB0eXBlOiAnUE9TVCdcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSByZXF1ZXN0XG4gICAgICBlcnJvcjogKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgLT5cbiAgICAgICAgIyBzZW5kIGVtcHR5IGFycmF5IHRvIGNhbGxiYWNrXG4gICAgICAgICMgdG8gYXZvaWQgYXV0b2NvbXBsZXRlLXBsdXMgYnJpY2tcbiAgICAgICAgY2FsbGJhY2sgW11cbiAgICAgICAgY29uc29sZS5lcnJvciB0ZXh0U3RhdHVzXG4gICAgICBzdWNjZXNzOiAoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgIGNhbGxiYWNrIGRhdGEuY29tcGxldGlvbnNcblxuICAgIHJldHVybiBbXVxuIl19
