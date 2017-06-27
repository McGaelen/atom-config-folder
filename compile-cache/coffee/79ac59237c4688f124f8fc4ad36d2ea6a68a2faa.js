(function() {
  var GEM_HOME, RsenseProvider;

  RsenseProvider = require('./autocomplete-ruby-provider.coffee');

  GEM_HOME = require('./gem-home.coffee');

  module.exports = {
    config: {
      rsensePath: {
        description: 'The location of the rsense executable',
        type: 'string',
        "default": GEM_HOME + "/rsense"
      },
      port: {
        description: 'The port the rsense server is running on',
        type: 'integer',
        "default": 47367,
        minimum: 1024,
        maximum: 65535
      },
      suggestionPriority: {
        description: 'Show autocomplete-ruby content before default autocomplete-plus provider',
        "default": false,
        type: 'boolean'
      }
    },
    rsenseProvider: null,
    activate: function(state) {
      return this.rsenseProvider = new RsenseProvider();
    },
    provideAutocompletion: function() {
      return this.rsenseProvider;
    },
    deactivate: function() {
      var ref;
      if ((ref = this.rsenseProvider) != null) {
        ref.dispose();
      }
      return this.rsenseProvider = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcnVieS9saWIvYXV0b2NvbXBsZXRlLXJ1YnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxxQ0FBUjs7RUFDakIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLHVDQUFiO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFZLFFBQUQsR0FBVSxTQUZyQjtPQURGO01BSUEsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLDBDQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7UUFHQSxPQUFBLEVBQVMsSUFIVDtRQUlBLE9BQUEsRUFBUyxLQUpUO09BTEY7TUFVQSxrQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLDBFQUFiO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsSUFBQSxFQUFNLFNBRk47T0FYRjtLQURGO0lBZ0JBLGNBQUEsRUFBZ0IsSUFoQmhCO0lBa0JBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLGNBQUEsQ0FBQTtJQURkLENBbEJWO0lBcUJBLHFCQUFBLEVBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBO0lBRG9CLENBckJ2QjtJQXdCQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWUsQ0FBRSxPQUFqQixDQUFBOzthQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBRlIsQ0F4Qlo7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJSc2Vuc2VQcm92aWRlciA9IHJlcXVpcmUgJy4vYXV0b2NvbXBsZXRlLXJ1YnktcHJvdmlkZXIuY29mZmVlJ1xuR0VNX0hPTUUgPSByZXF1aXJlKCcuL2dlbS1ob21lLmNvZmZlZScpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIHJzZW5zZVBhdGg6XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBsb2NhdGlvbiBvZiB0aGUgcnNlbnNlIGV4ZWN1dGFibGUnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCIje0dFTV9IT01FfS9yc2Vuc2VcIlxuICAgIHBvcnQ6XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwb3J0IHRoZSByc2Vuc2Ugc2VydmVyIGlzIHJ1bm5pbmcgb24nXG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDQ3MzY3XG4gICAgICBtaW5pbXVtOiAxMDI0XG4gICAgICBtYXhpbXVtOiA2NTUzNVxuICAgIHN1Z2dlc3Rpb25Qcmlvcml0eTpcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBhdXRvY29tcGxldGUtcnVieSBjb250ZW50IGJlZm9yZSBkZWZhdWx0IGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuXG4gIHJzZW5zZVByb3ZpZGVyOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAcnNlbnNlUHJvdmlkZXIgPSBuZXcgUnNlbnNlUHJvdmlkZXIoKVxuXG4gIHByb3ZpZGVBdXRvY29tcGxldGlvbjogLT5cbiAgICBAcnNlbnNlUHJvdmlkZXJcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEByc2Vuc2VQcm92aWRlcj8uZGlzcG9zZSgpXG4gICAgQHJzZW5zZVByb3ZpZGVyID0gbnVsbFxuIl19
