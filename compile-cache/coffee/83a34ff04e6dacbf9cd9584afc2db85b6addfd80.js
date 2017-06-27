(function() {
  var CompositeDisposable, FindAndReplace, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  FindAndReplace = null;

  module.exports = MinimapFindAndReplaceBinding = (function() {
    function MinimapFindAndReplaceBinding(minimap, fnrAPI) {
      this.minimap = minimap;
      this.fnrAPI = fnrAPI;
      this.editor = this.minimap.getTextEditor();
      this.subscriptions = new CompositeDisposable;
      this.decorationsByMarkerId = {};
      this.subscriptionsByMarkerId = {};
      if (this.fnrAPI != null) {
        this.layer = this.fnrAPI.resultsMarkerLayerForTextEditor(this.editor);
        this.subscriptions.add(this.layer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      }
      this.discoverMarkers();
    }

    MinimapFindAndReplaceBinding.prototype.destroy = function() {
      var decoration, id, sub, _ref, _ref1;
      _ref = this.subscriptionsByMarkerId;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
      }
      _ref1 = this.decorationsByMarkerId;
      for (id in _ref1) {
        decoration = _ref1[id];
        decoration.destroy();
      }
      this.subscriptions.dispose();
      this.minimap = null;
      this.editor = null;
      this.decorationsByMarkerId = {};
      return this.subscriptionsByMarkerId = {};
    };

    MinimapFindAndReplaceBinding.prototype.clear = function() {
      var decoration, id, sub, _ref, _ref1, _results;
      _ref = this.subscriptionsByMarkerId;
      for (id in _ref) {
        sub = _ref[id];
        sub.dispose();
        delete this.subscriptionsByMarkerId[id];
      }
      _ref1 = this.decorationsByMarkerId;
      _results = [];
      for (id in _ref1) {
        decoration = _ref1[id];
        decoration.destroy();
        _results.push(delete this.decorationsByMarkerId[id]);
      }
      return _results;
    };

    MinimapFindAndReplaceBinding.prototype.findAndReplace = function() {
      return FindAndReplace != null ? FindAndReplace : FindAndReplace = atom.packages.getLoadedPackage('find-and-replace').mainModule;
    };

    MinimapFindAndReplaceBinding.prototype.discoverMarkers = function() {
      if (this.fnrAPI != null) {
        return this.layer.getMarkers().forEach((function(_this) {
          return function(marker) {
            return _this.createDecoration(marker);
          };
        })(this));
      } else {
        return this.editor.findMarkers({
          "class": 'find-result'
        }).forEach((function(_this) {
          return function(marker) {
            return _this.createDecoration(marker);
          };
        })(this));
      }
    };

    MinimapFindAndReplaceBinding.prototype.handleCreatedMarker = function(marker) {
      var _ref;
      if ((this.fnrAPI != null) || ((_ref = marker.getProperties()) != null ? _ref["class"] : void 0) === 'find-result') {
        return this.createDecoration(marker);
      }
    };

    MinimapFindAndReplaceBinding.prototype.createDecoration = function(marker) {
      var decoration, id;
      if (!this.findViewIsVisible()) {
        return;
      }
      if (this.decorationsByMarkerId[marker.id] != null) {
        return;
      }
      decoration = this.minimap.decorateMarker(marker, {
        type: 'highlight',
        scope: ".minimap .search-result",
        plugin: 'find-and-replace'
      });
      if (decoration == null) {
        return;
      }
      id = marker.id;
      this.decorationsByMarkerId[id] = decoration;
      return this.subscriptionsByMarkerId[id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptionsByMarkerId[id].dispose();
          delete _this.decorationsByMarkerId[id];
          return delete _this.subscriptionsByMarkerId[id];
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.findViewIsVisible = function() {
      var _ref, _ref1;
      return (_ref = this.findAndReplace()) != null ? (_ref1 = _ref.findView) != null ? _ref1.is(':visible') : void 0 : void 0;
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2UvbGliL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS1iaW5kaW5nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpRUFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixJQURqQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0NBQUUsT0FBRixFQUFZLE1BQVosR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFEc0IsSUFBQyxDQUFBLFNBQUEsTUFDdkIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFEakIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLHFCQUFELEdBQXlCLEVBRnpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixFQUgzQixDQUFBO0FBS0EsTUFBQSxJQUFHLG1CQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsK0JBQVIsQ0FBd0MsSUFBQyxDQUFBLE1BQXpDLENBQVQsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLE1BQUQsR0FBQTttQkFDMUMsS0FBQyxDQUFBLG1C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

//# sourceURL=/Users/gaelen/.atom/packages/minimap-find-and-replace/lib/minimap-find-and-replace-binding.coffee
