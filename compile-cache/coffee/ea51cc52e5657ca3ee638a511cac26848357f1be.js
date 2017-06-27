(function() {
  var AutocompleteRuby;

  AutocompleteRuby = require('../lib/autocomplete-ruby');

  describe("AutocompleteRuby", function() {
    var activationPromise, ref, workspaceElement;
    ref = [], workspaceElement = ref[0], activationPromise = ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      activationPromise = atom.packages.activatePackage('autocomplete-ruby');
      return waitsForPromise(function() {
        return activationPromise;
      });
    });
    return describe("autocomplete-ruby", function() {
      return it('Starts and stops rsense', function() {
        var rsenseClient, rsenseProvider;
        rsenseProvider = AutocompleteRuby.rsenseProvider;
        rsenseClient = rsenseProvider.rsenseClient;
        expect(rsenseClient.rsenseStarted).toBe(false);
        rsenseProvider.requestHandler();
        expect(rsenseClient.rsenseStarted).toBe(true);
        rsenseClient.stopRsense();
        return expect(rsenseClient.rsenseStarted).toBe(true);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcnVieS9zcGVjL2F1dG9jb21wbGV0ZS1ydWJ5LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsMEJBQVI7O0VBRW5CLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxNQUF3QyxFQUF4QyxFQUFDLHlCQUFELEVBQW1CO0lBRW5CLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsbUJBQTlCO2FBQ3BCLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHO01BQUgsQ0FBaEI7SUFIUyxDQUFYO1dBS0EsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7YUFDNUIsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7QUFDNUIsWUFBQTtRQUFBLGNBQUEsR0FBaUIsZ0JBQWdCLENBQUM7UUFDbEMsWUFBQSxHQUFlLGNBQWMsQ0FBQztRQUU5QixNQUFBLENBQU8sWUFBWSxDQUFDLGFBQXBCLENBQWtDLENBQUMsSUFBbkMsQ0FBd0MsS0FBeEM7UUFHQSxjQUFjLENBQUMsY0FBZixDQUFBO1FBQ0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxhQUFwQixDQUFrQyxDQUFDLElBQW5DLENBQXdDLElBQXhDO1FBRUEsWUFBWSxDQUFDLFVBQWIsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxZQUFZLENBQUMsYUFBcEIsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxJQUF4QztNQVg0QixDQUE5QjtJQUQ0QixDQUE5QjtFQVIyQixDQUE3QjtBQUZBIiwic291cmNlc0NvbnRlbnQiOlsiQXV0b2NvbXBsZXRlUnVieSA9IHJlcXVpcmUgJy4uL2xpYi9hdXRvY29tcGxldGUtcnVieSdcblxuZGVzY3JpYmUgXCJBdXRvY29tcGxldGVSdWJ5XCIsIC0+XG4gIFt3b3Jrc3BhY2VFbGVtZW50LCBhY3RpdmF0aW9uUHJvbWlzZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGFjdGl2YXRpb25Qcm9taXNlID0gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1ydWJ5JylcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYWN0aXZhdGlvblByb21pc2VcblxuICBkZXNjcmliZSBcImF1dG9jb21wbGV0ZS1ydWJ5XCIsIC0+XG4gICAgaXQgJ1N0YXJ0cyBhbmQgc3RvcHMgcnNlbnNlJywgLT5cbiAgICAgIHJzZW5zZVByb3ZpZGVyID0gQXV0b2NvbXBsZXRlUnVieS5yc2Vuc2VQcm92aWRlclxuICAgICAgcnNlbnNlQ2xpZW50ID0gcnNlbnNlUHJvdmlkZXIucnNlbnNlQ2xpZW50XG5cbiAgICAgIGV4cGVjdChyc2Vuc2VDbGllbnQucnNlbnNlU3RhcnRlZCkudG9CZShmYWxzZSlcblxuICAgICAgIyBUaGUgZmlyc3QgcmVxdWVzdCBmb3IgYXV0b2NvbXBsZXRpb24gc3RhcnRzIHJzZW5zZVxuICAgICAgcnNlbnNlUHJvdmlkZXIucmVxdWVzdEhhbmRsZXIoKVxuICAgICAgZXhwZWN0KHJzZW5zZUNsaWVudC5yc2Vuc2VTdGFydGVkKS50b0JlKHRydWUpXG5cbiAgICAgIHJzZW5zZUNsaWVudC5zdG9wUnNlbnNlKClcbiAgICAgIGV4cGVjdChyc2Vuc2VDbGllbnQucnNlbnNlU3RhcnRlZCkudG9CZSh0cnVlKVxuIl19
