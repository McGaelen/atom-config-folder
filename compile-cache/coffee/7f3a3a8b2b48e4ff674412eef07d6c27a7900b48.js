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
      var decoration, id, ref, ref1, sub;
      ref = this.subscriptionsByMarkerId;
      for (id in ref) {
        sub = ref[id];
        sub.dispose();
      }
      ref1 = this.decorationsByMarkerId;
      for (id in ref1) {
        decoration = ref1[id];
        decoration.destroy();
      }
      this.subscriptions.dispose();
      this.minimap = null;
      this.editor = null;
      this.decorationsByMarkerId = {};
      return this.subscriptionsByMarkerId = {};
    };

    MinimapFindAndReplaceBinding.prototype.clear = function() {
      var decoration, id, ref, ref1, results, sub;
      ref = this.subscriptionsByMarkerId;
      for (id in ref) {
        sub = ref[id];
        sub.dispose();
        delete this.subscriptionsByMarkerId[id];
      }
      ref1 = this.decorationsByMarkerId;
      results = [];
      for (id in ref1) {
        decoration = ref1[id];
        decoration.destroy();
        results.push(delete this.decorationsByMarkerId[id]);
      }
      return results;
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
      var ref;
      if ((this.fnrAPI != null) || ((ref = marker.getProperties()) != null ? ref["class"] : void 0) === 'find-result') {
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
      return document.querySelector('.find-and-replace') != null;
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWZpbmQtYW5kLXJlcGxhY2UvbGliL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS1iaW5kaW5nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixjQUFBLEdBQWlCOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0NBQUMsT0FBRCxFQUFXLE1BQVg7TUFBQyxJQUFDLENBQUEsVUFBRDtNQUFVLElBQUMsQ0FBQSxTQUFEO01BQ3RCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUE7TUFDVixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxxQkFBRCxHQUF5QjtNQUN6QixJQUFDLENBQUEsdUJBQUQsR0FBMkI7TUFFM0IsSUFBRyxtQkFBSDtRQUNFLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQywrQkFBUixDQUF3QyxJQUFDLENBQUEsTUFBekM7UUFFVCxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxpQkFBUCxDQUF5QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQ7bUJBQzFDLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQjtVQUQwQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBbkIsRUFIRjtPQUFBLE1BQUE7UUFNRSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsaUJBQXRCLENBQXdDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsTUFBRDttQkFDekQsS0FBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCO1VB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QTtRQUhxQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7SUFiZjs7MkNBa0JsQixpQkFBQSxHQUFtQixTQUFBO2FBQ2pCO0lBRGlCOzs7OztBQXhFckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuRmluZEFuZFJlcGxhY2UgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE1pbmltYXBGaW5kQW5kUmVwbGFjZUJpbmRpbmdcbiAgY29uc3RydWN0b3I6IChAbWluaW1hcCwgQGZuckFQSSkgLT5cbiAgICBAZWRpdG9yID0gQG1pbmltYXAuZ2V0VGV4dEVkaXRvcigpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZCA9IHt9XG5cbiAgICBpZiBAZm5yQVBJP1xuICAgICAgQGxheWVyID0gQGZuckFQSS5yZXN1bHRzTWFya2VyTGF5ZXJGb3JUZXh0RWRpdG9yKEBlZGl0b3IpXG5cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbGF5ZXIub25EaWRDcmVhdGVNYXJrZXIgKG1hcmtlcikgPT5cbiAgICAgICAgQGhhbmRsZUNyZWF0ZWRNYXJrZXIobWFya2VyKVxuICAgIGVsc2VcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLmRpc3BsYXlCdWZmZXIub25EaWRDcmVhdGVNYXJrZXIgKG1hcmtlcikgPT5cbiAgICAgICAgQGhhbmRsZUNyZWF0ZWRNYXJrZXIobWFya2VyKVxuXG4gICAgQGRpc2NvdmVyTWFya2VycygpXG5cbiAgZGVzdHJveTogLT5cbiAgICBzdWIuZGlzcG9zZSgpIGZvciBpZCxzdWIgb2YgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkXG4gICAgZGVjb3JhdGlvbi5kZXN0cm95KCkgZm9yIGlkLGRlY29yYXRpb24gb2YgQGRlY29yYXRpb25zQnlNYXJrZXJJZFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQG1pbmltYXAgPSBudWxsXG4gICAgQGVkaXRvciA9IG51bGxcbiAgICBAZGVjb3JhdGlvbnNCeU1hcmtlcklkID0ge31cbiAgICBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWQgPSB7fVxuXG4gIGNsZWFyOiAtPlxuICAgIGZvciBpZCxzdWIgb2YgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkXG4gICAgICBzdWIuZGlzcG9zZSgpXG4gICAgICBkZWxldGUgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXVxuXG4gICAgZm9yIGlkLGRlY29yYXRpb24gb2YgQGRlY29yYXRpb25zQnlNYXJrZXJJZFxuICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuXG4gIGZpbmRBbmRSZXBsYWNlOiAtPiBGaW5kQW5kUmVwbGFjZSA/PSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2ZpbmQtYW5kLXJlcGxhY2UnKS5tYWluTW9kdWxlXG5cbiAgZGlzY292ZXJNYXJrZXJzOiAtPlxuICAgIGlmIEBmbnJBUEk/XG4gICAgICBAbGF5ZXIuZ2V0TWFya2VycygpLmZvckVhY2ggKG1hcmtlcikgPT4gQGNyZWF0ZURlY29yYXRpb24obWFya2VyKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZmluZE1hcmtlcnMoY2xhc3M6ICdmaW5kLXJlc3VsdCcpLmZvckVhY2ggKG1hcmtlcikgPT5cbiAgICAgICAgQGNyZWF0ZURlY29yYXRpb24obWFya2VyKVxuXG4gIGhhbmRsZUNyZWF0ZWRNYXJrZXI6IChtYXJrZXIpIC0+XG4gICAgaWYgQGZuckFQST8gb3IgbWFya2VyLmdldFByb3BlcnRpZXMoKT8uY2xhc3MgaXMgJ2ZpbmQtcmVzdWx0J1xuICAgICAgQGNyZWF0ZURlY29yYXRpb24obWFya2VyKVxuXG4gIGNyZWF0ZURlY29yYXRpb246IChtYXJrZXIpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmluZFZpZXdJc1Zpc2libGUoKVxuICAgIHJldHVybiBpZiBAZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF0/XG5cbiAgICBkZWNvcmF0aW9uID0gQG1pbmltYXAuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgc2NvcGU6IFwiLm1pbmltYXAgLnNlYXJjaC1yZXN1bHRcIlxuICAgICAgcGx1Z2luOiAnZmluZC1hbmQtcmVwbGFjZSdcbiAgICB9KVxuICAgIHJldHVybiB1bmxlc3MgZGVjb3JhdGlvbj9cblxuICAgIGlkID0gbWFya2VyLmlkXG4gICAgQGRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF0gPSBkZWNvcmF0aW9uXG4gICAgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXSA9IGRlY29yYXRpb24ub25EaWREZXN0cm95ID0+XG4gICAgICBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdLmRpc3Bvc2UoKVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG4gICAgICBkZWxldGUgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXVxuXG4gIGZpbmRWaWV3SXNWaXNpYmxlOiAtPlxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5maW5kLWFuZC1yZXBsYWNlJyk/XG4iXX0=
