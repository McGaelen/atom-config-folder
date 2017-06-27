(function() {
  var DownloadCmd, EventEmitter, FtpTransport, Host, HostView, MonitoredFiles, RemoteSync, ScpTransport, chokidar, exec, fs, getLogger, logger, minimatch, path, randomize, uploadCmd, watchChangeSet, watchFiles, watcher,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require("path");

  fs = require("fs-plus");

  chokidar = require("chokidar");

  randomize = require("randomatic");

  exec = null;

  minimatch = null;

  ScpTransport = null;

  FtpTransport = null;

  uploadCmd = null;

  DownloadCmd = null;

  Host = null;

  HostView = null;

  EventEmitter = null;

  MonitoredFiles = [];

  watchFiles = {};

  watchChangeSet = false;

  watcher = chokidar.watch();

  logger = null;

  getLogger = function() {
    var Logger;
    if (!logger) {
      Logger = require("./Logger");
      logger = new Logger("Remote Sync");
    }
    return logger;
  };

  RemoteSync = (function() {
    function RemoteSync(projectPath1, configPath1) {
      var ref;
      this.projectPath = projectPath1;
      this.configPath = configPath1;
      if (Host == null) {
        Host = require('./model/host');
      }
      this.host = new Host(this.configPath);
      watchFiles = (ref = this.host.watch) != null ? ref.split(",").filter(Boolean) : void 0;
      if (this.host.source) {
        this.projectPath = path.join(this.projectPath, this.host.source);
      }
      if (watchFiles != null) {
        this.initAutoFileWatch(this.projectPath);
      }
      this.initIgnore(this.host);
      this.initMonitor();
    }

    RemoteSync.prototype.initIgnore = function(host) {
      var ignore, ref;
      ignore = (ref = host.ignore) != null ? ref.split(",") : void 0;
      return host.isIgnore = (function(_this) {
        return function(filePath, relativizePath) {
          var i, len, pattern;
          if (!(relativizePath || _this.inPath(_this.projectPath, filePath))) {
            return true;
          }
          if (!ignore) {
            return false;
          }
          if (!relativizePath) {
            relativizePath = _this.projectPath;
          }
          filePath = path.relative(relativizePath, filePath);
          if (minimatch == null) {
            minimatch = require("minimatch");
          }
          for (i = 0, len = ignore.length; i < len; i++) {
            pattern = ignore[i];
            if (minimatch(filePath, pattern, {
              matchBase: true,
              dot: true
            })) {
              return true;
            }
          }
          return false;
        };
      })(this);
    };

    RemoteSync.prototype.isIgnore = function(filePath, relativizePath) {
      return this.host.isIgnore(filePath, relativizePath);
    };

    RemoteSync.prototype.inPath = function(rootPath, localPath) {
      if (fs.isDirectorySync(localPath)) {
        localPath = localPath + path.sep;
      }
      return localPath.indexOf(rootPath + path.sep) === 0;
    };

    RemoteSync.prototype.dispose = function() {
      if (this.transport) {
        this.transport.dispose();
        return this.transport = null;
      }
    };

    RemoteSync.prototype.deleteFile = function(filePath) {
      var UploadListener, i, len, ref, t;
      if (this.isIgnore(filePath)) {
        return;
      }
      if (!uploadCmd) {
        UploadListener = require("./UploadListener");
        uploadCmd = new UploadListener(getLogger());
      }
      uploadCmd.handleDelete(filePath, this.getTransport());
      ref = this.getUploadMirrors();
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        uploadCmd.handleDelete(filePath, t);
      }
      if (this.host.deleteLocal) {
        return fs.removeSync(filePath);
      }
    };

    RemoteSync.prototype.downloadFolder = function(localPath, targetPath, callback) {
      if (DownloadCmd == null) {
        DownloadCmd = require('./commands/DownloadAllCommand');
      }
      return DownloadCmd.run(getLogger(), this.getTransport(), localPath, targetPath, callback);
    };

    RemoteSync.prototype.downloadFile = function(localPath) {
      var realPath;
      if (this.isIgnore(localPath)) {
        return;
      }
      realPath = path.relative(this.projectPath, localPath);
      realPath = path.join(this.host.target, realPath).replace(/\\/g, "/");
      return this.getTransport().download(realPath);
    };

    RemoteSync.prototype.uploadFile = function(filePath) {
      var UploadListener, e, i, j, len, len1, ref, ref1, results, t;
      if (this.isIgnore(filePath)) {
        return;
      }
      if (!uploadCmd) {
        UploadListener = require("./UploadListener");
        uploadCmd = new UploadListener(getLogger());
      }
      if (this.host.saveOnUpload) {
        ref = atom.workspace.getTextEditors();
        for (i = 0, len = ref.length; i < len; i++) {
          e = ref[i];
          if (e.getPath() === filePath && e.isModified()) {
            e.save();
            if (this.host.uploadOnSave) {
              return;
            }
          }
        }
      }
      uploadCmd.handleSave(filePath, this.getTransport());
      ref1 = this.getUploadMirrors();
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        t = ref1[j];
        results.push(uploadCmd.handleSave(filePath, t));
      }
      return results;
    };

    RemoteSync.prototype.uploadFolder = function(dirPath) {
      return fs.traverseTree(dirPath, this.uploadFile.bind(this), (function(_this) {
        return function() {
          return !_this.isIgnore(dirPath);
        };
      })(this));
    };

    RemoteSync.prototype.initMonitor = function() {
      var _this;
      _this = this;
      return setTimeout(function() {
        var MutationObserver, observer, targetObject;
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        observer = new MutationObserver(function(mutations, observer) {
          _this.monitorStyles();
        });
        targetObject = document.querySelector('.tree-view');
        if (targetObject !== null) {
          return observer.observe(targetObject, {
            subtree: true,
            attributes: false,
            childList: true
          });
        }
      }, 250);
    };

    RemoteSync.prototype.monitorFile = function(dirPath, toggle, notifications) {
      var _this, fileName, index;
      if (toggle == null) {
        toggle = true;
      }
      if (notifications == null) {
        notifications = true;
      }
      if (!this.fileExists(dirPath) && !this.isDirectory(dirPath)) {
        return;
      }
      fileName = this.monitorFileName(dirPath);
      if (indexOf.call(MonitoredFiles, dirPath) < 0) {
        MonitoredFiles.push(dirPath);
        watcher.add(dirPath);
        if (notifications) {
          atom.notifications.addInfo("remote-sync: Watching file - *" + fileName + "*");
        }
        if (!watchChangeSet) {
          _this = this;
          watcher.on('change', function(path) {
            return _this.uploadFile(path);
          });
          watcher.on('unlink', function(path) {
            return _this.deleteFile(path);
          });
          watchChangeSet = true;
        }
      } else if (toggle) {
        watcher.unwatch(dirPath);
        index = MonitoredFiles.indexOf(dirPath);
        MonitoredFiles.splice(index, 1);
        if (notifications) {
          atom.notifications.addInfo("remote-sync: Unwatching file - *" + fileName + "*");
        }
      }
      return this.monitorStyles();
    };

    RemoteSync.prototype.monitorStyles = function() {
      var file, file_name, i, icon_file, item, j, len, len1, list_item, monitorClass, monitored, pulseClass, results;
      monitorClass = 'file-monitoring';
      pulseClass = 'pulse';
      monitored = document.querySelectorAll('.' + monitorClass);
      if (monitored !== null && monitored.length !== 0) {
        for (i = 0, len = monitored.length; i < len; i++) {
          item = monitored[i];
          item.classList.remove(monitorClass);
        }
      }
      results = [];
      for (j = 0, len1 = MonitoredFiles.length; j < len1; j++) {
        file = MonitoredFiles[j];
        file_name = file.replace(/(['"])/g, "\\$1");
        file_name = file.replace(/\\/g, '\\\\');
        icon_file = document.querySelector('[data-path="' + file_name + '"]');
        if (icon_file !== null) {
          list_item = icon_file.parentNode;
          list_item.classList.add(monitorClass);
          if (atom.config.get("remote-sync.monitorFileAnimation")) {
            results.push(list_item.classList.add(pulseClass));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    RemoteSync.prototype.monitorFilesList = function() {
      var file, files, i, k, len, ref, v, watchedPaths;
      files = "";
      watchedPaths = watcher.getWatched();
      for (k in watchedPaths) {
        v = watchedPaths[k];
        ref = watchedPaths[k];
        for (i = 0, len = ref.length; i < len; i++) {
          file = ref[i];
          files += file + "<br/>";
        }
      }
      if (files !== "") {
        return atom.notifications.addInfo("remote-sync: Currently watching:<br/>*" + files + "*");
      } else {
        return atom.notifications.addWarning("remote-sync: Currently not watching any files");
      }
    };

    RemoteSync.prototype.fileExists = function(dirPath) {
      var e, exists, file_name;
      file_name = this.monitorFileName(dirPath);
      try {
        exists = fs.statSync(dirPath);
        return true;
      } catch (error) {
        e = error;
        atom.notifications.addWarning("remote-sync: cannot find *" + file_name + "* to watch");
        return false;
      }
    };

    RemoteSync.prototype.isDirectory = function(dirPath) {
      var directory;
      if (directory = fs.statSync(dirPath).isDirectory()) {
        atom.notifications.addWarning("remote-sync: cannot watch directory - *" + dirPath + "*");
        return false;
      }
      return true;
    };

    RemoteSync.prototype.monitorFileName = function(dirPath) {
      var file;
      file = dirPath.split('\\').pop().split('/').pop();
      return file;
    };

    RemoteSync.prototype.initAutoFileWatch = function(projectPath) {
      var _this, filesName, i, len;
      _this = this;
      if (watchFiles.length !== 0) {
        for (i = 0, len = watchFiles.length; i < len; i++) {
          filesName = watchFiles[i];
          _this.setupAutoFileWatch(filesName, projectPath);
        }
        setTimeout(function() {
          return _this.monitorFilesList();
        }, 1500);
      }
    };

    RemoteSync.prototype.setupAutoFileWatch = function(filesName, projectPath) {
      var _this;
      _this = this;
      return setTimeout(function() {
        var fullpath;
        if (process.platform === "win32") {
          filesName = filesName.replace(/\//g, '\\');
        }
        fullpath = projectPath + filesName.replace(/^\s+|\s+$/g, "");
        return _this.monitorFile(fullpath, false, false);
      }, 250);
    };

    RemoteSync.prototype.uploadGitChange = function(dirPath) {
      var curRepo, i, isChangedPath, len, repo, repos, workingDirectory;
      repos = atom.project.getRepositories();
      curRepo = null;
      for (i = 0, len = repos.length; i < len; i++) {
        repo = repos[i];
        if (!repo) {
          continue;
        }
        workingDirectory = repo.getWorkingDirectory();
        if (this.inPath(workingDirectory, this.projectPath)) {
          curRepo = repo;
          break;
        }
      }
      if (!curRepo) {
        return;
      }
      isChangedPath = function(path) {
        var status;
        status = curRepo.getCachedPathStatus(path);
        return curRepo.isStatusModified(status) || curRepo.isStatusNew(status);
      };
      return fs.traverseTree(dirPath, (function(_this) {
        return function(path) {
          if (isChangedPath(path)) {
            return _this.uploadFile(path);
          }
        };
      })(this), (function(_this) {
        return function(path) {
          return !_this.isIgnore(path);
        };
      })(this));
    };

    RemoteSync.prototype.createTransport = function(host) {
      var Transport;
      if (host.transport === 'scp' || host.transport === 'sftp') {
        if (ScpTransport == null) {
          ScpTransport = require("./transports/ScpTransport");
        }
        Transport = ScpTransport;
      } else if (host.transport === 'ftp') {
        if (FtpTransport == null) {
          FtpTransport = require("./transports/FtpTransport");
        }
        Transport = FtpTransport;
      } else {
        throw new Error("[remote-sync] invalid transport: " + host.transport + " in " + this.configPath);
      }
      return new Transport(getLogger(), host, this.projectPath);
    };

    RemoteSync.prototype.getTransport = function() {
      if (this.transport) {
        return this.transport;
      }
      this.transport = this.createTransport(this.host);
      return this.transport;
    };

    RemoteSync.prototype.getUploadMirrors = function() {
      var host, i, len, ref;
      if (this.mirrorTransports) {
        return this.mirrorTransports;
      }
      this.mirrorTransports = [];
      if (this.host.uploadMirrors) {
        ref = this.host.uploadMirrors;
        for (i = 0, len = ref.length; i < len; i++) {
          host = ref[i];
          this.initIgnore(host);
          this.mirrorTransports.push(this.createTransport(host));
        }
      }
      return this.mirrorTransports;
    };

    RemoteSync.prototype.diffFile = function(localPath) {
      var os, realPath, targetPath;
      realPath = path.relative(this.projectPath, localPath);
      realPath = path.join(this.host.target, realPath).replace(/\\/g, "/");
      if (!os) {
        os = require("os");
      }
      targetPath = path.join(os.tmpDir(), "remote-sync", randomize('A0', 16));
      return this.getTransport().download(realPath, targetPath, (function(_this) {
        return function() {
          return _this.diff(localPath, targetPath);
        };
      })(this));
    };

    RemoteSync.prototype.diffFolder = function(localPath) {
      var os, targetPath;
      if (!os) {
        os = require("os");
      }
      targetPath = path.join(os.tmpDir(), "remote-sync", randomize('A0', 16));
      return this.downloadFolder(localPath, targetPath, (function(_this) {
        return function() {
          return _this.diff(localPath, targetPath);
        };
      })(this));
    };

    RemoteSync.prototype.diff = function(localPath, targetPath) {
      var diffCmd;
      if (this.isIgnore(localPath)) {
        return;
      }
      targetPath = path.join(targetPath, path.relative(this.projectPath, localPath));
      diffCmd = atom.config.get('remote-sync.difftoolCommand');
      if (exec == null) {
        exec = require("child_process").exec;
      }
      return exec("\"" + diffCmd + "\" \"" + localPath + "\" \"" + targetPath + "\"", function(err) {
        if (!err) {
          return;
        }
        return getLogger().error("Check [difftool Command] in your settings (remote-sync).\nCommand error: " + err + "\ncommand: " + diffCmd + " " + localPath + " " + targetPath);
      });
    };

    return RemoteSync;

  })();

  module.exports = {
    create: function(projectPath) {
      var configPath;
      configPath = path.join(projectPath, atom.config.get('remote-sync.configFileName'));
      if (!fs.existsSync(configPath)) {
        return;
      }
      return new RemoteSync(projectPath, configPath);
    },
    configure: function(projectPath, callback) {
      var configPath, emitter, host, view;
      if (HostView == null) {
        HostView = require('./view/host-view');
      }
      if (Host == null) {
        Host = require('./model/host');
      }
      if (EventEmitter == null) {
        EventEmitter = require("events").EventEmitter;
      }
      emitter = new EventEmitter();
      emitter.on("configured", callback);
      configPath = path.join(projectPath, atom.config.get('remote-sync.configFileName'));
      host = new Host(configPath, emitter);
      view = new HostView(host);
      return view.attach();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9yZW1vdGUtc3luYy9saWIvUmVtb3RlU3luYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9OQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSOztFQUVaLElBQUEsR0FBTzs7RUFDUCxTQUFBLEdBQVk7O0VBRVosWUFBQSxHQUFlOztFQUNmLFlBQUEsR0FBZTs7RUFFZixTQUFBLEdBQVk7O0VBQ1osV0FBQSxHQUFjOztFQUNkLElBQUEsR0FBTzs7RUFFUCxRQUFBLEdBQVc7O0VBQ1gsWUFBQSxHQUFlOztFQUVmLGNBQUEsR0FBaUI7O0VBQ2pCLFVBQUEsR0FBaUI7O0VBQ2pCLGNBQUEsR0FBaUI7O0VBQ2pCLE9BQUEsR0FBaUIsUUFBUSxDQUFDLEtBQVQsQ0FBQTs7RUFHakIsTUFBQSxHQUFTOztFQUNULFNBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLElBQUcsQ0FBSSxNQUFQO01BQ0UsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO01BQ1QsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPLGFBQVAsRUFGZjs7QUFHQSxXQUFPO0VBSkc7O0VBTU47SUFDUyxvQkFBQyxZQUFELEVBQWUsV0FBZjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsY0FBRDtNQUFjLElBQUMsQ0FBQSxhQUFEOztRQUMxQixPQUFRLE9BQUEsQ0FBUSxjQUFSOztNQUVSLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxJQUFBLENBQUssSUFBQyxDQUFBLFVBQU47TUFDWixVQUFBLHdDQUF3QixDQUFFLEtBQWIsQ0FBbUIsR0FBbkIsQ0FBdUIsQ0FBQyxNQUF4QixD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VUFBSCxDQUFjLFVBQWQsQ0FBZDtBQUFBLGVBQUE7O0FBQ0EsYUFBVyxJQUFBLFVBQUEsQ0FBVyxXQUFYLEVBQXdCLFVBQXhCO0lBSEwsQ0FBUjtJQUtBLFNBQUEsRUFBVyxTQUFDLFdBQUQsRUFBYyxRQUFkO0FBQ1QsVUFBQTs7UUFBQSxXQUFZLE9BQUEsQ0FBUSxrQkFBUjs7O1FBQ1osT0FBUSxPQUFBLENBQVEsY0FBUjs7O1FBQ1IsZUFBZ0IsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQzs7TUFFbEMsT0FBQSxHQUFjLElBQUEsWUFBQSxDQUFBO01BQ2QsT0FBTyxDQUFDLEVBQVIsQ0FBVyxZQUFYLEVBQXlCLFFBQXpCO01BRUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLENBQXZCO01BQ2IsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLFVBQUwsRUFBaUIsT0FBakI7TUFDWCxJQUFBLEdBQVcsSUFBQSxRQUFBLENBQVMsSUFBVDthQUNYLElBQUksQ0FBQyxNQUFMLENBQUE7SUFYUyxDQUxYOztBQTlTRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5mcyA9IHJlcXVpcmUgXCJmcy1wbHVzXCJcbmNob2tpZGFyID0gcmVxdWlyZSBcImNob2tpZGFyXCJcbnJhbmRvbWl6ZSA9IHJlcXVpcmUgXCJyYW5kb21hdGljXCJcblxuZXhlYyA9IG51bGxcbm1pbmltYXRjaCA9IG51bGxcblxuU2NwVHJhbnNwb3J0ID0gbnVsbFxuRnRwVHJhbnNwb3J0ID0gbnVsbFxuXG51cGxvYWRDbWQgPSBudWxsXG5Eb3dubG9hZENtZCA9IG51bGxcbkhvc3QgPSBudWxsXG5cbkhvc3RWaWV3ID0gbnVsbFxuRXZlbnRFbWl0dGVyID0gbnVsbFxuXG5Nb25pdG9yZWRGaWxlcyA9IFtdXG53YXRjaEZpbGVzICAgICA9IHt9XG53YXRjaENoYW5nZVNldCA9IGZhbHNlXG53YXRjaGVyICAgICAgICA9IGNob2tpZGFyLndhdGNoKClcblxuXG5sb2dnZXIgPSBudWxsXG5nZXRMb2dnZXIgPSAtPlxuICBpZiBub3QgbG9nZ2VyXG4gICAgTG9nZ2VyID0gcmVxdWlyZSBcIi4vTG9nZ2VyXCJcbiAgICBsb2dnZXIgPSBuZXcgTG9nZ2VyIFwiUmVtb3RlIFN5bmNcIlxuICByZXR1cm4gbG9nZ2VyXG5cbmNsYXNzIFJlbW90ZVN5bmNcbiAgY29uc3RydWN0b3I6IChAcHJvamVjdFBhdGgsIEBjb25maWdQYXRoKSAtPlxuICAgIEhvc3QgPz0gcmVxdWlyZSAnLi9tb2RlbC9ob3N0J1xuXG4gICAgQGhvc3QgPSBuZXcgSG9zdChAY29uZmlnUGF0aClcbiAgICB3YXRjaEZpbGVzID0gQGhvc3Qud2F0Y2g/LnNwbGl0KFwiLFwiKS5maWx0ZXIoQm9vbGVhbilcbiAgICBAcHJvamVjdFBhdGggPSBwYXRoLmpvaW4oQHByb2plY3RQYXRoLCBAaG9zdC5zb3VyY2UpIGlmIEBob3N0LnNvdXJjZVxuICAgIGlmIHdhdGNoRmlsZXM/XG4gICAgICBAaW5pdEF1dG9GaWxlV2F0Y2goQHByb2plY3RQYXRoKVxuICAgIEBpbml0SWdub3JlKEBob3N0KVxuICAgIEBpbml0TW9uaXRvcigpXG5cbiAgaW5pdElnbm9yZTogKGhvc3QpLT5cbiAgICBpZ25vcmUgPSBob3N0Lmlnbm9yZT8uc3BsaXQoXCIsXCIpXG4gICAgaG9zdC5pc0lnbm9yZSA9IChmaWxlUGF0aCwgcmVsYXRpdml6ZVBhdGgpID0+XG4gICAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgcmVsYXRpdml6ZVBhdGggb3IgQGluUGF0aChAcHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBpZ25vcmVcblxuICAgICAgcmVsYXRpdml6ZVBhdGggPSBAcHJvamVjdFBhdGggdW5sZXNzIHJlbGF0aXZpemVQYXRoXG4gICAgICBmaWxlUGF0aCA9IHBhdGgucmVsYXRpdmUgcmVsYXRpdml6ZVBhdGgsIGZpbGVQYXRoXG5cbiAgICAgIG1pbmltYXRjaCA/PSByZXF1aXJlIFwibWluaW1hdGNoXCJcbiAgICAgIGZvciBwYXR0ZXJuIGluIGlnbm9yZVxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBtaW5pbWF0Y2ggZmlsZVBhdGgsIHBhdHRlcm4sIHsgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUgfVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgaXNJZ25vcmU6IChmaWxlUGF0aCwgcmVsYXRpdml6ZVBhdGgpLT5cbiAgICByZXR1cm4gQGhvc3QuaXNJZ25vcmUoZmlsZVBhdGgsIHJlbGF0aXZpemVQYXRoKVxuXG4gIGluUGF0aDogKHJvb3RQYXRoLCBsb2NhbFBhdGgpLT5cbiAgICBsb2NhbFBhdGggPSBsb2NhbFBhdGggKyBwYXRoLnNlcCBpZiBmcy5pc0RpcmVjdG9yeVN5bmMobG9jYWxQYXRoKVxuICAgIHJldHVybiBsb2NhbFBhdGguaW5kZXhPZihyb290UGF0aCArIHBhdGguc2VwKSA9PSAwXG5cbiAgZGlzcG9zZTogLT5cbiAgICBpZiBAdHJhbnNwb3J0XG4gICAgICBAdHJhbnNwb3J0LmRpc3Bvc2UoKVxuICAgICAgQHRyYW5zcG9ydCA9IG51bGxcblxuICBkZWxldGVGaWxlOiAoZmlsZVBhdGgpIC0+XG4gICAgcmV0dXJuIGlmIEBpc0lnbm9yZShmaWxlUGF0aClcblxuICAgIGlmIG5vdCB1cGxvYWRDbWRcbiAgICAgIFVwbG9hZExpc3RlbmVyID0gcmVxdWlyZSBcIi4vVXBsb2FkTGlzdGVuZXJcIlxuICAgICAgdXBsb2FkQ21kID0gbmV3IFVwbG9hZExpc3RlbmVyIGdldExvZ2dlcigpXG5cbiAgICB1cGxvYWRDbWQuaGFuZGxlRGVsZXRlKGZpbGVQYXRoLCBAZ2V0VHJhbnNwb3J0KCkpXG4gICAgZm9yIHQgaW4gQGdldFVwbG9hZE1pcnJvcnMoKVxuICAgICAgdXBsb2FkQ21kLmhhbmRsZURlbGV0ZShmaWxlUGF0aCwgdClcblxuICAgIGlmIEBob3N0LmRlbGV0ZUxvY2FsXG4gICAgICBmcy5yZW1vdmVTeW5jKGZpbGVQYXRoKVxuXG4gIGRvd25sb2FkRm9sZGVyOiAobG9jYWxQYXRoLCB0YXJnZXRQYXRoLCBjYWxsYmFjayktPlxuICAgIERvd25sb2FkQ21kID89IHJlcXVpcmUgJy4vY29tbWFuZHMvRG93bmxvYWRBbGxDb21tYW5kJ1xuICAgIERvd25sb2FkQ21kLnJ1bihnZXRMb2dnZXIoKSwgQGdldFRyYW5zcG9ydCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFBhdGgsIHRhcmdldFBhdGgsIGNhbGxiYWNrKVxuXG4gIGRvd25sb2FkRmlsZTogKGxvY2FsUGF0aCktPlxuICAgIHJldHVybiBpZiBAaXNJZ25vcmUobG9jYWxQYXRoKVxuICAgIHJlYWxQYXRoID0gcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aClcbiAgICByZWFsUGF0aCA9IHBhdGguam9pbihAaG9zdC50YXJnZXQsIHJlYWxQYXRoKS5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuICAgIEBnZXRUcmFuc3BvcnQoKS5kb3dubG9hZChyZWFsUGF0aClcblxuICB1cGxvYWRGaWxlOiAoZmlsZVBhdGgpIC0+XG4gICAgcmV0dXJuIGlmIEBpc0lnbm9yZShmaWxlUGF0aClcblxuICAgIGlmIG5vdCB1cGxvYWRDbWRcbiAgICAgIFVwbG9hZExpc3RlbmVyID0gcmVxdWlyZSBcIi4vVXBsb2FkTGlzdGVuZXJcIlxuICAgICAgdXBsb2FkQ21kID0gbmV3IFVwbG9hZExpc3RlbmVyIGdldExvZ2dlcigpXG5cbiAgICBpZiBAaG9zdC5zYXZlT25VcGxvYWRcbiAgICAgIGZvciBlIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgICAgaWYgZS5nZXRQYXRoKCkgaXMgZmlsZVBhdGggYW5kIGUuaXNNb2RpZmllZCgpXG4gICAgICAgICAgZS5zYXZlKClcbiAgICAgICAgICByZXR1cm4gaWYgQGhvc3QudXBsb2FkT25TYXZlXG5cbiAgICB1cGxvYWRDbWQuaGFuZGxlU2F2ZShmaWxlUGF0aCwgQGdldFRyYW5zcG9ydCgpKVxuICAgIGZvciB0IGluIEBnZXRVcGxvYWRNaXJyb3JzKClcbiAgICAgIHVwbG9hZENtZC5oYW5kbGVTYXZlKGZpbGVQYXRoLCB0KVxuXG4gIHVwbG9hZEZvbGRlcjogKGRpclBhdGgpLT5cbiAgICBmcy50cmF2ZXJzZVRyZWUgZGlyUGF0aCwgQHVwbG9hZEZpbGUuYmluZChAKSwgPT5cbiAgICAgIHJldHVybiBub3QgQGlzSWdub3JlKGRpclBhdGgpXG5cbiAgaW5pdE1vbml0b3I6ICgpLT5cbiAgICBfdGhpcyA9IEBcbiAgICBzZXRUaW1lb3V0IC0+XG4gICAgICBNdXRhdGlvbk9ic2VydmVyID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgb3Igd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXJcbiAgICAgIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucywgb2JzZXJ2ZXIpIC0+XG4gICAgICAgIF90aGlzLm1vbml0b3JTdHlsZXMoKVxuICAgICAgICByZXR1cm5cbiAgICAgIClcblxuICAgICAgdGFyZ2V0T2JqZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnLnRyZWUtdmlldydcbiAgICAgIGlmIHRhcmdldE9iamVjdCAhPSBudWxsXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUgdGFyZ2V0T2JqZWN0LFxuICAgICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICAgICAgICBhdHRyaWJ1dGVzOiBmYWxzZVxuICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgICwgMjUwXG5cbiAgbW9uaXRvckZpbGU6IChkaXJQYXRoLCB0b2dnbGUgPSB0cnVlLCBub3RpZmljYXRpb25zID0gdHJ1ZSktPlxuICAgIHJldHVybiBpZiAhQGZpbGVFeGlzdHMoZGlyUGF0aCkgJiYgIUBpc0RpcmVjdG9yeShkaXJQYXRoKVxuXG4gICAgZmlsZU5hbWUgPSBALm1vbml0b3JGaWxlTmFtZShkaXJQYXRoKVxuICAgIGlmIGRpclBhdGggbm90IGluIE1vbml0b3JlZEZpbGVzXG4gICAgICBNb25pdG9yZWRGaWxlcy5wdXNoIGRpclBhdGhcbiAgICAgIHdhdGNoZXIuYWRkKGRpclBhdGgpXG4gICAgICBpZiBub3RpZmljYXRpb25zXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwicmVtb3RlLXN5bmM6IFdhdGNoaW5nIGZpbGUgLSAqXCIrZmlsZU5hbWUrXCIqXCJcblxuICAgICAgaWYgIXdhdGNoQ2hhbmdlU2V0XG4gICAgICAgIF90aGlzID0gQFxuICAgICAgICB3YXRjaGVyLm9uKCdjaGFuZ2UnLCAocGF0aCkgLT5cbiAgICAgICAgICBfdGhpcy51cGxvYWRGaWxlKHBhdGgpXG4gICAgICAgIClcbiAgICAgICAgd2F0Y2hlci5vbigndW5saW5rJywgKHBhdGgpIC0+XG4gICAgICAgICAgX3RoaXMuZGVsZXRlRmlsZShwYXRoKVxuICAgICAgICApXG4gICAgICAgIHdhdGNoQ2hhbmdlU2V0ID0gdHJ1ZVxuICAgIGVsc2UgaWYgdG9nZ2xlXG4gICAgICB3YXRjaGVyLnVud2F0Y2goZGlyUGF0aClcbiAgICAgIGluZGV4ID0gTW9uaXRvcmVkRmlsZXMuaW5kZXhPZihkaXJQYXRoKVxuICAgICAgTW9uaXRvcmVkRmlsZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgaWYgbm90aWZpY2F0aW9uc1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcInJlbW90ZS1zeW5jOiBVbndhdGNoaW5nIGZpbGUgLSAqXCIrZmlsZU5hbWUrXCIqXCJcbiAgICBALm1vbml0b3JTdHlsZXMoKVxuXG4gIG1vbml0b3JTdHlsZXM6ICgpLT5cbiAgICBtb25pdG9yQ2xhc3MgID0gJ2ZpbGUtbW9uaXRvcmluZydcbiAgICBwdWxzZUNsYXNzICAgID0gJ3B1bHNlJ1xuICAgIG1vbml0b3JlZCAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsICcuJyttb25pdG9yQ2xhc3NcblxuICAgIGlmIG1vbml0b3JlZCAhPSBudWxsIGFuZCBtb25pdG9yZWQubGVuZ3RoICE9IDBcbiAgICAgIGZvciBpdGVtIGluIG1vbml0b3JlZFxuICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUgbW9uaXRvckNsYXNzXG5cbiAgICBmb3IgZmlsZSBpbiBNb25pdG9yZWRGaWxlc1xuICAgICAgZmlsZV9uYW1lID0gZmlsZS5yZXBsYWNlKC8oWydcIl0pL2csIFwiXFxcXCQxXCIpO1xuICAgICAgZmlsZV9uYW1lID0gZmlsZS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpO1xuICAgICAgaWNvbl9maWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnW2RhdGEtcGF0aD1cIicrZmlsZV9uYW1lKydcIl0nXG4gICAgICBpZiBpY29uX2ZpbGUgIT0gbnVsbFxuICAgICAgICBsaXN0X2l0ZW0gPSBpY29uX2ZpbGUucGFyZW50Tm9kZVxuICAgICAgICBsaXN0X2l0ZW0uY2xhc3NMaXN0LmFkZCBtb25pdG9yQ2xhc3NcbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KFwicmVtb3RlLXN5bmMubW9uaXRvckZpbGVBbmltYXRpb25cIilcbiAgICAgICAgICBsaXN0X2l0ZW0uY2xhc3NMaXN0LmFkZCBwdWxzZUNsYXNzXG5cbiAgbW9uaXRvckZpbGVzTGlzdDogKCktPlxuICAgIGZpbGVzICAgICAgICA9IFwiXCJcbiAgICB3YXRjaGVkUGF0aHMgPSB3YXRjaGVyLmdldFdhdGNoZWQoKVxuICAgIGZvciBrLHYgb2Ygd2F0Y2hlZFBhdGhzXG4gICAgICBmb3IgZmlsZSBpbiB3YXRjaGVkUGF0aHNba11cbiAgICAgICAgZmlsZXMgKz0gZmlsZStcIjxici8+XCJcbiAgICBpZiBmaWxlcyAhPSBcIlwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcInJlbW90ZS1zeW5jOiBDdXJyZW50bHkgd2F0Y2hpbmc6PGJyLz4qXCIrZmlsZXMrXCIqXCJcbiAgICBlbHNlXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcInJlbW90ZS1zeW5jOiBDdXJyZW50bHkgbm90IHdhdGNoaW5nIGFueSBmaWxlc1wiXG5cbiAgZmlsZUV4aXN0czogKGRpclBhdGgpIC0+XG4gICAgZmlsZV9uYW1lID0gQG1vbml0b3JGaWxlTmFtZShkaXJQYXRoKVxuICAgIHRyeVxuICAgICAgZXhpc3RzID0gZnMuc3RhdFN5bmMoZGlyUGF0aClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgY2F0Y2ggZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJyZW1vdGUtc3luYzogY2Fubm90IGZpbmQgKlwiK2ZpbGVfbmFtZStcIiogdG8gd2F0Y2hcIlxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgaXNEaXJlY3Rvcnk6IChkaXJQYXRoKSAtPlxuICAgIGlmIGRpcmVjdG9yeSA9IGZzLnN0YXRTeW5jKGRpclBhdGgpLmlzRGlyZWN0b3J5KClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwicmVtb3RlLXN5bmM6IGNhbm5vdCB3YXRjaCBkaXJlY3RvcnkgLSAqXCIrZGlyUGF0aCtcIipcIlxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gdHJ1ZVxuXG4gIG1vbml0b3JGaWxlTmFtZTogKGRpclBhdGgpLT5cbiAgICBmaWxlID0gZGlyUGF0aC5zcGxpdCgnXFxcXCcpLnBvcCgpLnNwbGl0KCcvJykucG9wKClcbiAgICByZXR1cm4gZmlsZVxuXG4gIGluaXRBdXRvRmlsZVdhdGNoOiAocHJvamVjdFBhdGgpIC0+XG4gICAgX3RoaXMgPSBAXG4gICAgaWYgd2F0Y2hGaWxlcy5sZW5ndGggIT0gMFxuICAgICAgX3RoaXMuc2V0dXBBdXRvRmlsZVdhdGNoIGZpbGVzTmFtZSxwcm9qZWN0UGF0aCBmb3IgZmlsZXNOYW1lIGluIHdhdGNoRmlsZXNcbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgX3RoaXMubW9uaXRvckZpbGVzTGlzdCgpXG4gICAgICAsIDE1MDBcbiAgICAgIHJldHVyblxuXG4gIHNldHVwQXV0b0ZpbGVXYXRjaDogKGZpbGVzTmFtZSxwcm9qZWN0UGF0aCkgLT5cbiAgICBfdGhpcyA9IEBcbiAgICBzZXRUaW1lb3V0IC0+XG4gICAgICBpZiBwcm9jZXNzLnBsYXRmb3JtID09IFwid2luMzJcIlxuICAgICAgICBmaWxlc05hbWUgPSBmaWxlc05hbWUucmVwbGFjZSgvXFwvL2csICdcXFxcJylcbiAgICAgIGZ1bGxwYXRoID0gcHJvamVjdFBhdGggKyBmaWxlc05hbWUucmVwbGFjZSAvXlxccyt8XFxzKyQvZywgXCJcIlxuICAgICAgX3RoaXMubW9uaXRvckZpbGUoZnVsbHBhdGgsZmFsc2UsZmFsc2UpXG4gICAgLCAyNTBcblxuXG4gIHVwbG9hZEdpdENoYW5nZTogKGRpclBhdGgpLT5cbiAgICByZXBvcyA9IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVxuICAgIGN1clJlcG8gPSBudWxsXG4gICAgZm9yIHJlcG8gaW4gcmVwb3NcbiAgICAgIGNvbnRpbnVlIHVubGVzcyByZXBvXG4gICAgICB3b3JraW5nRGlyZWN0b3J5ID0gcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgICAgIGlmIEBpblBhdGgod29ya2luZ0RpcmVjdG9yeSwgQHByb2plY3RQYXRoKVxuICAgICAgICBjdXJSZXBvID0gcmVwb1xuICAgICAgICBicmVha1xuICAgIHJldHVybiB1bmxlc3MgY3VyUmVwb1xuXG4gICAgaXNDaGFuZ2VkUGF0aCA9IChwYXRoKS0+XG4gICAgICBzdGF0dXMgPSBjdXJSZXBvLmdldENhY2hlZFBhdGhTdGF0dXMocGF0aClcbiAgICAgIHJldHVybiBjdXJSZXBvLmlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzKSBvciBjdXJSZXBvLmlzU3RhdHVzTmV3KHN0YXR1cylcblxuICAgIGZzLnRyYXZlcnNlVHJlZSBkaXJQYXRoLCAocGF0aCk9PlxuICAgICAgQHVwbG9hZEZpbGUocGF0aCkgaWYgaXNDaGFuZ2VkUGF0aChwYXRoKVxuICAgICwgKHBhdGgpPT4gcmV0dXJuIG5vdCBAaXNJZ25vcmUocGF0aClcblxuICBjcmVhdGVUcmFuc3BvcnQ6IChob3N0KS0+XG4gICAgaWYgaG9zdC50cmFuc3BvcnQgaXMgJ3NjcCcgb3IgaG9zdC50cmFuc3BvcnQgaXMgJ3NmdHAnXG4gICAgICBTY3BUcmFuc3BvcnQgPz0gcmVxdWlyZSBcIi4vdHJhbnNwb3J0cy9TY3BUcmFuc3BvcnRcIlxuICAgICAgVHJhbnNwb3J0ID0gU2NwVHJhbnNwb3J0XG4gICAgZWxzZSBpZiBob3N0LnRyYW5zcG9ydCBpcyAnZnRwJ1xuICAgICAgRnRwVHJhbnNwb3J0ID89IHJlcXVpcmUgXCIuL3RyYW5zcG9ydHMvRnRwVHJhbnNwb3J0XCJcbiAgICAgIFRyYW5zcG9ydCA9IEZ0cFRyYW5zcG9ydFxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIltyZW1vdGUtc3luY10gaW52YWxpZCB0cmFuc3BvcnQ6IFwiICsgaG9zdC50cmFuc3BvcnQgKyBcIiBpbiBcIiArIEBjb25maWdQYXRoKVxuXG4gICAgcmV0dXJuIG5ldyBUcmFuc3BvcnQoZ2V0TG9nZ2VyKCksIGhvc3QsIEBwcm9qZWN0UGF0aClcblxuICBnZXRUcmFuc3BvcnQ6IC0+XG4gICAgcmV0dXJuIEB0cmFuc3BvcnQgaWYgQHRyYW5zcG9ydFxuICAgIEB0cmFuc3BvcnQgPSBAY3JlYXRlVHJhbnNwb3J0KEBob3N0KVxuICAgIHJldHVybiBAdHJhbnNwb3J0XG5cbiAgZ2V0VXBsb2FkTWlycm9yczogLT5cbiAgICByZXR1cm4gQG1pcnJvclRyYW5zcG9ydHMgaWYgQG1pcnJvclRyYW5zcG9ydHNcbiAgICBAbWlycm9yVHJhbnNwb3J0cyA9IFtdXG4gICAgaWYgQGhvc3QudXBsb2FkTWlycm9yc1xuICAgICAgZm9yIGhvc3QgaW4gQGhvc3QudXBsb2FkTWlycm9yc1xuICAgICAgICBAaW5pdElnbm9yZShob3N0KVxuICAgICAgICBAbWlycm9yVHJhbnNwb3J0cy5wdXNoIEBjcmVhdGVUcmFuc3BvcnQoaG9zdClcbiAgICByZXR1cm4gQG1pcnJvclRyYW5zcG9ydHNcblxuICBkaWZmRmlsZTogKGxvY2FsUGF0aCktPlxuICAgIHJlYWxQYXRoID0gcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aClcbiAgICByZWFsUGF0aCA9IHBhdGguam9pbihAaG9zdC50YXJnZXQsIHJlYWxQYXRoKS5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKVxuXG4gICAgb3MgPSByZXF1aXJlIFwib3NcIiBpZiBub3Qgb3NcbiAgICB0YXJnZXRQYXRoID0gcGF0aC5qb2luIG9zLnRtcERpcigpLCBcInJlbW90ZS1zeW5jXCIsIHJhbmRvbWl6ZSgnQTAnLCAxNilcblxuICAgIEBnZXRUcmFuc3BvcnQoKS5kb3dubG9hZCByZWFsUGF0aCwgdGFyZ2V0UGF0aCwgPT5cbiAgICAgIEBkaWZmIGxvY2FsUGF0aCwgdGFyZ2V0UGF0aFxuXG4gIGRpZmZGb2xkZXI6IChsb2NhbFBhdGgpLT5cbiAgICBvcyA9IHJlcXVpcmUgXCJvc1wiIGlmIG5vdCBvc1xuICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4gb3MudG1wRGlyKCksIFwicmVtb3RlLXN5bmNcIiwgcmFuZG9taXplKCdBMCcsIDE2KVxuICAgIEBkb3dubG9hZEZvbGRlciBsb2NhbFBhdGgsIHRhcmdldFBhdGgsID0+XG4gICAgICBAZGlmZiBsb2NhbFBhdGgsIHRhcmdldFBhdGhcblxuICBkaWZmOiAobG9jYWxQYXRoLCB0YXJnZXRQYXRoKSAtPlxuICAgIHJldHVybiBpZiBAaXNJZ25vcmUobG9jYWxQYXRoKVxuICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UGF0aCwgcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aCkpXG4gICAgZGlmZkNtZCA9IGF0b20uY29uZmlnLmdldCgncmVtb3RlLXN5bmMuZGlmZnRvb2xDb21tYW5kJylcbiAgICBleGVjID89IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpLmV4ZWNcbiAgICBleGVjIFwiXFxcIiN7ZGlmZkNtZH1cXFwiIFxcXCIje2xvY2FsUGF0aH1cXFwiIFxcXCIje3RhcmdldFBhdGh9XFxcIlwiLCAoZXJyKS0+XG4gICAgICByZXR1cm4gaWYgbm90IGVyclxuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IgXCJcIlwiQ2hlY2sgW2RpZmZ0b29sIENvbW1hbmRdIGluIHlvdXIgc2V0dGluZ3MgKHJlbW90ZS1zeW5jKS5cbiAgICAgICBDb21tYW5kIGVycm9yOiAje2Vycn1cbiAgICAgICBjb21tYW5kOiAje2RpZmZDbWR9ICN7bG9jYWxQYXRofSAje3RhcmdldFBhdGh9XG4gICAgICBcIlwiXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjcmVhdGU6IChwcm9qZWN0UGF0aCktPlxuICAgIGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4gcHJvamVjdFBhdGgsIGF0b20uY29uZmlnLmdldCgncmVtb3RlLXN5bmMuY29uZmlnRmlsZU5hbWUnKVxuICAgIHJldHVybiB1bmxlc3MgZnMuZXhpc3RzU3luYyBjb25maWdQYXRoXG4gICAgcmV0dXJuIG5ldyBSZW1vdGVTeW5jKHByb2plY3RQYXRoLCBjb25maWdQYXRoKVxuXG4gIGNvbmZpZ3VyZTogKHByb2plY3RQYXRoLCBjYWxsYmFjayktPlxuICAgIEhvc3RWaWV3ID89IHJlcXVpcmUgJy4vdmlldy9ob3N0LXZpZXcnXG4gICAgSG9zdCA/PSByZXF1aXJlICcuL21vZGVsL2hvc3QnXG4gICAgRXZlbnRFbWl0dGVyID89IHJlcXVpcmUoXCJldmVudHNcIikuRXZlbnRFbWl0dGVyXG5cbiAgICBlbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gICAgZW1pdHRlci5vbiBcImNvbmZpZ3VyZWRcIiwgY2FsbGJhY2tcblxuICAgIGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4gcHJvamVjdFBhdGgsIGF0b20uY29uZmlnLmdldCgncmVtb3RlLXN5bmMuY29uZmlnRmlsZU5hbWUnKVxuICAgIGhvc3QgPSBuZXcgSG9zdChjb25maWdQYXRoLCBlbWl0dGVyKVxuICAgIHZpZXcgPSBuZXcgSG9zdFZpZXcoaG9zdClcbiAgICB2aWV3LmF0dGFjaCgpXG4iXX0=
