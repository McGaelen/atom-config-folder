(function() {
  var LocationSelectList, SelectListView, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SelectListView = require('atom-space-pen-views').SelectListView;

  path = require('path');

  module.exports = LocationSelectList = (function(superClass) {
    extend(LocationSelectList, superClass);

    function LocationSelectList() {
      return LocationSelectList.__super__.constructor.apply(this, arguments);
    }

    LocationSelectList.prototype.initialize = function(editor, callback) {
      LocationSelectList.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      this.editor = editor;
      this.callback = callback;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    LocationSelectList.prototype.viewForItem = function(item) {
      var f;
      if (item[0] === '<stdin>') {
        return "<li class=\"event\">" + item[1] + ":" + item[2] + "</li>";
      } else {
        f = path.join(item[0]);
        return "<li class=\"event\">" + f + "  " + item[1] + ":" + item[2] + "</li>";
      }
    };

    LocationSelectList.prototype.hide = function() {
      var ref;
      return (ref = this.panel) != null ? ref.hide() : void 0;
    };

    LocationSelectList.prototype.show = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    LocationSelectList.prototype.toggle = function() {
      var ref;
      if ((ref = this.panel) != null ? ref.isVisible() : void 0) {
        return this.cancel();
      } else {
        return this.show();
      }
    };

    LocationSelectList.prototype.confirmed = function(item) {
      this.cancel();
      return this.callback(this.editor, item);
    };

    LocationSelectList.prototype.cancelled = function() {
      return this.hide();
    };

    return LocationSelectList;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL2xvY2F0aW9uLXNlbGVjdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0NBQUE7SUFBQTs7O0VBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUjs7RUFDbkIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7aUNBQ0osVUFBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLFFBQVQ7TUFDVixvREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxrQkFBVjtNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLG1CQUFELENBQUE7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVJVOztpQ0FVWixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1gsVUFBQTtNQUFBLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTCxLQUFXLFNBQWQ7ZUFDRSxzQkFBQSxHQUF1QixJQUFLLENBQUEsQ0FBQSxDQUE1QixHQUErQixHQUEvQixHQUFrQyxJQUFLLENBQUEsQ0FBQSxDQUF2QyxHQUEwQyxRQUQ1QztPQUFBLE1BQUE7UUFHRSxDQUFBLEdBQUksSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFLLENBQUEsQ0FBQSxDQUFmO2VBQ0osc0JBQUEsR0FBdUIsQ0FBdkIsR0FBeUIsSUFBekIsR0FBNkIsSUFBSyxDQUFBLENBQUEsQ0FBbEMsR0FBcUMsR0FBckMsR0FBd0MsSUFBSyxDQUFBLENBQUEsQ0FBN0MsR0FBZ0QsUUFKbEQ7O0lBRFc7O2lDQU9iLElBQUEsR0FBTSxTQUFBO0FBQUcsVUFBQTs2Q0FBTSxDQUFFLElBQVIsQ0FBQTtJQUFIOztpQ0FFTixJQUFBLEdBQU0sU0FBQTtNQUNKLElBQUMsQ0FBQSxtQkFBRCxDQUFBOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFKSTs7aUNBTU4sTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsb0NBQVMsQ0FBRSxTQUFSLENBQUEsVUFBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBSEY7O0lBRE07O2lDQU1SLFNBQUEsR0FBVyxTQUFDLElBQUQ7TUFDVCxJQUFDLENBQUEsTUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsTUFBWCxFQUFtQixJQUFuQjtJQUZTOztpQ0FJWCxTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSxJQUFELENBQUE7SUFEUzs7OztLQXBDb0I7QUFKakMiLCJzb3VyY2VzQ29udGVudCI6WyJ7U2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTG9jYXRpb25TZWxlY3RMaXN0IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKGVkaXRvciwgY2FsbGJhY2spLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcygnb3ZlcmxheSBmcm9tLXRvcCcpXG4gICAgQGVkaXRvciA9IGVkaXRvclxuICAgIEBjYWxsYmFjayA9IGNhbGxiYWNrXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgdmlld0Zvckl0ZW06IChpdGVtKSAtPlxuICAgIGlmIGl0ZW1bMF0gaXMgJzxzdGRpbj4nXG4gICAgICBcIjxsaSBjbGFzcz1cXFwiZXZlbnRcXFwiPiN7aXRlbVsxXX06I3tpdGVtWzJdfTwvbGk+XCJcbiAgICBlbHNlXG4gICAgICBmID0gcGF0aC5qb2luKGl0ZW1bMF0pXG4gICAgICBcIjxsaSBjbGFzcz1cXFwiZXZlbnRcXFwiPiN7Zn0gICN7aXRlbVsxXX06I3tpdGVtWzJdfTwvbGk+XCJcblxuICBoaWRlOiAtPiBAcGFuZWw/LmhpZGUoKVxuXG4gIHNob3c6IC0+XG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBwYW5lbD8uaXNWaXNpYmxlKClcbiAgICAgIEBjYW5jZWwoKVxuICAgIGVsc2VcbiAgICAgIEBzaG93KClcblxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIEBjYWxsYmFjayhAZWRpdG9yLCBpdGVtKVxuXG4gIGNhbmNlbGxlZDogLT5cbiAgICBAaGlkZSgpXG4iXX0=
