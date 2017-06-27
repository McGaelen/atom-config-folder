(function() {
  var OpenDialogView, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, TextEditorView = ref.TextEditorView;

  module.exports = OpenDialogView = (function(superClass) {
    extend(OpenDialogView, superClass);

    function OpenDialogView() {
      return OpenDialogView.__super__.constructor.apply(this, arguments);
    }

    OpenDialogView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'atom-debugger'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block'
          }, function() {
            _this.label('Atom Debugger');
            return _this.subview('targetEditor', new TextEditorView({
              mini: true,
              placeholderText: 'Target Binary File Path'
            }));
          });
          _this.div({
            "class": 'checkbox'
          }, function() {
            _this.input({
              type: 'checkbox',
              checked: 'true',
              outlet: 'mainBreakCheckbox'
            });
            return _this.label({
              "class": 'checkbox-label'
            }, 'Add breakpoint in `main` function');
          });
          return _this.div({
            "class": 'block'
          }, function() {
            _this.button({
              "class": 'inline-block btn',
              outlet: 'startButton'
            }, 'Start');
            return _this.button({
              "class": 'inline-block btn',
              outlet: 'cancelButton'
            }, 'Cancel');
          });
        };
      })(this));
    };

    OpenDialogView.prototype.initialize = function(handler) {
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: true
      });
      this.targetEditor.focus();
      this.cancelButton.on('click', (function(_this) {
        return function(e) {
          return _this.destroy();
        };
      })(this));
      return this.startButton.on('click', (function(_this) {
        return function(e) {
          handler(_this.targetEditor.getText(), _this.mainBreakCheckbox.prop('checked'));
          return _this.destroy();
        };
      })(this));
    };

    OpenDialogView.prototype.destroy = function() {
      return this.panel.destroy();
    };

    return OpenDialogView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdG9tLWRlYnVnZ2VyL2xpYi9vcGVuLWRpYWxvZy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUNBQUE7SUFBQTs7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsUUFBQSxFQUFVLENBQUMsQ0FBWDtRQUFjLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBckI7T0FBTCxFQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDekMsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUE7WUFDbkIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxlQUFQO21CQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsY0FBVCxFQUE2QixJQUFBLGNBQUEsQ0FBZTtjQUFBLElBQUEsRUFBTSxJQUFOO2NBQVksZUFBQSxFQUFpQix5QkFBN0I7YUFBZixDQUE3QjtVQUZtQixDQUFyQjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQVA7V0FBTCxFQUF3QixTQUFBO1lBQ3RCLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxJQUFBLEVBQU0sVUFBTjtjQUFrQixPQUFBLEVBQVMsTUFBM0I7Y0FBbUMsTUFBQSxFQUFRLG1CQUEzQzthQUFQO21CQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQVAsRUFBZ0MsbUNBQWhDO1VBRnNCLENBQXhCO2lCQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7V0FBTCxFQUFxQixTQUFBO1lBQ25CLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLE1BQUEsRUFBUSxhQUFuQzthQUFSLEVBQTBELE9BQTFEO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO2NBQTJCLE1BQUEsRUFBUSxjQUFuQzthQUFSLEVBQTJELFFBQTNEO1VBRm1CLENBQXJCO1FBUHlDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQztJQURROzs2QkFZVixVQUFBLEdBQVksU0FBQyxPQUFEO01BQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUFZLE9BQUEsRUFBUyxJQUFyQjtPQUE3QjtNQUNULElBQUMsQ0FBQSxZQUFZLENBQUMsS0FBZCxDQUFBO01BRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxFQUFkLENBQWlCLE9BQWpCLEVBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUFPLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBUDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUI7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDdkIsT0FBQSxDQUFRLEtBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLENBQVIsRUFBaUMsS0FBQyxDQUFBLGlCQUFpQixDQUFDLElBQW5CLENBQXdCLFNBQXhCLENBQWpDO2lCQUNBLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFGdUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBTFU7OzZCQVNaLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7SUFETzs7OztLQXRCa0I7QUFIN0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7VmlldywgVGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE9wZW5EaWFsb2dWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IHRhYkluZGV4OiAtMSwgY2xhc3M6ICdhdG9tLWRlYnVnZ2VyJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsID0+XG4gICAgICAgIEBsYWJlbCAnQXRvbSBEZWJ1Z2dlcidcbiAgICAgICAgQHN1YnZpZXcgJ3RhcmdldEVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICdUYXJnZXQgQmluYXJ5IEZpbGUgUGF0aCcpXG4gICAgICBAZGl2IGNsYXNzOiAnY2hlY2tib3gnLCA9PlxuICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JywgY2hlY2tlZDogJ3RydWUnLCBvdXRsZXQ6ICdtYWluQnJlYWtDaGVja2JveCdcbiAgICAgICAgQGxhYmVsIGNsYXNzOiAnY2hlY2tib3gtbGFiZWwnLCAnQWRkIGJyZWFrcG9pbnQgaW4gYG1haW5gIGZ1bmN0aW9uJ1xuICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2lubGluZS1ibG9jayBidG4nLCBvdXRsZXQ6ICdzdGFydEJ1dHRvbicsICdTdGFydCdcbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2lubGluZS1ibG9jayBidG4nLCBvdXRsZXQ6ICdjYW5jZWxCdXR0b24nLCAnQ2FuY2VsJ1xuXG4gIGluaXRpYWxpemU6IChoYW5kbGVyKSAtPlxuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogdHJ1ZSlcbiAgICBAdGFyZ2V0RWRpdG9yLmZvY3VzKClcblxuICAgIEBjYW5jZWxCdXR0b24ub24gJ2NsaWNrJywgKGUpID0+IEBkZXN0cm95KClcbiAgICBAc3RhcnRCdXR0b24ub24gJ2NsaWNrJywgKGUpID0+XG4gICAgICBoYW5kbGVyKEB0YXJnZXRFZGl0b3IuZ2V0VGV4dCgpLCBAbWFpbkJyZWFrQ2hlY2tib3gucHJvcCgnY2hlY2tlZCcpKVxuICAgICAgQGRlc3Ryb3koKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuIl19
