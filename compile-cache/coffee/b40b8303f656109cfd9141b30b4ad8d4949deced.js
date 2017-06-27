(function() {
  var CompositeDisposable, MinimapHighlightSelected, MinimapHighlightSelectedView, requirePackages,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapHighlightSelectedView = null;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.destroyViews = __bind(this.destroyViews, this);
      this.createViews = __bind(this.createViews, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapHighlightSelected.prototype.activate = function(state) {};

    MinimapHighlightSelected.prototype.consumeMinimapServiceV1 = function(minimap) {
      this.minimap = minimap;
      return requirePackages('highlight-selected').then((function(_this) {
        return function(_arg) {
          _this.highlightSelected = _arg[0];
          MinimapHighlightSelectedView = require('./minimap-highlight-selected-view')();
          return _this.minimap.registerPlugin('highlight-selected', _this);
        };
      })(this));
    };

    MinimapHighlightSelected.prototype.deactivate = function() {
      this.deactivatePlugin();
      this.minimapPackage = null;
      this.highlightSelectedPackage = null;
      this.highlightSelected = null;
      return this.minimap = null;
    };

    MinimapHighlightSelected.prototype.isActive = function() {
      return this.active;
    };

    MinimapHighlightSelected.prototype.activatePlugin = function() {
      if (this.active) {
        return;
      }
      this.active = true;
      this.createViews();
      this.subscriptions.add(this.minimap.onDidActivate(this.createViews));
      return this.subscriptions.add(this.minimap.onDidDeactivate(this.destroyViews));
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.destroyViews();
      return this.subscriptions.dispose();
    };

    MinimapHighlightSelected.prototype.createViews = function() {
      if (this.viewsCreated) {
        return;
      }
      this.viewsCreated = true;
      this.view = new MinimapHighlightSelectedView(this.minimap);
      return this.view.handleSelection();
    };

    MinimapHighlightSelected.prototype.destroyViews = function() {
      if (!this.viewsCreated) {
        return;
      }
      this.viewsCreated = false;
      this.view.removeMarkers();
      return this.view.destroy();
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC9saWIvbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRGQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLGtCQUFtQixPQUFBLENBQVEsWUFBUixFQUFuQixlQURELENBQUE7O0FBQUEsRUFFQSw0QkFBQSxHQUErQixJQUYvQixDQUFBOztBQUFBLEVBSU07QUFDUyxJQUFBLGtDQUFBLEdBQUE7QUFDWCx5REFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQURXO0lBQUEsQ0FBYjs7QUFBQSx1Q0FHQSxRQUFBLEdBQVUsU0FBQyxLQUFELEdBQUEsQ0FIVixDQUFBOztBQUFBLHVDQUtBLHVCQUFBLEdBQXlCLFNBQUUsT0FBRixHQUFBO0FBQ3ZCLE1BRHdCLElBQUMsQ0FBQSxVQUFBLE9BQ3pCLENBQUE7YUFBQSxlQUFBLENBQWdCLG9CQUFoQixDQUFxQyxDQUFDLElBQXRDLENBQTJDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUN6QyxVQUQyQyxLQUFDLENBQUEsb0JBQUYsT0FDMUMsQ0FBQTtBQUFBLFVBQUEsNEJBQUEsR0FBK0IsT0FBQSxDQUFRLG1DQUFSLENBQUEsQ0FBQSxDQUEvQixDQUFBO2lCQUVBLEtBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixvQkFBeEIsRUFBOEMsS0FBOUMsRUFIeUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxD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

//# sourceURL=/Users/gaelen/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected.coffee
