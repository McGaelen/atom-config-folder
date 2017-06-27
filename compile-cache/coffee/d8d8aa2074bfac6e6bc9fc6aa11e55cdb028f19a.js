(function() {
  module.exports = {
    display: function(text, timeout) {
      var ref, span, statusBar;
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      statusBar = document.querySelector("status-bar");
      span = document.createElement('span');
      span.textContent = text;
      if (statusBar != null) {
        this.statusBarTile = statusBar.addLeftTile({
          item: span,
          priority: 100
        });
      }
      if (timeout != null) {
        if (this.timeout != null) {
          clearTimeout(this.timeout);
        }
        return this.timeout = setTimeout((function(_this) {
          return function() {
            var ref1;
            return (ref1 = _this.statusBarTile) != null ? ref1.destroy() : void 0;
          };
        })(this), timeout);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9yZW1vdGUtYXRvbS9saWIvc3RhdHVzLW1lc3NhZ2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE9BQUEsRUFBUyxTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ0wsVUFBQTtNQUFBLElBQTBCLG9CQUExQjtRQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsT0FBZCxFQUFBOzs7V0FDYyxDQUFFLE9BQWhCLENBQUE7O01BQ0EsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCO01BQ1osSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ1AsSUFBSSxDQUFDLFdBQUwsR0FBbUI7TUFDbkIsSUFBRyxpQkFBSDtRQUNJLElBQUMsQ0FBQSxhQUFELEdBQWlCLFNBQVMsQ0FBQyxXQUFWLENBQXNCO1VBQUEsSUFBQSxFQUFNLElBQU47VUFBWSxRQUFBLEVBQVUsR0FBdEI7U0FBdEIsRUFEckI7O01BR0EsSUFBRyxlQUFIO1FBQ0ksSUFBMEIsb0JBQTFCO1VBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxPQUFkLEVBQUE7O2VBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNsQixnQkFBQTs4REFBYyxDQUFFLE9BQWhCLENBQUE7VUFEa0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFFVCxPQUZTLEVBRmY7O0lBVEssQ0FBVDs7QUFESiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgICBkaXNwbGF5OiAodGV4dCwgdGltZW91dCkgLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0KEB0aW1lb3V0KSBpZiBAdGltZW91dD9cbiAgICAgICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgICAgICBzdGF0dXNCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3RhdHVzLWJhclwiKVxuICAgICAgICBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIHNwYW4udGV4dENvbnRlbnQgPSB0ZXh0XG4gICAgICAgIGlmIHN0YXR1c0Jhcj9cbiAgICAgICAgICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKGl0ZW06IHNwYW4sIHByaW9yaXR5OiAxMDApXG5cbiAgICAgICAgaWYgdGltZW91dD9cbiAgICAgICAgICAgIGNsZWFyVGltZW91dChAdGltZW91dCkgaWYgQHRpbWVvdXQ/XG4gICAgICAgICAgICBAdGltZW91dCA9IHNldFRpbWVvdXQoPT5cbiAgICAgICAgICAgICAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgICAgICAgICAsIHRpbWVvdXQpXG4iXX0=
