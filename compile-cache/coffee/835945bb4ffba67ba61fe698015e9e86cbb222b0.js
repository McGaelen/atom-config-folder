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

    MinimapHighlightSelected.prototype.activate = function(state) {
      if (!atom.inSpecMode()) {
        return require('atom-package-deps').install('minimap-highlight-selected', true);
      }
    };

    MinimapHighlightSelected.prototype.consumeMinimapServiceV1 = function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('highlight-selected', this);
    };

    MinimapHighlightSelected.prototype.consumeHighlightSelectedServiceV2 = function(highlightSelected) {
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
      this.highlightSelected.onDidAddMarkerForEditor((function(_this) {
        return function(options) {
          return _this.markerCreated(options);
        };
      })(this));
      this.highlightSelected.onDidAddSelectedMarkerForEditor((function(_this) {
        return function(options) {
          return _this.markerCreated(options, true);
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

    MinimapHighlightSelected.prototype.markerCreated = function(options, selected) {
      var className, decoration, minimap;
      if (selected == null) {
        selected = false;
      }
      minimap = this.minimap.minimapForEditor(options.editor);
      if (minimap == null) {
        return;
      }
      className = 'highlight-selected';
      if (selected) {
        className += ' selected';
      }
      decoration = minimap.decorateMarker(options.marker, {
        type: 'highlight',
        "class": className
      });
      return this.decorations.push(decoration);
    };

    MinimapHighlightSelected.prototype.markersDestroyed = function() {
      var ref;
      if ((ref = this.decorations) != null) {
        ref.forEach(function(decoration) {
          return decoration.destroy();
        });
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC9saWIvbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4REFBQTtJQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsV0FBUjs7RUFDdkIsa0JBQW1CLE9BQUEsQ0FBUSxZQUFSOztFQUVkO0lBQ1Msa0NBQUE7Ozs7O01BQ1gsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtJQURWOzt1Q0FHYixRQUFBLEdBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQSxDQUFPLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBUDtlQUNFLE9BQUEsQ0FBUSxtQkFBUixDQUE0QixDQUFDLE9BQTdCLENBQXFDLDRCQUFyQyxFQUFtRSxJQUFuRSxFQURGOztJQURROzt1Q0FJVix1QkFBQSxHQUF5QixTQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsVUFBRDthQUN4QixJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0Isb0JBQXhCLEVBQThDLElBQTlDO0lBRHVCOzt1Q0FHekIsaUNBQUEsR0FBbUMsU0FBQyxpQkFBRDtNQUFDLElBQUMsQ0FBQSxvQkFBRDtNQUNsQyxJQUFXLHNCQUFBLElBQWMscUJBQXpCO2VBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUFBOztJQURpQzs7dUNBR25DLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLGdCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUNsQixJQUFDLENBQUEsd0JBQUQsR0FBNEI7TUFDNUIsSUFBQyxDQUFBLGlCQUFELEdBQXFCO2FBQ3JCLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFMRDs7dUNBT1osUUFBQSxHQUFVLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSjs7dUNBRVYsY0FBQSxHQUFnQixTQUFBO01BQ2QsSUFBVSxJQUFDLENBQUEsTUFBWDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUF1QixJQUFDLENBQUEsSUFBeEIsQ0FBbkI7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxlQUFULENBQXlCLElBQUMsQ0FBQSxPQUExQixDQUFuQjtNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFFVixJQUFXLDhCQUFYO2VBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUFBOztJQVJjOzt1Q0FVaEIsSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLGlCQUFpQixDQUFDLHVCQUFuQixDQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtpQkFBYSxLQUFDLENBQUEsYUFBRCxDQUFlLE9BQWY7UUFBYjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7TUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsK0JBQW5CLENBQW1ELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUFhLEtBQUMsQ0FBQSxhQUFELENBQWUsT0FBZixFQUF3QixJQUF4QjtRQUFiO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuRDthQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxxQkFBbkIsQ0FBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO0lBSkk7O3VDQU1OLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTs7V0FBWSxDQUFFLE9BQWQsQ0FBc0IsU0FBQyxVQUFEO2lCQUFnQixVQUFVLENBQUMsT0FBWCxDQUFBO1FBQWhCLENBQXRCOzthQUNBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFGUjs7dUNBSVQsYUFBQSxHQUFlLFNBQUMsT0FBRCxFQUFVLFFBQVY7QUFDYixVQUFBOztRQUR1QixXQUFXOztNQUNsQyxPQUFBLEdBQVUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixPQUFPLENBQUMsTUFBbEM7TUFDVixJQUFjLGVBQWQ7QUFBQSxlQUFBOztNQUNBLFNBQUEsR0FBYTtNQUNiLElBQTRCLFFBQTVCO1FBQUEsU0FBQSxJQUFhLFlBQWI7O01BRUEsVUFBQSxHQUFhLE9BQU8sQ0FBQyxjQUFSLENBQXVCLE9BQU8sQ0FBQyxNQUEvQixFQUNYO1FBQUMsSUFBQSxFQUFNLFdBQVA7UUFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUEzQjtPQURXO2FBRWIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLFVBQWxCO0lBUmE7O3VDQVVmLGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsVUFBQTs7V0FBWSxDQUFFLE9BQWQsQ0FBc0IsU0FBQyxVQUFEO2lCQUFnQixVQUFVLENBQUMsT0FBWCxDQUFBO1FBQWhCLENBQXRCOzthQUNBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFGQzs7dUNBSWxCLGdCQUFBLEdBQWtCLFNBQUE7TUFDaEIsSUFBQSxDQUFjLElBQUMsQ0FBQSxNQUFmO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBTGdCOzs7Ozs7RUFPcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsSUFBSTtBQW5FckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG57cmVxdWlyZVBhY2thZ2VzfSA9IHJlcXVpcmUgJ2F0b20tdXRpbHMnXG5cbmNsYXNzIE1pbmltYXBIaWdobGlnaHRTZWxlY3RlZFxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICB1bmxlc3MgYXRvbS5pblNwZWNNb2RlKClcbiAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCAnbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQnLCB0cnVlXG5cbiAgY29uc3VtZU1pbmltYXBTZXJ2aWNlVjE6IChAbWluaW1hcCkgLT5cbiAgICBAbWluaW1hcC5yZWdpc3RlclBsdWdpbiAnaGlnaGxpZ2h0LXNlbGVjdGVkJywgdGhpc1xuXG4gIGNvbnN1bWVIaWdobGlnaHRTZWxlY3RlZFNlcnZpY2VWMjogKEBoaWdobGlnaHRTZWxlY3RlZCkgLT5cbiAgICBAaW5pdCgpIGlmIEBtaW5pbWFwPyBhbmQgQGFjdGl2ZT9cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkZWFjdGl2YXRlUGx1Z2luKClcbiAgICBAbWluaW1hcFBhY2thZ2UgPSBudWxsXG4gICAgQGhpZ2hsaWdodFNlbGVjdGVkUGFja2FnZSA9IG51bGxcbiAgICBAaGlnaGxpZ2h0U2VsZWN0ZWQgPSBudWxsXG4gICAgQG1pbmltYXAgPSBudWxsXG5cbiAgaXNBY3RpdmU6IC0+IEBhY3RpdmVcblxuICBhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gaWYgQGFjdGl2ZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtaW5pbWFwLm9uRGlkQWN0aXZhdGUgQGluaXRcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub25EaWREZWFjdGl2YXRlIEBkaXNwb3NlXG5cbiAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gICAgQGluaXQoKSBpZiBAaGlnaGxpZ2h0U2VsZWN0ZWQ/XG5cbiAgaW5pdDogPT5cbiAgICBAZGVjb3JhdGlvbnMgPSBbXVxuICAgIEBoaWdobGlnaHRTZWxlY3RlZC5vbkRpZEFkZE1hcmtlckZvckVkaXRvciAob3B0aW9ucykgPT4gQG1hcmtlckNyZWF0ZWQob3B0aW9ucylcbiAgICBAaGlnaGxpZ2h0U2VsZWN0ZWQub25EaWRBZGRTZWxlY3RlZE1hcmtlckZvckVkaXRvciAob3B0aW9ucykgPT4gQG1hcmtlckNyZWF0ZWQob3B0aW9ucywgdHJ1ZSlcbiAgICBAaGlnaGxpZ2h0U2VsZWN0ZWQub25EaWRSZW1vdmVBbGxNYXJrZXJzID0+IEBtYXJrZXJzRGVzdHJveWVkKClcblxuICBkaXNwb3NlOiA9PlxuICAgIEBkZWNvcmF0aW9ucz8uZm9yRWFjaCAoZGVjb3JhdGlvbikgLT4gZGVjb3JhdGlvbi5kZXN0cm95KClcbiAgICBAZGVjb3JhdGlvbnMgPSBudWxsXG5cbiAgbWFya2VyQ3JlYXRlZDogKG9wdGlvbnMsIHNlbGVjdGVkID0gZmFsc2UpID0+XG4gICAgbWluaW1hcCA9IEBtaW5pbWFwLm1pbmltYXBGb3JFZGl0b3Iob3B0aW9ucy5lZGl0b3IpXG4gICAgcmV0dXJuIHVubGVzcyBtaW5pbWFwP1xuICAgIGNsYXNzTmFtZSAgPSAnaGlnaGxpZ2h0LXNlbGVjdGVkJ1xuICAgIGNsYXNzTmFtZSArPSAnIHNlbGVjdGVkJyBpZiBzZWxlY3RlZFxuXG4gICAgZGVjb3JhdGlvbiA9IG1pbmltYXAuZGVjb3JhdGVNYXJrZXIob3B0aW9ucy5tYXJrZXIsXG4gICAgICB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBjbGFzc05hbWUgfSlcbiAgICBAZGVjb3JhdGlvbnMucHVzaCBkZWNvcmF0aW9uXG5cbiAgbWFya2Vyc0Rlc3Ryb3llZDogPT5cbiAgICBAZGVjb3JhdGlvbnM/LmZvckVhY2ggKGRlY29yYXRpb24pIC0+IGRlY29yYXRpb24uZGVzdHJveSgpXG4gICAgQGRlY29yYXRpb25zID0gW11cblxuICBkZWFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVxuXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG4gICAgQGRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNaW5pbWFwSGlnaGxpZ2h0U2VsZWN0ZWRcbiJdfQ==
