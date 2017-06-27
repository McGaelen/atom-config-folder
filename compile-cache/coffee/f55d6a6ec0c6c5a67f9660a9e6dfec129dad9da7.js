(function() {
  var TerminalPlus;

  TerminalPlus = require('../lib/terminal-plus');

  describe("TerminalPlus", function() {
    var activationPromise, ref, workspaceElement;
    ref = [], workspaceElement = ref[0], activationPromise = ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('terminal-plus');
    });
    return describe("when the terminal-plus:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.terminal-plus')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var statusBar, terminalPlusElement;
          expect(workspaceElement.querySelector('.terminal-plus')).toExist();
          terminalPlusElement = workspaceElement.querySelector('.terminal-plus');
          expect(terminalPlusElement).toExist();
          statusBar = atom.workspace.panelForItem(terminalPlusElement);
          expect(statusBar.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
          return expect(statusBar.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.terminal-plus')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var terminalPlusElement;
          terminalPlusElement = workspaceElement.querySelector('.terminal-plus');
          expect(terminalPlusElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'terminal-plus:toggle');
          return expect(terminalPlusElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy90ZXJtaW5hbC1wbHVzL3NwZWMvdGVybWluYWwtcGx1cy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxzQkFBUjs7RUFPZixRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxNQUF3QyxFQUF4QyxFQUFDLHlCQUFELEVBQW1CO0lBRW5CLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjthQUNuQixpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUI7SUFGWCxDQUFYO1dBSUEsUUFBQSxDQUFTLGtEQUFULEVBQTZELFNBQUE7TUFDM0QsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUE7UUFHcEMsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGdCQUEvQixDQUFQLENBQXdELENBQUMsR0FBRyxDQUFDLE9BQTdELENBQUE7UUFJQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHNCQUF6QztRQUVBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZDtRQURjLENBQWhCO2VBR0EsSUFBQSxDQUFLLFNBQUE7QUFDSCxjQUFBO1VBQUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGdCQUEvQixDQUFQLENBQXdELENBQUMsT0FBekQsQ0FBQTtVQUVBLG1CQUFBLEdBQXNCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGdCQUEvQjtVQUN0QixNQUFBLENBQU8sbUJBQVAsQ0FBMkIsQ0FBQyxPQUE1QixDQUFBO1VBRUEsU0FBQSxHQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBZixDQUE0QixtQkFBNUI7VUFDWixNQUFBLENBQU8sU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFQLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsSUFBbkM7VUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHNCQUF6QztpQkFDQSxNQUFBLENBQU8sU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFQLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsS0FBbkM7UUFURyxDQUFMO01BWm9DLENBQXRDO2FBdUJBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBO1FBTzdCLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQjtRQUVBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixnQkFBL0IsQ0FBUCxDQUF3RCxDQUFDLEdBQUcsQ0FBQyxPQUE3RCxDQUFBO1FBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5QyxzQkFBekM7UUFFQSxlQUFBLENBQWdCLFNBQUE7aUJBQ2Q7UUFEYyxDQUFoQjtlQUdBLElBQUEsQ0FBSyxTQUFBO0FBRUgsY0FBQTtVQUFBLG1CQUFBLEdBQXNCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGdCQUEvQjtVQUN0QixNQUFBLENBQU8sbUJBQVAsQ0FBMkIsQ0FBQyxXQUE1QixDQUFBO1VBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5QyxzQkFBekM7aUJBQ0EsTUFBQSxDQUFPLG1CQUFQLENBQTJCLENBQUMsR0FBRyxDQUFDLFdBQWhDLENBQUE7UUFMRyxDQUFMO01BbEI2QixDQUEvQjtJQXhCMkQsQ0FBN0Q7RUFQdUIsQ0FBekI7QUFQQSIsInNvdXJjZXNDb250ZW50IjpbIlRlcm1pbmFsUGx1cyA9IHJlcXVpcmUgJy4uL2xpYi90ZXJtaW5hbC1wbHVzJ1xuXG4jIFVzZSB0aGUgY29tbWFuZCBgd2luZG93OnJ1bi1wYWNrYWdlLXNwZWNzYCAoY21kLWFsdC1jdHJsLXApIHRvIHJ1biBzcGVjcy5cbiNcbiMgVG8gcnVuIGEgc3BlY2lmaWMgYGl0YCBvciBgZGVzY3JpYmVgIGJsb2NrIGFkZCBhbiBgZmAgdG8gdGhlIGZyb250IChlLmcuIGBmaXRgXG4jIG9yIGBmZGVzY3JpYmVgKS4gUmVtb3ZlIHRoZSBgZmAgdG8gdW5mb2N1cyB0aGUgYmxvY2suXG5cbmRlc2NyaWJlIFwiVGVybWluYWxQbHVzXCIsIC0+XG4gIFt3b3Jrc3BhY2VFbGVtZW50LCBhY3RpdmF0aW9uUHJvbWlzZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGFjdGl2YXRpb25Qcm9taXNlID0gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3Rlcm1pbmFsLXBsdXMnKVxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGUgdGVybWluYWwtcGx1czp0b2dnbGUgZXZlbnQgaXMgdHJpZ2dlcmVkXCIsIC0+XG4gICAgaXQgXCJoaWRlcyBhbmQgc2hvd3MgdGhlIG1vZGFsIHBhbmVsXCIsIC0+XG4gICAgICAjIEJlZm9yZSB0aGUgYWN0aXZhdGlvbiBldmVudCB0aGUgdmlldyBpcyBub3Qgb24gdGhlIERPTSwgYW5kIG5vIHBhbmVsXG4gICAgICAjIGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbC1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgIyBUaGlzIGlzIGFuIGFjdGl2YXRpb24gZXZlbnQsIHRyaWdnZXJpbmcgaXQgd2lsbCBjYXVzZSB0aGUgcGFja2FnZSB0byBiZVxuICAgICAgIyBhY3RpdmF0ZWQuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICd0ZXJtaW5hbC1wbHVzOnRvZ2dsZSdcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGFjdGl2YXRpb25Qcm9taXNlXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLXBsdXMnKSkudG9FeGlzdCgpXG5cbiAgICAgICAgdGVybWluYWxQbHVzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLXBsdXMnKVxuICAgICAgICBleHBlY3QodGVybWluYWxQbHVzRWxlbWVudCkudG9FeGlzdCgpXG5cbiAgICAgICAgc3RhdHVzQmFyID0gYXRvbS53b3Jrc3BhY2UucGFuZWxGb3JJdGVtKHRlcm1pbmFsUGx1c0VsZW1lbnQpXG4gICAgICAgIGV4cGVjdChzdGF0dXNCYXIuaXNWaXNpYmxlKCkpLnRvQmUgdHJ1ZVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICd0ZXJtaW5hbC1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0KHN0YXR1c0Jhci5pc1Zpc2libGUoKSkudG9CZSBmYWxzZVxuXG4gICAgaXQgXCJoaWRlcyBhbmQgc2hvd3MgdGhlIHZpZXdcIiwgLT5cbiAgICAgICMgVGhpcyB0ZXN0IHNob3dzIHlvdSBhbiBpbnRlZ3JhdGlvbiB0ZXN0IHRlc3RpbmcgYXQgdGhlIHZpZXcgbGV2ZWwuXG5cbiAgICAgICMgQXR0YWNoaW5nIHRoZSB3b3Jrc3BhY2VFbGVtZW50IHRvIHRoZSBET00gaXMgcmVxdWlyZWQgdG8gYWxsb3cgdGhlXG4gICAgICAjIGB0b0JlVmlzaWJsZSgpYCBtYXRjaGVycyB0byB3b3JrLiBBbnl0aGluZyB0ZXN0aW5nIHZpc2liaWxpdHkgb3IgZm9jdXNcbiAgICAgICMgcmVxdWlyZXMgdGhhdCB0aGUgd29ya3NwYWNlRWxlbWVudCBpcyBvbiB0aGUgRE9NLiBUZXN0cyB0aGF0IGF0dGFjaCB0aGVcbiAgICAgICMgd29ya3NwYWNlRWxlbWVudCB0byB0aGUgRE9NIGFyZSBnZW5lcmFsbHkgc2xvd2VyIHRoYW4gdGhvc2Ugb2ZmIERPTS5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudClcblxuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAjIFRoaXMgaXMgYW4gYWN0aXZhdGlvbiBldmVudCwgdHJpZ2dlcmluZyBpdCBjYXVzZXMgdGhlIHBhY2thZ2UgdG8gYmVcbiAgICAgICMgYWN0aXZhdGVkLlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAndGVybWluYWwtcGx1czp0b2dnbGUnXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgICMgTm93IHdlIGNhbiB0ZXN0IGZvciB2aWV3IHZpc2liaWxpdHlcbiAgICAgICAgdGVybWluYWxQbHVzRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLXBsdXMnKVxuICAgICAgICBleHBlY3QodGVybWluYWxQbHVzRWxlbWVudCkudG9CZVZpc2libGUoKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICd0ZXJtaW5hbC1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0KHRlcm1pbmFsUGx1c0VsZW1lbnQpLm5vdC50b0JlVmlzaWJsZSgpXG4iXX0=