(function() {
  module.exports = {
    config: {
      preview: {
        type: 'string',
        "default": 'The Quick brown fox { 0 !== "O" }'
      },
      fontFamily: {
        description: 'Use one of the fonts available in this package.',
        type: 'string',
        "default": 'Source Code Pro',
        "enum": ['3270', 'Anka/Coder', 'Anonymous Pro', 'Aurulent Sans Mono', 'Average Mono', 'BPmono', 'Bitstream Vera Sans Mono', 'CamingoCode', 'Code New Roman', 'Consolamono', 'Cousine', 'Cutive Mono', 'DejaVu Mono', 'Droid Sans Mono', 'Effects Eighty', 'Fantasque Sans Mono', 'Fifteen', 'Fira Mono', 'FiraCode', 'FiraCode Light', 'Fixedsys Excelsior', 'Fixedsys Ligatures', 'GNU Freefont', 'GNU Unifont', 'Generic Mono', 'Gohufont 11', 'Gohufont 14', 'Hack', 'Hasklig', 'Hermit Light', 'Hermit', 'Inconsolata', 'Inconsolata-g', 'Iosevka', 'Iosevka Thin', 'Iosevka Light', 'Iosevka Extra Light', 'Iosevka Medium', 'Latin Modern Mono Light', 'Latin Modern Mono', 'Lekton', 'Liberation Mono', 'Luxi Mono', 'M+ Light', 'M+ Medium', 'M+ Thin', 'M+', 'Meslo', 'Monofur', 'Monoid', 'Mononoki', 'NotCourierSans', 'Nova Mono', 'Office Code Pro', 'Office Code Pro Light', 'Office Code Pro Medium', 'Oxygen Mono', 'PT Mono', 'Profont', 'Proggy Clean', 'Quinze', 'Roboto Mono', 'Roboto Mono Light', 'Roboto Mono Thin', 'Roboto Mono Medium', 'Share Tech Mono', 'SK Modernist', 'Source Code Pro Extra Light', 'Source Code Pro Light', 'Source Code Pro Medium', 'Source Code Pro', 'Sudo', 'TeX Gyre Cursor', 'Ubuntu Mono', 'VT323', 'Verily Serif Mono', 'saxMono']
      }
    },
    activate: function(state) {
      return atom.packages.onDidActivateInitialPackages(function() {
        var Runner;
        Runner = require('./runner');
        return Runner.run();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9mb250cy9saWIvZm9udHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLG1DQURUO09BREY7QUFBQSxNQUdBLFVBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLGlEQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsU0FBQSxFQUFTLGlCQUZUO0FBQUEsUUFHQSxNQUFBLEVBQU0sQ0FDSixNQURJLEVBRUosWUFGSSxFQUdKLGVBSEksRUFJSixvQkFKSSxFQUtKLGNBTEksRUFNSixRQU5JLEVBT0osMEJBUEksRUFRSixhQVJJLEVBU0osZ0JBVEksRUFVSixhQVZJLEVBV0osU0FYSSxFQVlKLGFBWkksRUFhSixhQWJJLEVBY0osaUJBZEksRUFlSixnQkFmSSxFQWdCSixxQkFoQkksRUFpQkosU0FqQkksRUFrQkosV0FsQkksRUFtQkosVUFuQkksRUFvQkosZ0JBcEJJLEVBcUJKLG9CQXJCSSxFQXNCSixvQkF0QkksRUF1QkosY0F2QkksRUF3QkosYUF4QkksRUF5QkosY0F6QkksRUEwQkosYUExQkksRUEyQkosYUEzQkksRUE0QkosTUE1QkksRUE2QkosU0E3QkksRUE4QkosY0E5QkksRUErQkosUUEvQkksRUFnQ0osYUFoQ0ksRUFpQ0osZUFqQ0ksRUFrQ0osU0FsQ0ksRUFtQ0osY0FuQ0ksRUFvQ0osZUFwQ0ksRUFxQ0oscUJBckNJLEVBc0NKLGdCQXRDSSxFQXVDSix5QkF2Q0ksRUF3Q0osbUJBeENJLEVBeUNKLFFBekNJLEVBMENKLGlCQTFDSSxFQTJDSixXQTNDSSxFQTRDSixVQTVDSSxFQTZDSixXQTdDSSxFQThDSixTQTlDSSxFQStDSixJQS9DSSxFQWdESixPQWhESSxFQWlESixTQWpESSxFQWtESixRQWxESSxFQW1ESixVQW5ESSxFQW9ESixnQkFwREksRUFxREosV0FyREksRUFzREosaUJBdERJLEVBdURKLHVCQXZESSxFQXdESix3QkF4REksRUF5REosYUF6REksRUEwREosU0ExREksRUEyREosU0EzREksRUE0REosY0E1REksRUE2REosUUE3REksRUE4REosYUE5REksRUErREosbUJBL0RJLEVBZ0VKLGtCQWhFSSxFQWlFSixvQkFqRUksRUFrRUosaUJBbEVJLEVBbUVKLGNBbkVJLEVBb0VKLDZCQXBFSSxFQXFFSix1QkFyRUksRUFzRUosd0JBdEVJLEVBdUVKLGlCQXZFSSxFQXdFSixNQXhFSSxFQXlFSixpQkF6RUksRUEwRUosYUExRUksRUEyRUosT0EzRUksRUE0RUosbUJBNUVJLEVBNkVKLFNBN0VJLENBSE47T0FKRjtLQURGO0FBQUEsSUF3RkEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBR1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBZCxDQUEyQyxTQUFBLEdBQUE7QUFDekMsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBO2VBQ0EsTUFBTSxDQUFDLEdBQVAsQ0FBQSxFQUZ5QztNQUFBLENBQTNDLEVBSFE7SUFBQSxDQXhGVjtHQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/gaelen/.atom/packages/fonts/lib/fonts.coffee
