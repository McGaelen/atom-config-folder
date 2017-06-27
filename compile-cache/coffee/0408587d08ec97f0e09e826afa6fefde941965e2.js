(function() {
  var Point, clangSourceScopeDictionary;

  Point = require('atom').Point;

  clangSourceScopeDictionary = {
    'source.cpp': 'c++',
    'source.c': 'c',
    'source.objc': 'objective-c',
    'source.objcpp': 'objective-c++',
    'source.c++': 'c++',
    'source.objc++': 'objective-c++'
  };

  module.exports = {
    getFirstCursorSourceScopeLang: function(editor) {
      var scopes;
      scopes = this.getFirstCursorScopes(editor);
      return this.getSourceScopeLang(scopes);
    },
    getFirstCursorScopes: function(editor) {
      var firstPosition, scopeDescriptor, scopes;
      if (editor.getCursors) {
        firstPosition = editor.getCursors()[0].getBufferPosition();
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(firstPosition);
        return scopes = scopeDescriptor.getScopesArray();
      } else {
        return scopes = [];
      }
    },
    getSourceScopeLang: function(scopes, scopeDictionary) {
      var i, lang, len, scope;
      if (scopeDictionary == null) {
        scopeDictionary = clangSourceScopeDictionary;
      }
      lang = null;
      for (i = 0, len = scopes.length; i < len; i++) {
        scope = scopes[i];
        if (scope in scopeDictionary) {
          return scopeDictionary[scope];
        }
      }
    },
    prefixAtPosition: function(editor, bufferPosition) {
      var line, ref, regex;
      regex = /\w+$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((ref = line.match(regex)) != null ? ref[0] : void 0) || '';
    },
    nearestSymbolPosition: function(editor, bufferPosition) {
      var line, matches, regex, symbol, symbolColumn;
      regex = /(\W+)\w*$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(regex);
      if (matches) {
        symbol = matches[1];
        symbolColumn = matches[0].indexOf(symbol) + symbol.length + (line.length - matches[0].length);
        return [new Point(bufferPosition.row, symbolColumn), symbol.slice(-1)];
      } else {
        return [bufferPosition, ''];
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLDBCQUFBLEdBQTZCO0lBQzNCLFlBQUEsRUFBa0IsS0FEUztJQUUzQixVQUFBLEVBQWtCLEdBRlM7SUFHM0IsYUFBQSxFQUFrQixhQUhTO0lBSTNCLGVBQUEsRUFBa0IsZUFKUztJQU8zQixZQUFBLEVBQWtCLEtBUFM7SUFRM0IsZUFBQSxFQUFrQixlQVJTOzs7RUFXN0IsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLDZCQUFBLEVBQStCLFNBQUMsTUFBRDtBQUM3QixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QjtBQUNULGFBQU8sSUFBQyxDQUFBLGtCQUFELENBQW9CLE1BQXBCO0lBRnNCLENBQS9CO0lBSUEsb0JBQUEsRUFBc0IsU0FBQyxNQUFEO0FBQ3BCLFVBQUE7TUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFWO1FBQ0UsYUFBQSxHQUFnQixNQUFNLENBQUMsVUFBUCxDQUFBLENBQW9CLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBQXZCLENBQUE7UUFDaEIsZUFBQSxHQUFrQixNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsYUFBeEM7ZUFDbEIsTUFBQSxHQUFTLGVBQWUsQ0FBQyxjQUFoQixDQUFBLEVBSFg7T0FBQSxNQUFBO2VBS0UsTUFBQSxHQUFTLEdBTFg7O0lBRG9CLENBSnRCO0lBWUEsa0JBQUEsRUFBb0IsU0FBQyxNQUFELEVBQVMsZUFBVDtBQUNsQixVQUFBOztRQUQyQixrQkFBZ0I7O01BQzNDLElBQUEsR0FBTztBQUNQLFdBQUEsd0NBQUE7O1FBQ0UsSUFBRyxLQUFBLElBQVMsZUFBWjtBQUNFLGlCQUFPLGVBQWdCLENBQUEsS0FBQSxFQUR6Qjs7QUFERjtJQUZrQixDQVpwQjtJQWtCQSxnQkFBQSxFQUFrQixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ2hCLFVBQUE7TUFBQSxLQUFBLEdBQVE7TUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO3FEQUNZLENBQUEsQ0FBQSxXQUFuQixJQUF5QjtJQUhULENBbEJsQjtJQXVCQSxxQkFBQSxFQUF1QixTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ3JCLFVBQUE7TUFBQSxLQUFBLEdBQVE7TUFDUixJQUFBLEdBQU8sTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFoQixFQUFxQixDQUFyQixDQUFELEVBQTBCLGNBQTFCLENBQXRCO01BQ1AsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWDtNQUNWLElBQUcsT0FBSDtRQUNFLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQTtRQUNqQixZQUFBLEdBQWUsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FBQSxHQUE2QixNQUFNLENBQUMsTUFBcEMsR0FBNkMsQ0FBQyxJQUFJLENBQUMsTUFBTCxHQUFjLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUExQjtlQUM1RCxDQUFLLElBQUEsS0FBQSxDQUFNLGNBQWMsQ0FBQyxHQUFyQixFQUEwQixZQUExQixDQUFMLEVBQTZDLE1BQU8sVUFBcEQsRUFIRjtPQUFBLE1BQUE7ZUFLRSxDQUFDLGNBQUQsRUFBZ0IsRUFBaEIsRUFMRjs7SUFKcUIsQ0F2QnZCOztBQWRGIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5cbmNsYW5nU291cmNlU2NvcGVEaWN0aW9uYXJ5ID0ge1xuICAnc291cmNlLmNwcCcgICAgOiAnYysrJyAsXG4gICdzb3VyY2UuYycgICAgICA6ICdjJyAsXG4gICdzb3VyY2Uub2JqYycgICA6ICdvYmplY3RpdmUtYycgLFxuICAnc291cmNlLm9iamNwcCcgOiAnb2JqZWN0aXZlLWMrKycgLFxuXG4gICMgRm9yIGJhY2t3YXJkLWNvbXBhdGliaWxpdHkgd2l0aCB2ZXJzaW9ucyBvZiBBdG9tIDwgMC4xNjZcbiAgJ3NvdXJjZS5jKysnICAgIDogJ2MrKycgLFxuICAnc291cmNlLm9iamMrKycgOiAnb2JqZWN0aXZlLWMrKycgLFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldEZpcnN0Q3Vyc29yU291cmNlU2NvcGVMYW5nOiAoZWRpdG9yKSAtPlxuICAgIHNjb3BlcyA9IEBnZXRGaXJzdEN1cnNvclNjb3BlcyBlZGl0b3JcbiAgICByZXR1cm4gQGdldFNvdXJjZVNjb3BlTGFuZyBzY29wZXNcblxuICBnZXRGaXJzdEN1cnNvclNjb3BlczogKGVkaXRvcikgLT5cbiAgICBpZiBlZGl0b3IuZ2V0Q3Vyc29yc1xuICAgICAgZmlyc3RQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JzKClbMF0uZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGZpcnN0UG9zaXRpb24pXG4gICAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGVsc2VcbiAgICAgIHNjb3BlcyA9IFtdXG5cbiAgZ2V0U291cmNlU2NvcGVMYW5nOiAoc2NvcGVzLCBzY29wZURpY3Rpb25hcnk9Y2xhbmdTb3VyY2VTY29wZURpY3Rpb25hcnkpIC0+XG4gICAgbGFuZyA9IG51bGxcbiAgICBmb3Igc2NvcGUgaW4gc2NvcGVzXG4gICAgICBpZiBzY29wZSBvZiBzY29wZURpY3Rpb25hcnlcbiAgICAgICAgcmV0dXJuIHNjb3BlRGljdGlvbmFyeVtzY29wZV1cblxuICBwcmVmaXhBdFBvc2l0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICByZWdleCA9IC9cXHcrJC9cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIGxpbmUubWF0Y2gocmVnZXgpP1swXSBvciAnJ1xuXG4gIG5lYXJlc3RTeW1ib2xQb3NpdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcmVnZXggPSAvKFxcVyspXFx3KiQvXG4gICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSlcbiAgICBtYXRjaGVzID0gbGluZS5tYXRjaChyZWdleClcbiAgICBpZiBtYXRjaGVzXG4gICAgICBzeW1ib2wgPSBtYXRjaGVzWzFdXG4gICAgICBzeW1ib2xDb2x1bW4gPSBtYXRjaGVzWzBdLmluZGV4T2Yoc3ltYm9sKSArIHN5bWJvbC5sZW5ndGggKyAobGluZS5sZW5ndGggLSBtYXRjaGVzWzBdLmxlbmd0aClcbiAgICAgIFtuZXcgUG9pbnQoYnVmZmVyUG9zaXRpb24ucm93LCBzeW1ib2xDb2x1bW4pLHN5bWJvbFstMS4uXV1cbiAgICBlbHNlXG4gICAgICBbYnVmZmVyUG9zaXRpb24sJyddXG4iXX0=
