(function() {
  var fs, os, path, tmp;

  os = require('os');

  fs = require('fs');

  path = require('path');

  tmp = require('tmp');

  describe("C++ autocompletions", function() {
    var editor, getCompletions, provider, ref, workdir;
    ref = [], editor = ref[0], provider = ref[1];
    workdir = path.dirname(__filename);
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-c');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-clang');
      });
      runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-clang').mainModule.provide();
      });
      waitsForPromise(function() {
        return atom.workspace.open(path.join(workdir, tmp.tmpNameSync({
          template: 'XXXXXX.cpp'
        })));
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    it("autcompletes methods of a string", function() {
      editor.setText("#include<string>\n\nint main() {\n  std::string s;\n  s.\n  return 0;\n}");
      editor.setCursorBufferPosition([4, 4]);
      return waitsForPromise(function() {
        var completions;
        completions = getCompletions();
        return completions.then(function(cs) {
          return expect(cs.length).toBeGreaterThan(100);
        });
      });
    });
    it("emits precompiled headers", function() {
      waitsForPromise(function() {
        return atom.packages.getActivePackage('autocomplete-clang').mainModule.emitPch(editor);
      });
      return runs(function() {
        var pchFile;
        pchFile = [atom.config.get("autocomplete-clang.pchFilePrefix"), 'c++', 'pch'].join('.');
        return expect(fs.statSync(path.join(workdir, pchFile))).not.toBe(void 0);
      });
    });
    it("moves cursor to declaration", function() {
      editor.setText("#include<string>\n\nint main() {\n  std::string s;\n  s;\n  return 0;\n}");
      editor.setCursorBufferPosition([4, 3]);
      waitsForPromise(function() {
        return atom.packages.getActivePackage('autocomplete-clang').mainModule.goDeclaration(editor);
      });
      return runs(function() {
        return expect(editor.getCursorBufferPosition().row).toEqual(3);
      });
    });
    return it("autcompletes with args in the file", function() {
      atom.config.set("autocomplete-clang.argsCountThreshold", 1);
      editor.setText("#include<string>\n\nint main() {\n  std::string s;\n  s.\n  return 0;\n}");
      editor.setCursorBufferPosition([4, 4]);
      return waitsForPromise(function() {
        var completions;
        completions = getCompletions();
        return completions.then(function(cs) {
          return expect(cs.length).toBeGreaterThan(100);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvc3BlYy9hdXRvY29tcGxldGUtY2xhbmctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFFTixRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtBQUM5QixRQUFBO0lBQUEsTUFBcUIsRUFBckIsRUFBQyxlQUFELEVBQVM7SUFDVCxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiO0lBRVYsY0FBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsYUFBUCxDQUFBO01BQ1QsS0FBQSxHQUFRLE1BQU0sQ0FBQyx1Q0FBUCxDQUFBO01BQ1IsR0FBQSxHQUFNLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ04sTUFBQSxHQUFTLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdEI7TUFDVCxPQUFBLEdBQ0U7UUFBQSxNQUFBLEVBQVEsTUFBUjtRQUNBLGNBQUEsRUFBZ0IsR0FEaEI7UUFFQSxlQUFBLEVBQWlCLE1BQU0sQ0FBQyxrQkFBUCxDQUFBLENBRmpCO1FBR0EsTUFBQSxFQUFRLE1BSFI7O2FBSUYsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsT0FBeEI7SUFWZTtJQVlqQixVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QjtNQUFILENBQWhCO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxD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QixDQUFDLGVBQWxCLENBQWtDLEdBQWxDO1FBRGUsQ0FBakI7TUFGYyxDQUFoQjtJQVp1QyxDQUF6QztFQWpFOEIsQ0FBaEM7QUFMQSIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG50bXAgPSByZXF1aXJlICd0bXAnXG5cbmRlc2NyaWJlIFwiQysrIGF1dG9jb21wbGV0aW9uc1wiLCAtPlxuICBbZWRpdG9yLCBwcm92aWRlcl0gPSBbXVxuICB3b3JrZGlyID0gcGF0aC5kaXJuYW1lIF9fZmlsZW5hbWVcblxuICBnZXRDb21wbGV0aW9ucyA9IC0+XG4gICAgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIHN0YXJ0ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbigpXG4gICAgZW5kID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBwcmVmaXggPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW3N0YXJ0LCBlbmRdKVxuICAgIHJlcXVlc3QgPVxuICAgICAgZWRpdG9yOiBlZGl0b3JcbiAgICAgIGJ1ZmZlclBvc2l0aW9uOiBlbmRcbiAgICAgIHNjb3BlRGVzY3JpcHRvcjogY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpXG4gICAgICBwcmVmaXg6IHByZWZpeFxuICAgIHByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zKHJlcXVlc3QpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtYycpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtY2xhbmcnKVxuICAgIHJ1bnMgLT5cbiAgICAgIHByb3ZpZGVyID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdhdXRvY29tcGxldGUtY2xhbmcnKS5tYWluTW9kdWxlLnByb3ZpZGUoKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLmpvaW4od29ya2RpciwgdG1wLnRtcE5hbWVTeW5jKHRlbXBsYXRlOiAnWFhYWFhYLmNwcCcpKSlcbiAgICBydW5zIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBpdCBcImF1dGNvbXBsZXRlcyBtZXRob2RzIG9mIGEgc3RyaW5nXCIsIC0+XG4gICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgI2luY2x1ZGU8c3RyaW5nPlxuXG4gICAgaW50IG1haW4oKSB7XG4gICAgICBzdGQ6OnN0cmluZyBzO1xuICAgICAgcy5cbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBcIlwiXCJcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzQsIDRdKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgY29tcGxldGlvbnMgPSBnZXRDb21wbGV0aW9ucygpXG4gICAgICBjb21wbGV0aW9ucy50aGVuIChjcyktPlxuICAgICAgICBleHBlY3QoY3MubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMTAwKVxuXG4gIGl0IFwiZW1pdHMgcHJlY29tcGlsZWQgaGVhZGVyc1wiLCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdhdXRvY29tcGxldGUtY2xhbmcnKS5tYWluTW9kdWxlLmVtaXRQY2ggZWRpdG9yXG4gICAgcnVucyAtPlxuICAgICAgcGNoRmlsZSA9IFthdG9tLmNvbmZpZy5nZXQoXCJhdXRvY29tcGxldGUtY2xhbmcucGNoRmlsZVByZWZpeFwiKSwnYysrJywncGNoJ10uam9pbiAnLidcbiAgICAgIGV4cGVjdChmcy5zdGF0U3luYyhwYXRoLmpvaW4gd29ya2RpciwgcGNoRmlsZSkpLm5vdC50b0JlKHVuZGVmaW5lZClcblxuICBpdCBcIm1vdmVzIGN1cnNvciB0byBkZWNsYXJhdGlvblwiLCAtPlxuICAgIGVkaXRvci5zZXRUZXh0IFwiXCJcIlxuICAgICNpbmNsdWRlPHN0cmluZz5cblxuICAgIGludCBtYWluKCkge1xuICAgICAgc3RkOjpzdHJpbmcgcztcbiAgICAgIHM7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgXCJcIlwiXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs0LCAzXSlcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnYXV0b2NvbXBsZXRlLWNsYW5nJykubWFpbk1vZHVsZS5nb0RlY2xhcmF0aW9uIGVkaXRvclxuICAgIHJ1bnMgLT5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpLnRvRXF1YWwoMylcblxuICBpdCBcImF1dGNvbXBsZXRlcyB3aXRoIGFyZ3MgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuYXJnc0NvdW50VGhyZXNob2xkXCIsIDFcbiAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAjaW5jbHVkZTxzdHJpbmc+XG5cbiAgICBpbnQgbWFpbigpIHtcbiAgICAgIHN0ZDo6c3RyaW5nIHM7XG4gICAgICBzLlxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIFwiXCJcIlxuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNCwgNF0pXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBjb21wbGV0aW9ucyA9IGdldENvbXBsZXRpb25zKClcbiAgICAgIGNvbXBsZXRpb25zLnRoZW4gKGNzKS0+XG4gICAgICAgIGV4cGVjdChjcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigxMDApXG4iXX0=
