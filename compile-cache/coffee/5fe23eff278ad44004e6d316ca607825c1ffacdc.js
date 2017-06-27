(function() {
  var CompositeDisposable, Debugger, DebuggerView, OpenDialogView, fs;

  OpenDialogView = require('./open-dialog-view');

  DebuggerView = require('./debugger-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs');

  module.exports = Debugger = {
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'debugger:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:close': (function(_this) {
          return function() {
            var ref;
            if ((ref = _this.debuggerView) != null) {
              ref.destroy();
            }
            return _this.debuggerView = null;
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': (function(_this) {
          return function() {
            var ref;
            if ((ref = _this.debuggerView) != null) {
              ref.destroy();
            }
            return _this.debuggerView = null;
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref;
      this.subscriptions.dispose();
      this.openDialogView.destroy();
      return (ref = this.debuggerView) != null ? ref.destroy() : void 0;
    },
    serialize: function() {},
    toggle: function() {
      if (this.debuggerView && this.debuggerView.hasParent()) {
        this.debuggerView.destroy();
        return this.debuggerView = null;
      } else {
        return this.openDialogView = new OpenDialogView((function(_this) {
          return function(target, mainBreak) {
            if (fs.existsSync(target)) {
              return _this.debuggerView = new DebuggerView(target, mainBreak);
            } else {
              return atom.confirm({
                detailedMessage: "Can't find file " + target + ".",
                buttons: {
                  Exit: function() {}
                }
              });
            }
          };
        })(this));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdG9tLWRlYnVnZ2VyL2xpYi9kZWJ1Z2dlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUNqQixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNkLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDZjtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUVSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFHckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSxpQkFBQSxFQUFtQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7T0FBcEMsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLFlBQUEsRUFBYyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ25FLGdCQUFBOztpQkFBYSxDQUFFLE9BQWYsQ0FBQTs7bUJBQ0EsS0FBQyxDQUFBLFlBQUQsR0FBZ0I7VUFGbUQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7T0FBcEMsQ0FBbkI7YUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ3BFLGdCQUFBOztpQkFBYSxDQUFFLE9BQWYsQ0FBQTs7bUJBQ0EsS0FBQyxDQUFBLFlBQUQsR0FBZ0I7VUFGb0Q7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWY7T0FBcEMsQ0FBbkI7SUFUUSxDQUZWO0lBZUEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLE9BQWhCLENBQUE7b0RBQ2EsQ0FBRSxPQUFmLENBQUE7SUFIVSxDQWZaO0lBb0JBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0FwQlg7SUFzQkEsTUFBQSxFQUFRLFNBQUE7TUFDTixJQUFHLElBQUMsQ0FBQSxZQUFELElBQWtCLElBQUMsQ0FBQSxZQUFZLENBQUMsU0FBZCxDQUFBLENBQXJCO1FBQ0UsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUE7ZUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQUZsQjtPQUFBLE1BQUE7ZUFJRSxJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLGNBQUEsQ0FBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQsRUFBUyxTQUFUO1lBQ25DLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxNQUFkLENBQUg7cUJBQ0UsS0FBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxZQUFBLENBQWEsTUFBYixFQUFxQixTQUFyQixFQUR0QjthQUFBLE1BQUE7cUJBR0UsSUFBSSxDQUFDLE9BQUwsQ0FDRTtnQkFBQSxlQUFBLEVBQWlCLGtCQUFBLEdBQW1CLE1BQW5CLEdBQTBCLEdBQTNDO2dCQUNBLE9BQUEsRUFDRTtrQkFBQSxJQUFBLEVBQU0sU0FBQSxHQUFBLENBQU47aUJBRkY7ZUFERixFQUhGOztVQURtQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixFQUp4Qjs7SUFETSxDQXRCUjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIk9wZW5EaWFsb2dWaWV3ID0gcmVxdWlyZSAnLi9vcGVuLWRpYWxvZy12aWV3J1xuRGVidWdnZXJWaWV3ID0gcmVxdWlyZSAnLi9kZWJ1Z2dlci12aWV3J1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMnXG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXIgPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2RlYnVnZ2VyOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnY29yZTpjbG9zZSc6ID0+XG4gICAgICBAZGVidWdnZXJWaWV3Py5kZXN0cm95KClcbiAgICAgIEBkZWJ1Z2dlclZpZXcgPSBudWxsXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdjb3JlOmNhbmNlbCc6ID0+XG4gICAgICBAZGVidWdnZXJWaWV3Py5kZXN0cm95KClcbiAgICAgIEBkZWJ1Z2dlclZpZXcgPSBudWxsXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAb3BlbkRpYWxvZ1ZpZXcuZGVzdHJveSgpXG4gICAgQGRlYnVnZ2VyVmlldz8uZGVzdHJveSgpXG5cbiAgc2VyaWFsaXplOiAtPlxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAZGVidWdnZXJWaWV3IGFuZCBAZGVidWdnZXJWaWV3Lmhhc1BhcmVudCgpXG4gICAgICBAZGVidWdnZXJWaWV3LmRlc3Ryb3koKVxuICAgICAgQGRlYnVnZ2VyVmlldyA9IG51bGxcbiAgICBlbHNlXG4gICAgICBAb3BlbkRpYWxvZ1ZpZXcgPSBuZXcgT3BlbkRpYWxvZ1ZpZXcgKHRhcmdldCwgbWFpbkJyZWFrKSA9PlxuICAgICAgICBpZiBmcy5leGlzdHNTeW5jKHRhcmdldClcbiAgICAgICAgICBAZGVidWdnZXJWaWV3ID0gbmV3IERlYnVnZ2VyVmlldyh0YXJnZXQsIG1haW5CcmVhaylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0b20uY29uZmlybVxuICAgICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIkNhbid0IGZpbmQgZmlsZSAje3RhcmdldH0uXCJcbiAgICAgICAgICAgIGJ1dHRvbnM6XG4gICAgICAgICAgICAgIEV4aXQ6ID0+XG4iXX0=
