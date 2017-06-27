(function() {
  var Dialog, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), TextEditorView = ref.TextEditorView, View = ref.View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(arg) {
      var prompt;
      prompt = (arg != null ? arg : {}).prompt;
      return this.div({
        "class": 'platformio-ide-terminal-dialog'
      }, (function(_this) {
        return function() {
          _this.label(prompt, {
            "class": 'icon',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.label('Escape (Esc) to exit', {
            style: 'float: left;'
          });
          return _this.label('Enter (\u21B5) to confirm', {
            style: 'float: right;'
          });
        };
      })(this));
    };

    Dialog.prototype.initialize = function(arg) {
      var iconClass, placeholderText, ref1, stayOpen;
      ref1 = arg != null ? arg : {}, iconClass = ref1.iconClass, placeholderText = ref1.placeholderText, stayOpen = ref1.stayOpen;
      if (iconClass) {
        this.promptText.addClass(iconClass);
      }
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      if (!stayOpen) {
        this.miniEditor.on('blur', (function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
      }
      if (placeholderText) {
        this.miniEditor.getModel().setText(placeholderText);
        return this.miniEditor.getModel().selectAll();
      }
    };

    Dialog.prototype.attach = function() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      var panelToDestroy;
      panelToDestroy = this.panel;
      this.panel = null;
      if (panelToDestroy != null) {
        panelToDestroy.destroy();
      }
      return atom.workspace.getActivePane().activate();
    };

    Dialog.prototype.cancel = function() {
      return this.close();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC9saWIvZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTs7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsbUNBQUQsRUFBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFEVSx3QkFBRCxNQUFXO2FBQ3BCLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdDQUFQO09BQUwsRUFBOEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzVDLEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1lBQWUsTUFBQSxFQUFRLFlBQXZCO1dBQWY7VUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBMkIsSUFBQSxjQUFBLENBQWU7WUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFmLENBQTNCO1VBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxzQkFBUCxFQUErQjtZQUFBLEtBQUEsRUFBTyxjQUFQO1dBQS9CO2lCQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sMkJBQVAsRUFBb0M7WUFBQSxLQUFBLEVBQU8sZUFBUDtXQUFwQztRQUo0QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUM7SUFEUTs7cUJBT1YsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7MkJBRFcsTUFBeUMsSUFBeEMsNEJBQVcsd0NBQWlCO01BQ3hDLElBQW1DLFNBQW5DO1FBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLFNBQXJCLEVBQUE7O01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNFO1FBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQVcsS0FBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBWDtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtRQUNBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEZjtPQURGO01BSUEsSUFBQSxDQUFPLFFBQVA7UUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQURGOztNQUdBLElBQUcsZUFBSDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBK0IsZUFBL0I7ZUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLFNBQXZCLENBQUEsRUFGRjs7SUFUVTs7cUJBYVosTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsT0FBWDtPQUE3QjtNQUNULElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxzQkFBdkIsQ0FBQTtJQUhNOztxQkFLUixLQUFBLEdBQU8sU0FBQTtBQUNMLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQTtNQUNsQixJQUFDLENBQUEsS0FBRCxHQUFTOztRQUNULGNBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsUUFBL0IsQ0FBQTtJQUpLOztxQkFNUCxNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxLQUFELENBQUE7SUFETTs7OztLQWhDVztBQUhyQiIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGlhbG9nIGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKHtwcm9tcHR9ID0ge30pIC0+XG4gICAgQGRpdiBjbGFzczogJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLWRpYWxvZycsID0+XG4gICAgICBAbGFiZWwgcHJvbXB0LCBjbGFzczogJ2ljb24nLCBvdXRsZXQ6ICdwcm9tcHRUZXh0J1xuICAgICAgQHN1YnZpZXcgJ21pbmlFZGl0b3InLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBsYWJlbCAnRXNjYXBlIChFc2MpIHRvIGV4aXQnLCBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgIEBsYWJlbCAnRW50ZXIgKFxcdTIxQjUpIHRvIGNvbmZpcm0nLCBzdHlsZTogJ2Zsb2F0OiByaWdodDsnXG5cbiAgaW5pdGlhbGl6ZTogKHtpY29uQ2xhc3MsIHBsYWNlaG9sZGVyVGV4dCwgc3RheU9wZW59ID0ge30pIC0+XG4gICAgQHByb21wdFRleHQuYWRkQ2xhc3MoaWNvbkNsYXNzKSBpZiBpY29uQ2xhc3NcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdjb3JlOmNvbmZpcm0nOiA9PiBAb25Db25maXJtKEBtaW5pRWRpdG9yLmdldFRleHQoKSlcbiAgICAgICdjb3JlOmNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuXG4gICAgdW5sZXNzIHN0YXlPcGVuXG4gICAgICBAbWluaUVkaXRvci5vbiAnYmx1cicsID0+IEBjbG9zZSgpXG5cbiAgICBpZiBwbGFjZWhvbGRlclRleHRcbiAgICAgIEBtaW5pRWRpdG9yLmdldE1vZGVsKCkuc2V0VGV4dCBwbGFjZWhvbGRlclRleHRcbiAgICAgIEBtaW5pRWRpdG9yLmdldE1vZGVsKCkuc2VsZWN0QWxsKClcblxuICBhdHRhY2g6IC0+XG4gICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLmVsZW1lbnQpXG4gICAgQG1pbmlFZGl0b3IuZm9jdXMoKVxuICAgIEBtaW5pRWRpdG9yLmdldE1vZGVsKCkuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG5cbiAgY2xvc2U6IC0+XG4gICAgcGFuZWxUb0Rlc3Ryb3kgPSBAcGFuZWxcbiAgICBAcGFuZWwgPSBudWxsXG4gICAgcGFuZWxUb0Rlc3Ryb3k/LmRlc3Ryb3koKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG5cbiAgY2FuY2VsOiAtPlxuICAgIEBjbG9zZSgpXG4iXX0=
