(function() {
  var Dialog, InputDialog, os,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require("./dialog");

  os = require("os");

  module.exports = InputDialog = (function(superClass) {
    extend(InputDialog, superClass);

    function InputDialog(terminalView) {
      this.terminalView = terminalView;
      InputDialog.__super__.constructor.call(this, {
        prompt: "Insert Text",
        iconClass: "icon-keyboard",
        stayOpen: true
      });
    }

    InputDialog.prototype.onConfirm = function(input) {
      var data, eol;
      if (atom.config.get('terminal-plus.toggles.runInsertedText')) {
        eol = os.EOL;
      } else {
        eol = '';
      }
      data = "" + input + eol;
      this.terminalView.input(data);
      return this.cancel();
    };

    return InputDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL2xpYi9pbnB1dC1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1QkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLHFCQUFDLFlBQUQ7TUFBQyxJQUFDLENBQUEsZUFBRDtNQUNaLDZDQUNFO1FBQUEsTUFBQSxFQUFRLGFBQVI7UUFDQSxTQUFBLEVBQVcsZUFEWDtRQUVBLFFBQUEsRUFBVSxJQUZWO09BREY7SUFEVzs7MEJBTWIsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsQ0FBSDtRQUNFLEdBQUEsR0FBTSxFQUFFLENBQUMsSUFEWDtPQUFBLE1BQUE7UUFHRSxHQUFBLEdBQU0sR0FIUjs7TUFLQSxJQUFBLEdBQU8sRUFBQSxHQUFHLEtBQUgsR0FBVztNQUNsQixJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsQ0FBb0IsSUFBcEI7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBUlM7Ozs7S0FQYTtBQUoxQiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgXCIuL2RpYWxvZ1wiXG5vcyA9IHJlcXVpcmUgXCJvc1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIElucHV0RGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIGNvbnN0cnVjdG9yOiAoQHRlcm1pbmFsVmlldykgLT5cbiAgICBzdXBlclxuICAgICAgcHJvbXB0OiBcIkluc2VydCBUZXh0XCJcbiAgICAgIGljb25DbGFzczogXCJpY29uLWtleWJvYXJkXCJcbiAgICAgIHN0YXlPcGVuOiB0cnVlXG5cbiAgb25Db25maXJtOiAoaW5wdXQpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnRvZ2dsZXMucnVuSW5zZXJ0ZWRUZXh0JylcbiAgICAgIGVvbCA9IG9zLkVPTFxuICAgIGVsc2VcbiAgICAgIGVvbCA9ICcnXG5cbiAgICBkYXRhID0gXCIje2lucHV0fSN7ZW9sfVwiXG4gICAgQHRlcm1pbmFsVmlldy5pbnB1dCBkYXRhXG4gICAgQGNhbmNlbCgpXG4iXX0=
