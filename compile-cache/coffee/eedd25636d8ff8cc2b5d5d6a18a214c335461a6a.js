(function() {
  var CompositeDisposable, MinimapHighlightSelected, requirePackages,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.markersDestroyed = bind(this.markersDestroyed, this);
      this.markerCreated = bind(this.markerCreated, this);
      this.dispose = bind(this.dispose, this);
      this.init = bind(this.init, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapHighlightSelected.prototype.activate = function(state) {};

    MinimapHighlightSelected.prototype.consumeMinimapServiceV1 = function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('highlight-selected', this);
    };

    MinimapHighlightSelected.prototype.consumeHighlightSelectedServiceV1 = function(highlightSelected) {
      this.highlightSelected = highlightSelected;
      if ((this.minimap != null) && (this.active != null)) {
        return this.init();
      }
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
      this.subscriptions.add(this.minimap.onDidActivate(this.init));
      this.subscriptions.add(this.minimap.onDidDeactivate(this.dispose));
      this.active = true;
      if (this.highlightSelected != null) {
        return this.init();
      }
    };

    MinimapHighlightSelected.prototype.init = function() {
      this.decorations = [];
      this.highlightSelected.onDidAddMarker((function(_this) {
        return function(marker) {
          return _this.markerCreated(marker);
        };
      })(this));
      this.highlightSelected.onDidAddSelectedMarker((function(_this) {
        return function(marker) {
          return _this.markerCreated(marker, true);
        };
      })(this));
      return this.highlightSelected.onDidRemoveAllMarkers((function(_this) {
        return function() {
          return _this.markersDestroyed();
        };
      })(this));
    };

    MinimapHighlightSelected.prototype.dispose = function() {
      var ref;
      if ((ref = this.decorations) != null) {
        ref.forEach(function(decoration) {
          return decoration.destroy();
        });
      }
      return this.decorations = null;
    };

    MinimapHighlightSelected.prototype.markerCreated = function(marker, selected) {
      var activeMinimap, className, decoration;
      if (selected == null) {
        selected = false;
      }
      activeMinimap = this.minimap.getActiveMinimap();
      if (activeMinimap == null) {
        return;
      }
      className = 'highlight-selected';
      if (selected) {
        className += ' selected';
      }
      decoration = activeMinimap.decorateMarker(marker, {
        type: 'highlight',
        "class": className
      });
      return this.decorations.push(decoration);
    };

    MinimapHighlightSelected.prototype.markersDestroyed = function() {
      this.decorations.forEach(function(decoration) {
        return decoration.destroy();
      });
      return this.decorations = [];
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.dispose();
      return this.subscriptions.dispose();
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC9saWIvbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4REFBQTtJQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsV0FBUjs7RUFDdkIsa0JBQW1CLE9BQUEsQ0FBUSxZQUFSOztFQUVkO0lBQ1Msa0NBQUE7Ozs7O01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtJQURWOzt1Q0FHYixRQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7O3VDQUVWLHVCQUFBLEdBQXlCLFNBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixvQkFBeEIsRUFBOEMsSUFBOUM7SUFEdUI7O3VDQUd6QixpQ0FBQSxHQUFtQyxTQUFDLGlCQUFEO01BQUMsSUFBQyxDQUFBLG9CQUFEO01BQ2xDLElBQVcsc0JBQUEsSUFBYyxxQkFBekI7ZUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBQUE7O0lBRGlDOzt1Q0FHbkMsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCO01BQ2xCLElBQUMsQ0FBQSx3QkFBRCxHQUE0QjtNQUM1QixJQUFDLENBQUEsaUJBQUQsR0FBcUI7YUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUxEOzt1Q0FPWixRQUFBLEdBQVUsU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKOzt1Q0FFVixjQUFBLEdBQWdCLFNBQUE7TUFDZCxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLElBQUMsQ0FBQSxJQUF4QixDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLGVBQVQsQ0FBeUIsSUFBQyxDQUFBLE9BQTFCLENBQW5CO01BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUVWLElBQVcsOEJBQVg7ZUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBQUE7O0lBUmM7O3VDQVVoQixJQUFBLEdBQU0sU0FBQTtNQUNKLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsaUJBQWlCLENBQUMsY0FBbkIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQVksS0FBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmO1FBQVo7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO01BQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLHNCQUFuQixDQUEwQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtpQkFBWSxLQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFBdUIsSUFBdkI7UUFBWjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUM7YUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMscUJBQW5CLENBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsZ0JBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QztJQUpJOzt1Q0FNTixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7O1dBQVksQ0FBRSxPQUFkLENBQXNCLFNBQUMsVUFBRDtpQkFBZ0IsVUFBVSxDQUFDLE9BQVgsQ0FBQTtRQUFoQixDQUF0Qjs7YUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBRlI7O3VDQUlULGFBQUEsR0FBZSxTQUFDLE1BQUQsRUFBUyxRQUFUO0FBQ2IsVUFBQTs7UUFEc0IsV0FBVzs7TUFDakMsYUFBQSxHQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQUE7TUFDaEIsSUFBYyxxQkFBZDtBQUFBLGVBQUE7O01BQ0EsU0FBQSxHQUFhO01BQ2IsSUFBNEIsUUFBNUI7UUFBQSxTQUFBLElBQWEsWUFBYjs7TUFFQSxVQUFBLEdBQWEsYUFBYSxDQUFDLGNBQWQsQ0FBNkIsTUFBN0IsRUFDWDtRQUFDLElBQUEsRUFBTSxXQUFQO1FBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBM0I7T0FEVzthQUViLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixVQUFsQjtJQVJhOzt1Q0FVZixnQkFBQSxHQUFrQixTQUFBO01BQ2hCLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFxQixTQUFDLFVBQUQ7ZUFBZ0IsVUFBVSxDQUFDLE9BQVgsQ0FBQTtNQUFoQixDQUFyQjthQUNBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFGQzs7dUNBSWxCLGdCQUFBLEdBQWtCLFNBQUE7TUFDaEIsSUFBQSxDQUFjLElBQUMsQ0FBQSxNQUFmO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBTGdCOzs7Ozs7RUFPcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSTtBQWpFckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG57cmVxdWlyZVBhY2thZ2VzfSA9IHJlcXVpcmUgJ2F0b20tdXRpbHMnXG5cbmNsYXNzIE1pbmltYXBIaWdobGlnaHRTZWxlY3RlZFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cblxuICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMTogKEBtaW5pbWFwKSAtPlxuICAgIEBtaW5pbWFwLnJlZ2lzdGVyUGx1Z2luICdoaWdobGlnaHQtc2VsZWN0ZWQnLCB0aGlzXG5cbiAgY29uc3VtZUhpZ2hsaWdodFNlbGVjdGVkU2VydmljZVYxOiAoQGhpZ2hsaWdodFNlbGVjdGVkKSAtPlxuICAgIEBpbml0KCkgaWYgQG1pbmltYXA/IGFuZCBAYWN0aXZlP1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRlYWN0aXZhdGVQbHVnaW4oKVxuICAgIEBtaW5pbWFwUGFja2FnZSA9IG51bGxcbiAgICBAaGlnaGxpZ2h0U2VsZWN0ZWRQYWNrYWdlID0gbnVsbFxuICAgIEBoaWdobGlnaHRTZWxlY3RlZCA9IG51bGxcbiAgICBAbWluaW1hcCA9IG51bGxcblxuICBpc0FjdGl2ZTogLT4gQGFjdGl2ZVxuXG4gIGFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiBpZiBAYWN0aXZlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub25EaWRBY3RpdmF0ZSBAaW5pdFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWluaW1hcC5vbkRpZERlYWN0aXZhdGUgQGRpc3Bvc2VcblxuICAgIEBhY3RpdmUgPSB0cnVlXG5cbiAgICBAaW5pdCgpIGlmIEBoaWdobGlnaHRTZWxlY3RlZD9cblxuICBpbml0OiA9PlxuICAgIEBkZWNvcmF0aW9ucyA9IFtdXG4gICAgQGhpZ2hsaWdodFNlbGVjdGVkLm9uRGlkQWRkTWFya2VyIChtYXJrZXIpID0+IEBtYXJrZXJDcmVhdGVkKG1hcmtlcilcbiAgICBAaGlnaGxpZ2h0U2VsZWN0ZWQub25EaWRBZGRTZWxlY3RlZE1hcmtlciAobWFya2VyKSA9PiBAbWFya2VyQ3JlYXRlZChtYXJrZXIsIHRydWUpXG4gICAgQGhpZ2hsaWdodFNlbGVjdGVkLm9uRGlkUmVtb3ZlQWxsTWFya2VycyA9PiBAbWFya2Vyc0Rlc3Ryb3llZCgpXG5cbiAgZGlzcG9zZTogPT5cbiAgICBAZGVjb3JhdGlvbnM/LmZvckVhY2ggKGRlY29yYXRpb24pIC0+IGRlY29yYXRpb24uZGVzdHJveSgpXG4gICAgQGRlY29yYXRpb25zID0gbnVsbFxuXG4gIG1hcmtlckNyZWF0ZWQ6IChtYXJrZXIsIHNlbGVjdGVkID0gZmFsc2UpID0+XG4gICAgYWN0aXZlTWluaW1hcCA9IEBtaW5pbWFwLmdldEFjdGl2ZU1pbmltYXAoKVxuICAgIHJldHVybiB1bmxlc3MgYWN0aXZlTWluaW1hcD9cbiAgICBjbGFzc05hbWUgID0gJ2hpZ2hsaWdodC1zZWxlY3RlZCdcbiAgICBjbGFzc05hbWUgKz0gJyBzZWxlY3RlZCcgaWYgc2VsZWN0ZWRcblxuICAgIGRlY29yYXRpb24gPSBhY3RpdmVNaW5pbWFwLmRlY29yYXRlTWFya2VyKG1hcmtlcixcbiAgICAgIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGNsYXNzTmFtZSB9KVxuICAgIEBkZWNvcmF0aW9ucy5wdXNoIGRlY29yYXRpb25cblxuICBtYXJrZXJzRGVzdHJveWVkOiA9PlxuICAgIEBkZWNvcmF0aW9ucy5mb3JFYWNoIChkZWNvcmF0aW9uKSAtPiBkZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgIEBkZWNvcmF0aW9ucyA9IFtdXG5cbiAgZGVhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVcblxuICAgIEBhY3RpdmUgPSBmYWxzZVxuICAgIEBkaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWluaW1hcEhpZ2hsaWdodFNlbGVjdGVkXG4iXX0=
