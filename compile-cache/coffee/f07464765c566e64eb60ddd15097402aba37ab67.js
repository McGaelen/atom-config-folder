(function() {
  module.exports = {
    run: function() {
      var applyFont, body, fixer, fixerProto, triggerMeasurements;
      body = document.querySelector('body');
      triggerMeasurements = function(force) {
        atom.workspace.increaseFontSize();
        return atom.workspace.decreaseFontSize();
      };
      applyFont = function(font) {
        body.setAttribute('fonts-editor-font', font);
        return triggerMeasurements();
      };
      applyFont(atom.config.get('fonts.fontFamily'));
      atom.config.observe('fonts.fontFamily', function() {
        return applyFont(atom.config.get('fonts.fontFamily'));
      });
      setTimeout((function() {
        return triggerMeasurements();
      }), 500);
      fixerProto = Object.create(HTMLElement.prototype);
      fixerProto.createdCallback = function() {
        this.innerHTML = "regular<b>bold<i>italic</i></b><i>italic</i>";
      };
      fixer = document.registerElement("fonts-fixer", {
        prototype: fixerProto
      });
      return atom.views.getView(atom.workspace).appendChild(new fixer());
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9mb250cy9saWIvcnVubmVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBO0FBRUgsVUFBQSx1REFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVAsQ0FBQTtBQUFBLE1BRUEsbUJBQUEsR0FBc0IsU0FBQyxLQUFELEdBQUE7QUFDcEIsUUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFmLENBQUEsQ0FBQSxDQUFBO2VBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZixDQUFBLEVBRm9CO01BQUEsQ0FGdEIsQ0FBQTtBQUFBLE1BTUEsU0FBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsUUFBQSxJQUFJLENBQUMsWUFBTCxDQUFrQixtQkFBbEIsRUFBdUMsSUFBdkMsQ0FBQSxDQUFBO2VBQ0EsbUJBQUEsQ0FBQSxFQUZVO01BQUEsQ0FOWixDQUFBO0FBQUEsTUFXQSxTQUFBLENBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixDQURGLENBWEEsQ0FBQTtBQUFBLE1BaUJBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixrQkFBcEIsRUFBd0MsU0FBQSxHQUFBO2VBQ3RDLFNBQUEsQ0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLENBQVYsRUFEc0M7TUFBQSxDQUF4QyxDQWpCQSxDQUFBO0FBQUEsTUFzQkEsVUFBQSxDQUFXLENBQUMsU0FBQSxHQUFBO2VBQ1YsbUJBQUEsQ0FBQSxFQURVO01BQUEsQ0FBRCxDQUFYLEVBRUcsR0FGSCxDQXRCQSxDQUFBO0FBQUEsTUE0QkEsVUFBQSxHQUFhLE1BQU0sQ0FBQyxNQUFQLENBQWMsV0FBVyxDQUFBLFNBQXpCLENBNUJiLENBQUE7QUFBQSxNQTZCQSxVQUFVLENBQUMsZUFBWCxHQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLDhDQUFiLENBRDJCO01BQUEsQ0E3QjdCLENBQUE7QUFBQSxNQWlDQSxLQUFBLEdBQVEsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsYUFBekIsRUFDTjtBQUFBLFFBQUEsU0FBQSxFQUFXLFVBQVg7T0FETSxDQWpDUixDQUFBO2FBcUNBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBa0MsQ0FBQyxXQUFuQyxDQUFtRCxJQUFBLEtBQUEsQ0FBQSxDQUFuRCxFQXZDRztJQUFBLENBQUw7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/gaelen/.atom/packages/fonts/lib/runner.coffee
