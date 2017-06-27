(function() {
  var CreateTagDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = CreateTagDialog = (function(superClass) {
    extend(CreateTagDialog, superClass);

    function CreateTagDialog() {
      return CreateTagDialog.__super__.constructor.apply(this, arguments);
    }

    CreateTagDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Tag');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Tag name');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'name'
            });
            _this.label('commit ref');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'href'
            });
            _this.label('Tag Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'tag'
            }, function() {
              _this.i({
                "class": 'icon tag'
              });
              return _this.span('Create Tag');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    CreateTagDialog.prototype.activate = function() {
      CreateTagDialog.__super__.activate.call(this);
      this.name.focus();
    };

    CreateTagDialog.prototype.tag = function() {
      this.deactivate();
      this.parentView.tag(this.Name(), this.Href(), this.Msg());
    };

    CreateTagDialog.prototype.Name = function() {
      return this.name.val();
    };

    CreateTagDialog.prototype.Href = function() {
      return this.href.val();
    };

    CreateTagDialog.prototype.Msg = function() {
      return this.msg.val();
    };

    return CreateTagDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9jcmVhdGUtdGFnLWRpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsS0FBRCxDQUFPLFVBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsTUFBQSxFQUFRLE1BQXBEO2FBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLFlBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixJQUFBLEVBQU0sTUFBcEM7Y0FBNEMsTUFBQSxFQUFRLE1BQXBEO2FBQVA7WUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGFBQVA7bUJBQ0EsS0FBQyxDQUFBLFFBQUQsQ0FBVTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsTUFBQSxFQUFRLEtBQXRDO2FBQVY7VUFOa0IsQ0FBcEI7aUJBT0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sS0FBeEI7YUFBUixFQUF1QyxTQUFBO2NBQ3JDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxZQUFOO1lBRnFDLENBQXZDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFYb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzhCQW9CVixRQUFBLEdBQVUsU0FBQTtNQUNSLDRDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUE7SUFGUTs7OEJBS1YsR0FBQSxHQUFLLFNBQUE7TUFDSCxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBaEIsRUFBeUIsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUF6QixFQUFrQyxJQUFDLENBQUEsR0FBRCxDQUFBLENBQWxDO0lBRkc7OzhCQUtMLElBQUEsR0FBTSxTQUFBO0FBQ0osYUFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBQTtJQURIOzs4QkFHTixJQUFBLEdBQU0sU0FBQTtBQUNKLGFBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7SUFESDs7OEJBR04sR0FBQSxHQUFLLFNBQUE7QUFDSCxhQUFPLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUFBO0lBREo7Ozs7S0FyQ3VCO0FBSDlCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENyZWF0ZVRhZ0RpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgQGkgY2xhc3M6ICdpY29uIHggY2xpY2thYmxlJywgY2xpY2s6ICdjYW5jZWwnXG4gICAgICAgIEBzdHJvbmcgJ1RhZydcbiAgICAgIEBkaXYgY2xhc3M6ICdib2R5JywgPT5cbiAgICAgICAgQGxhYmVsICdUYWcgbmFtZSdcbiAgICAgICAgQGlucHV0IGNsYXNzOiAnbmF0aXZlLWtleS1iaW5kaW5ncycsIHR5cGU6ICd0ZXh0Jywgb3V0bGV0OiAnbmFtZSdcbiAgICAgICAgQGxhYmVsICdjb21taXQgcmVmJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ3RleHQnLCBvdXRsZXQ6ICdocmVmJ1xuICAgICAgICBAbGFiZWwgJ1RhZyBNZXNzYWdlJ1xuICAgICAgICBAdGV4dGFyZWEgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgb3V0bGV0OiAnbXNnJ1xuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICd0YWcnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB0YWcnXG4gICAgICAgICAgQHNwYW4gJ0NyZWF0ZSBUYWcnXG4gICAgICAgIEBidXR0b24gY2xpY2s6ICdjYW5jZWwnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4J1xuICAgICAgICAgIEBzcGFuICdDYW5jZWwnXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgc3VwZXIoKVxuICAgIEBuYW1lLmZvY3VzKClcbiAgICByZXR1cm5cbiAgICBcbiAgdGFnOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBAcGFyZW50Vmlldy50YWcoQE5hbWUoKSwgQEhyZWYoKSwgQE1zZygpKVxuICAgIHJldHVyblxuXG4gIE5hbWU6IC0+XG4gICAgcmV0dXJuIEBuYW1lLnZhbCgpXG5cbiAgSHJlZjogLT5cbiAgICByZXR1cm4gQGhyZWYudmFsKClcblxuICBNc2c6IC0+XG4gICAgcmV0dXJuIEBtc2cudmFsKClcbiJdfQ==
