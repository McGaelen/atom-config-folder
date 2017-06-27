(function() {
  var CMD_TOGGLE, CompositeDisposable, EVT_SWITCH, GitControl, GitControlView, git, item, pane, view, views;

  GitControlView = require('./git-control-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  git = require('./git');

  CMD_TOGGLE = 'git-control:toggle';

  EVT_SWITCH = 'pane-container:active-pane-item-changed';

  views = [];

  view = void 0;

  pane = void 0;

  item = void 0;

  module.exports = GitControl = {
    activate: function(state) {
      console.log('GitControl: activate');
      atom.commands.add('atom-workspace', CMD_TOGGLE, (function(_this) {
        return function() {
          return _this.toggleView();
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          return _this.updateViews();
        };
      })(this));
      atom.project.onDidChangePaths((function(_this) {
        return function() {
          return _this.updatePaths();
        };
      })(this));
    },
    deactivate: function() {
      console.log('GitControl: deactivate');
    },
    toggleView: function() {
      console.log('GitControl: toggle');
      if (!(view && view.active)) {
        view = new GitControlView();
        views.push(view);
        pane = atom.workspace.getActivePane();
        item = pane.addItem(view, {
          index: 0
        });
        pane.activateItem(item);
      } else {
        pane.destroyItem(item);
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    updateViews: function() {
      var activeView, i, len, v;
      activeView = atom.workspace.getActivePane().getActiveItem();
      for (i = 0, len = views.length; i < len; i++) {
        v = views[i];
        if (v === activeView) {
          v.update();
        }
      }
    },
    updatePaths: function() {
      git.setProjectIndex(0);
    },
    serialize: function() {},
    config: {
      showGitFlowButton: {
        title: 'Show GitFlow button',
        description: 'Show the GitFlow button in the Git Control toolbar',
        type: 'boolean',
        "default": true
      },
      noFastForward: {
        title: 'Disable Fast Forward',
        description: 'Disable Fast Forward for default at Git Merge',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LWNvbnRyb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDaEIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBRU4sVUFBQSxHQUFhOztFQUNiLFVBQUEsR0FBYTs7RUFFYixLQUFBLEdBQVE7O0VBQ1IsSUFBQSxHQUFPOztFQUNQLElBQUEsR0FBTzs7RUFDUCxJQUFBLEdBQU87O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUVmO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVo7TUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLFVBQXBDLEVBQWdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhEO01BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFBVSxLQUFDLENBQUEsV0FBRCxDQUFBO1FBQVY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO01BQ0EsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBYixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQUxRLENBQVY7SUFRQSxVQUFBLEVBQVksU0FBQTtNQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVo7SUFEVSxDQVJaO0lBWUEsVUFBQSxFQUFZLFNBQUE7TUFDVixPQUFPLENBQUMsR0FBUixDQUFZLG9CQUFaO01BRUEsSUFBQSxDQUFBLENBQU8sSUFBQSxJQUFTLElBQUksQ0FBQyxNQUFyQixDQUFBO1FBQ0UsSUFBQSxHQUFXLElBQUEsY0FBQSxDQUFBO1FBQ1gsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO1FBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO1FBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUFtQjtVQUFDLEtBQUEsRUFBTyxDQUFSO1NBQW5CO1FBRVAsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsSUFBbEIsRUFQRjtPQUFBLE1BQUE7UUFVRSxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixFQVZGOztJQUhVLENBWlo7SUE2QkEsV0FBQSxFQUFhLFNBQUE7TUFDVixHQUFHLENBQUMsZUFBSixDQUFvQixDQUFwQjtJQURVLENBN0JiO0lBaUNBLFdBQUEsRUFBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLGFBQS9CLENBQUE7QUFDYixXQUFBLHVDQUFBOztZQUFvQixDQUFBLEtBQUs7VUFDdkIsQ0FBQyxDQUFDLE1BQUYsQ0FBQTs7QUFERjtJQUZXLENBakNiO0lBdUNBLFdBQUEsRUFBYSxTQUFBO01BRVgsR0FBRyxDQUFDLGVBQUosQ0FBb0IsQ0FBcEI7SUFGVyxDQXZDYjtJQTRDQSxTQUFBLEVBQVcsU0FBQSxHQUFBLENBNUNYO0lBOENBLE1BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8scUJBQVA7UUFDQSxXQUFBLEVBQWEsb0RBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtPQURGO01BS0EsYUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHNCQUFQO1FBQ0EsV0FBQSxFQUFhLCtDQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7T0FORjtLQS9DRjs7QUFkRiIsInNvdXJjZXNDb250ZW50IjpbIkdpdENvbnRyb2xWaWV3ID0gcmVxdWlyZSAnLi9naXQtY29udHJvbC12aWV3J1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmdpdCA9IHJlcXVpcmUgJy4vZ2l0J1xuXG5DTURfVE9HR0xFID0gJ2dpdC1jb250cm9sOnRvZ2dsZSdcbkVWVF9TV0lUQ0ggPSAncGFuZS1jb250YWluZXI6YWN0aXZlLXBhbmUtaXRlbS1jaGFuZ2VkJ1xuXG52aWV3cyA9IFtdXG52aWV3ID0gdW5kZWZpbmVkXG5wYW5lID0gdW5kZWZpbmVkXG5pdGVtID0gdW5kZWZpbmVkXG5cbm1vZHVsZS5leHBvcnRzID0gR2l0Q29udHJvbCA9XG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBjb25zb2xlLmxvZyAnR2l0Q29udHJvbDogYWN0aXZhdGUnXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBDTURfVE9HR0xFLCA9PiBAdG9nZ2xlVmlldygpXG4gICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT4gQHVwZGF0ZVZpZXdzKClcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyA9PiBAdXBkYXRlUGF0aHMoKVxuICAgIHJldHVyblxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgY29uc29sZS5sb2cgJ0dpdENvbnRyb2w6IGRlYWN0aXZhdGUnXG4gICAgcmV0dXJuXG5cbiAgdG9nZ2xlVmlldzogLT5cbiAgICBjb25zb2xlLmxvZyAnR2l0Q29udHJvbDogdG9nZ2xlJ1xuXG4gICAgdW5sZXNzIHZpZXcgYW5kIHZpZXcuYWN0aXZlXG4gICAgICB2aWV3ID0gbmV3IEdpdENvbnRyb2xWaWV3KClcbiAgICAgIHZpZXdzLnB1c2ggdmlld1xuXG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICBpdGVtID0gcGFuZS5hZGRJdGVtIHZpZXcsIHtpbmRleDogMH1cblxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0gaXRlbVxuXG4gICAgZWxzZVxuICAgICAgcGFuZS5kZXN0cm95SXRlbSBpdGVtXG5cbiAgICByZXR1cm5cblxuICB1cGRhdGVQYXRoczogLT5cbiAgICAgZ2l0LnNldFByb2plY3RJbmRleCgwKVxuICAgICByZXR1cm5cblxuICB1cGRhdGVWaWV3czogLT5cbiAgICBhY3RpdmVWaWV3ID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldEFjdGl2ZUl0ZW0oKVxuICAgIGZvciB2IGluIHZpZXdzIHdoZW4gdiBpcyBhY3RpdmVWaWV3XG4gICAgICB2LnVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgdXBkYXRlUGF0aHM6IC0+XG4gICAgIyB3aGVuIHByb2plY3RzIHBhdGhzIGNoYW5nZWQgcmVzdGFydCB3aXRoaW4gMFxuICAgIGdpdC5zZXRQcm9qZWN0SW5kZXgoMCk7XG4gICAgcmV0dXJuXG5cbiAgc2VyaWFsaXplOiAtPlxuXG4gIGNvbmZpZzpcbiAgICBzaG93R2l0Rmxvd0J1dHRvbjpcbiAgICAgIHRpdGxlOiAnU2hvdyBHaXRGbG93IGJ1dHRvbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyB0aGUgR2l0RmxvdyBidXR0b24gaW4gdGhlIEdpdCBDb250cm9sIHRvb2xiYXInXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBub0Zhc3RGb3J3YXJkOlxuICAgICAgdGl0bGU6ICdEaXNhYmxlIEZhc3QgRm9yd2FyZCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGlzYWJsZSBGYXN0IEZvcndhcmQgZm9yIGRlZmF1bHQgYXQgR2l0IE1lcmdlJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuIl19
