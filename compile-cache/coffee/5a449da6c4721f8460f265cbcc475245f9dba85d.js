(function() {
  var _, child, filteredEnvironment, fs, path, pty, systemLanguage;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ELECTRON_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'platformio-ide-terminal';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1 && process.platform !== 'win32') {
      args.unshift('--login');
    }
    if (shell) {
      ptyProcess = pty.fork(shell, args, {
        cwd: pwd,
        env: filteredEnvironment,
        name: 'xterm-256color'
      });
      title = shell = path.basename(shell);
    } else {
      ptyProcess = pty.open();
    }
    emitTitle = _.throttle(function() {
      return emit('platformio-ide-terminal:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('platformio-ide-terminal:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('platformio-ide-terminal:exit');
      return callback();
    });
    return process.on('message', function(arg) {
      var cols, event, ref, rows, text;
      ref = arg != null ? arg : {}, event = ref.event, cols = ref.cols, rows = ref.rows, text = ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
        case 'pty':
          return emit('platformio-ide-terminal:pty', ptyProcess.pty);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC9saWIvcHJvY2Vzcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7RUFDSixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVI7O0VBRVIsY0FBQSxHQUFvQixDQUFBLFNBQUE7QUFDbEIsUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsUUFBdkI7QUFDRTtRQUNFLE9BQUEsR0FBVTtRQUNWLFFBQUEsR0FBYSxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxPQUFmLENBQXVCLENBQUMsUUFBeEIsQ0FBQSxDQUFYLENBQThDLENBQUMsV0FBaEQsQ0FBQSxHQUE0RCxTQUYzRTtPQUFBLGlCQURGOztBQUlBLFdBQU87RUFOVyxDQUFBLENBQUgsQ0FBQTs7RUFRakIsbUJBQUEsR0FBeUIsQ0FBQSxTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFPLENBQUMsR0FBZixFQUFvQixXQUFwQixFQUFpQyxzQkFBakMsRUFBeUQsZ0JBQXpELEVBQTJFLFVBQTNFLEVBQXVGLFdBQXZGLEVBQW9HLFdBQXBHLEVBQWlILFVBQWpIOztNQUNOLEdBQUcsQ0FBQyxPQUFROztJQUNaLEdBQUcsQ0FBQyxZQUFKLEdBQW1CO0FBQ25CLFdBQU87RUFKZ0IsQ0FBQSxDQUFILENBQUE7O0VBTXRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxJQUFiLEVBQW1CLE9BQW5CO0FBQ2YsUUFBQTs7TUFEa0MsVUFBUTs7SUFDMUMsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFELENBQUE7SUFFWCxJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQUEsSUFBMkIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQUEsS0FBMkIsQ0FBQyxDQUF2RCxJQUE2RCxPQUFPLENBQUMsUUFBUixLQUFzQixPQUF0RjtNQUNFLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQURGOztJQUdBLElBQUcsS0FBSDtNQUNFLFVBQUEsR0FBYSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFDWDtRQUFBLEdBQUEsRUFBSyxHQUFMO1FBQ0EsR0FBQSxFQUFLLG1CQURMO1FBRUEsSUFBQSxFQUFNLGdCQUZOO09BRFc7TUFLYixLQUFBLEdBQVEsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZCxFQU5sQjtLQUFBLE1BQUE7TUFRRSxVQUFBLEdBQWEsR0FBRyxDQUFDLElBQUosQ0FBQSxFQVJmOztJQVVBLFNBQUEsR0FBWSxDQUFDLENBQUMsUUFBRixDQUFXLFNBQUE7YUFDckIsSUFBQSxDQUFLLCtCQUFMLEVBQXNDLFVBQVUsQ0FBQyxPQUFqRDtJQURxQixDQUFYLEVBRVYsR0FGVSxFQUVMLElBRks7SUFJWixVQUFVLENBQUMsRUFBWCxDQUFjLE1BQWQsRUFBc0IsU0FBQyxJQUFEO01BQ3BCLElBQUEsQ0FBSyw4QkFBTCxFQUFxQyxJQUFyQzthQUNBLFNBQUEsQ0FBQTtJQUZvQixDQUF0QjtJQUlBLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFBO01BQ3BCLElBQUEsQ0FBSyw4QkFBTDthQUNBLFFBQUEsQ0FBQTtJQUZvQixDQUF0QjtXQUlBLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLEdBQUQ7QUFDcEIsVUFBQTswQkFEcUIsTUFBMEIsSUFBekIsbUJBQU8saUJBQU0saUJBQU07QUFDekMsY0FBTyxLQUFQO0FBQUEsYUFDTyxRQURQO2lCQUNxQixVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQixFQUF3QixJQUF4QjtBQURyQixhQUVPLE9BRlA7aUJBRW9CLFVBQVUsQ0FBQyxLQUFYLENBQWlCLElBQWpCO0FBRnBCLGFBR08sS0FIUDtpQkFHa0IsSUFBQSxDQUFLLDZCQUFMLEVBQW9DLFVBQVUsQ0FBQyxHQUEvQztBQUhsQjtJQURvQixDQUF0QjtFQTVCZTtBQXBCakIiLCJzb3VyY2VzQ29udGVudCI6WyJwdHkgPSByZXF1aXJlICdwdHkuanMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbmNoaWxkID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcblxuc3lzdGVtTGFuZ3VhZ2UgPSBkbyAtPlxuICBsYW5ndWFnZSA9IFwiZW5fVVMuVVRGLThcIlxuICBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICdkYXJ3aW4nXG4gICAgdHJ5XG4gICAgICBjb21tYW5kID0gJ3BsdXRpbCAtY29udmVydCBqc29uIC1vIC0gfi9MaWJyYXJ5L1ByZWZlcmVuY2VzLy5HbG9iYWxQcmVmZXJlbmNlcy5wbGlzdCdcbiAgICAgIGxhbmd1YWdlID0gXCIje0pTT04ucGFyc2UoY2hpbGQuZXhlY1N5bmMoY29tbWFuZCkudG9TdHJpbmcoKSkuQXBwbGVMb2NhbGV9LlVURi04XCJcbiAgcmV0dXJuIGxhbmd1YWdlXG5cbmZpbHRlcmVkRW52aXJvbm1lbnQgPSBkbyAtPlxuICBlbnYgPSBfLm9taXQgcHJvY2Vzcy5lbnYsICdBVE9NX0hPTUUnLCAnRUxFQ1RST05fUlVOX0FTX05PREUnLCAnR09PR0xFX0FQSV9LRVknLCAnTk9ERV9FTlYnLCAnTk9ERV9QQVRIJywgJ3VzZXJBZ2VudCcsICd0YXNrUGF0aCdcbiAgZW52LkxBTkcgPz0gc3lzdGVtTGFuZ3VhZ2VcbiAgZW52LlRFUk1fUFJPR1JBTSA9ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCdcbiAgcmV0dXJuIGVudlxuXG5tb2R1bGUuZXhwb3J0cyA9IChwd2QsIHNoZWxsLCBhcmdzLCBvcHRpb25zPXt9KSAtPlxuICBjYWxsYmFjayA9IEBhc3luYygpXG5cbiAgaWYgL3pzaHxiYXNoLy50ZXN0KHNoZWxsKSBhbmQgYXJncy5pbmRleE9mKCctLWxvZ2luJykgPT0gLTEgYW5kIHByb2Nlc3MucGxhdGZvcm0gaXNudCAnd2luMzInXG4gICAgYXJncy51bnNoaWZ0ICctLWxvZ2luJ1xuXG4gIGlmIHNoZWxsXG4gICAgcHR5UHJvY2VzcyA9IHB0eS5mb3JrIHNoZWxsLCBhcmdzLFxuICAgICAgY3dkOiBwd2QsXG4gICAgICBlbnY6IGZpbHRlcmVkRW52aXJvbm1lbnQsXG4gICAgICBuYW1lOiAneHRlcm0tMjU2Y29sb3InXG5cbiAgICB0aXRsZSA9IHNoZWxsID0gcGF0aC5iYXNlbmFtZSBzaGVsbFxuICBlbHNlXG4gICAgcHR5UHJvY2VzcyA9IHB0eS5vcGVuKClcblxuICBlbWl0VGl0bGUgPSBfLnRocm90dGxlIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGl0bGUnLCBwdHlQcm9jZXNzLnByb2Nlc3MpXG4gICwgNTAwLCB0cnVlXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZGF0YScsIChkYXRhKSAtPlxuICAgIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmRhdGEnLCBkYXRhKVxuICAgIGVtaXRUaXRsZSgpXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZXhpdCcsIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZXhpdCcpXG4gICAgY2FsbGJhY2soKVxuXG4gIHByb2Nlc3Mub24gJ21lc3NhZ2UnLCAoe2V2ZW50LCBjb2xzLCByb3dzLCB0ZXh0fT17fSkgLT5cbiAgICBzd2l0Y2ggZXZlbnRcbiAgICAgIHdoZW4gJ3Jlc2l6ZScgdGhlbiBwdHlQcm9jZXNzLnJlc2l6ZShjb2xzLCByb3dzKVxuICAgICAgd2hlbiAnaW5wdXQnIHRoZW4gcHR5UHJvY2Vzcy53cml0ZSh0ZXh0KVxuICAgICAgd2hlbiAncHR5JyB0aGVuIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnB0eScsIHB0eVByb2Nlc3MucHR5KVxuIl19
