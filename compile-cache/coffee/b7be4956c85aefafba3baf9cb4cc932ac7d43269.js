(function() {
  var clangSourceScopeDictionary;

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
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSwwQkFBQSxHQUE2QjtJQUMzQixZQUFBLEVBQWtCLEtBRFM7SUFFM0IsVUFBQSxFQUFrQixHQUZTO0lBRzNCLGFBQUEsRUFBa0IsYUFIUztJQUkzQixlQUFBLEVBQWtCLGVBSlM7SUFPM0IsWUFBQSxFQUFrQixLQVBTO0lBUTNCLGVBQUEsRUFBa0IsZUFSUzs7O0VBVzdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSw2QkFBQSxFQUErQixTQUFDLE1BQUQ7QUFDN0IsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEI7QUFDVCxhQUFPLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixNQUFwQjtJQUZzQixDQUEvQjtJQUlBLG9CQUFBLEVBQXNCLFNBQUMsTUFBRDtBQUNwQixVQUFBO01BQUEsSUFBRyxNQUFNLENBQUMsVUFBVjtRQUNFLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFvQixDQUFBLENBQUEsQ0FBRSxDQUFDLGlCQUF2QixDQUFBO1FBQ2hCLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQXdDLGFBQXhDO2VBQ2xCLE1BQUEsR0FBUyxlQUFlLENBQUMsY0FBaEIsQ0FBQSxFQUhYO09BQUEsTUFBQTtlQUtFLE1BQUEsR0FBUyxHQUxYOztJQURvQixDQUp0QjtJQVlBLGtCQUFBLEVBQW9CLFNBQUMsTUFBRCxFQUFTLGVBQVQ7QUFDbEIsVUFBQTs7UUFEMkIsa0JBQWdCOztNQUMzQyxJQUFBLEdBQU87QUFDUCxXQUFBLHdDQUFBOztRQUNFLElBQUcsS0FBQSxJQUFTLGVBQVo7QUFDRSxpQkFBTyxlQUFnQixDQUFBLEtBQUEsRUFEekI7O0FBREY7SUFGa0IsQ0FacEI7O0FBWkYiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFuZ1NvdXJjZVNjb3BlRGljdGlvbmFyeSA9IHtcbiAgJ3NvdXJjZS5jcHAnICAgIDogJ2MrKycgLFxuICAnc291cmNlLmMnICAgICAgOiAnYycgLFxuICAnc291cmNlLm9iamMnICAgOiAnb2JqZWN0aXZlLWMnICxcbiAgJ3NvdXJjZS5vYmpjcHAnIDogJ29iamVjdGl2ZS1jKysnICxcblxuICAjIEZvciBiYWNrd2FyZC1jb21wYXRpYmlsaXR5IHdpdGggdmVyc2lvbnMgb2YgQXRvbSA8IDAuMTY2XG4gICdzb3VyY2UuYysrJyAgICA6ICdjKysnICxcbiAgJ3NvdXJjZS5vYmpjKysnIDogJ29iamVjdGl2ZS1jKysnICxcbn1cblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZzogKGVkaXRvcikgLT5cbiAgICBzY29wZXMgPSBAZ2V0Rmlyc3RDdXJzb3JTY29wZXMgZWRpdG9yXG4gICAgcmV0dXJuIEBnZXRTb3VyY2VTY29wZUxhbmcgc2NvcGVzXG5cbiAgZ2V0Rmlyc3RDdXJzb3JTY29wZXM6IChlZGl0b3IpIC0+XG4gICAgaWYgZWRpdG9yLmdldEN1cnNvcnNcbiAgICAgIGZpcnN0UG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29ycygpWzBdLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihmaXJzdFBvc2l0aW9uKVxuICAgICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBlbHNlXG4gICAgICBzY29wZXMgPSBbXVxuXG4gIGdldFNvdXJjZVNjb3BlTGFuZzogKHNjb3Blcywgc2NvcGVEaWN0aW9uYXJ5PWNsYW5nU291cmNlU2NvcGVEaWN0aW9uYXJ5KSAtPlxuICAgIGxhbmcgPSBudWxsXG4gICAgZm9yIHNjb3BlIGluIHNjb3Blc1xuICAgICAgaWYgc2NvcGUgb2Ygc2NvcGVEaWN0aW9uYXJ5XG4gICAgICAgIHJldHVybiBzY29wZURpY3Rpb25hcnlbc2NvcGVdXG4iXX0=
