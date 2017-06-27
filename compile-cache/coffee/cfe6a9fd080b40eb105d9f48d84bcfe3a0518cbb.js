(function() {
  describe('directive grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('angularjs');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('text.html.angular');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('text.html.angular');
    });
    describe('directive attributes', function() {
      it('tokenizes ng-repeat attribute inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<dd ng-repeat="availability in phone.availability">{{availability}}</dd>');
        return expect(lines[0][3]).toEqual({
          value: 'ng-repeat',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-src and ng-click attributes inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<li ng-repeat="img in phone.images">\n  <img ng-src="{{img}}" ng-click="setImage(img)">\n</li>');
        expect(lines[0][3]).toEqual({
          value: 'ng-repeat',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
        expect(lines[1][4]).toEqual({
          value: 'ng-src',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
        return expect(lines[1][12]).toEqual({
          value: 'ng-click',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-view attribute without value inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<div ng-view class="view-frame"></div>');
        return expect(lines[0][3]).toEqual({
          value: 'ng-view',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes capitalized ng-repeat attribute inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<dd NG-REPEAT="availability in phone.availability">{{availability}}</dd>');
        return expect(lines[0][3]).toEqual({
          value: 'NG-REPEAT',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-repeat-start and ng-repeat-end attribute', function() {
        var lines;
        lines = grammar.tokenizeLines('<div ng-repeat-start></div>\n<div ng-repeat-end></div>');
        expect(lines[0][3]).toEqual({
          value: 'ng-repeat-start',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
        return expect(lines[1][3]).toEqual({
          value: 'ng-repeat-end',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-controller attribute in body tag', function() {
        var lines;
        lines = grammar.tokenizeLines('<body ng-controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'ng-controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes ng-s attribute', function() {
        var lines;
        lines = grammar.tokenizeLines('<select ng-options="color.name group by color.shade for color in colors">');
        return expect(lines[0][3]).toEqual({
          value: 'ng-options',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      return it('tokenizes ng- attributes for anchor tags', function() {
        var lines;
        lines = grammar.tokenizeLines('<a href="/url" ng-click=\'{{setImage(img)}}\'>');
        return expect(lines[0][9]).toEqual({
          value: 'ng-click',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
    });
    describe('directive element', function() {
      it('tokenizes ng-include element inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<ng-include src=""></ng-include>');
        expect(lines[0][1]).toEqual({
          value: 'ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      return it('tokenizes capitalized ng-include element inside HTML', function() {
        var lines;
        lines = grammar.tokenizeLines('<NG-INCLUDE src=""></NG-INCLUDE>');
        expect(lines[0][1]).toEqual({
          value: 'NG-INCLUDE',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'NG-INCLUDE',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
    });
    describe('normalization angular tag and attribute', function() {
      it('tokenizes data- prefixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body data-ng-controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'data-ng-controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes x- prefixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body x-ng-controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'x-ng-controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes _ suffixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body ng_controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'ng_controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes : suffixed angular attributes', function() {
        var lines;
        lines = grammar.tokenizeLines('<body ng:controller="TestCtrl">');
        return expect(lines[0][3]).toEqual({
          value: 'ng:controller',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'support.other.attribute-name.html.angular']
        });
      });
      it('tokenizes data- prefixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<data-ng-include src=""></data-ng-include>');
        expect(lines[0][1]).toEqual({
          value: 'data-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'data-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      it('tokenizes x- prefixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<x-ng-include src=""></x-ng-include>');
        expect(lines[0][1]).toEqual({
          value: 'x-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'x-ng-include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      it('tokenizes _ suffixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<ng_include src=""></ng_include>');
        expect(lines[0][1]).toEqual({
          value: 'ng_include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'ng_include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
      return it('tokenizes : suffixed angular element', function() {
        var lines;
        lines = grammar.tokenizeLines('<ng:include src=""></ng:include>');
        expect(lines[0][1]).toEqual({
          value: 'ng:include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: 'ng:include',
          scopes: ['text.html.angular', 'meta.tag.block.any.html', 'entity.name.tag.block.any.html.angular']
        });
      });
    });
    describe('angular expression', function() {
      it('tokenizes angular expressions in HTML tags', function() {
        var lines;
        lines = grammar.tokenizeLines('<dd>{{phone.camera.primary}}</dd>');
        expect(lines[0][3]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[0][4]).toEqual({
          value: 'phone.camera.primary',
          scopes: ['text.html.angular', 'meta.tag.template.angular']
        });
        return expect(lines[0][5]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
      });
      it('tokenizes angular expressions in value of attributes with double quoted', function() {
        var lines;
        lines = grammar.tokenizeLines('<li ng-repeat="phone in phones | filter:query | orderBy:orderProp"></li>');
        expect(lines[0][5]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][6]).toEqual({
          value: 'phone in phones | filter:query | orderBy:orderProp',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular']
        });
        return expect(lines[0][7]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.end.html.angular']
        });
      });
      it('tokenizes angular expressions in value of attributes with single quoted', function() {
        var lines;
        lines = grammar.tokenizeLines('<li ng-repeat=\'img in phone.images\'>');
        expect(lines[0][5]).toEqual({
          value: '\'',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.single.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][6]).toEqual({
          value: 'img in phone.images',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.single.html.angular']
        });
        return expect(lines[0][7]).toEqual({
          value: '\'',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.single.html.angular', 'punctuation.definition.string.end.html.angular']
        });
      });
      return it('tokenizes angular expressions in value of attributes with {{}}', function() {
        var lines;
        lines = grammar.tokenizeLines('<img ng-src="{{img}}" ng-click="{{setImage(img)}}">');
        expect(lines[0][5]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][6]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[0][7]).toEqual({
          value: 'img',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular']
        });
        expect(lines[0][8]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
        expect(lines[0][9]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.end.html.angular']
        });
        expect(lines[0][13]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.begin.html.angular']
        });
        expect(lines[0][14]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[0][15]).toEqual({
          value: 'setImage(img)',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular']
        });
        expect(lines[0][16]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
        return expect(lines[0][17]).toEqual({
          value: '"',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'meta.attribute.html.angular', 'string.quoted.double.html.angular', 'punctuation.definition.string.end.html.angular']
        });
      });
    });
    return describe('angular ng-template', function() {
      return it('tokenizes contents inside ng-template', function() {
        var lines;
        lines = grammar.tokenizeLines('<script type="text/ng-template" id="/tpl.html">\n  <li>First name: {{firstname}}</li>\n</script>');
        expect(lines[1][1]).toEqual({
          value: '<',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'punctuation.definition.tag.begin.html']
        });
        expect(lines[1][2]).toEqual({
          value: 'li',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'entity.name.tag.inline.any.html']
        });
        expect(lines[1][3]).toEqual({
          value: '>',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'punctuation.definition.tag.end.html']
        });
        expect(lines[1][5]).toEqual({
          value: '{{',
          scopes: ['text.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.begin.angular']
        });
        expect(lines[1][6]).toEqual({
          value: 'firstname',
          scopes: ['text.html.angular', 'meta.tag.template.angular']
        });
        expect(lines[1][7]).toEqual({
          value: '}}',
          scopes: ['text.html.angular', 'meta.tag.template.angular', 'punctuation.definition.block.end.angular']
        });
        expect(lines[1][8]).toEqual({
          value: '</',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'punctuation.definition.tag.begin.html']
        });
        expect(lines[1][9]).toEqual({
          value: 'li',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'entity.name.tag.inline.any.html']
        });
        return expect(lines[1][10]).toEqual({
          value: '>',
          scopes: ['text.html.angular', 'meta.tag.inline.any.html', 'punctuation.definition.tag.end.html']
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9lZjhsai8uYXRvbS9wYWNrYWdlcy9hbmd1bGFyanMvc3BlYy9ncmFtbWFyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7QUFDNUIsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUVWLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCO01BRGMsQ0FBaEI7YUFHQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLG1CQUFsQztNQURQLENBQUw7SUFKUyxDQUFYO0lBT0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7TUFDdkIsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFVBQWhCLENBQUE7YUFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQWYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixtQkFBL0I7SUFGdUIsQ0FBekI7SUFJQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtNQUMvQixFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQTtBQUM5QyxZQUFBO1FBQUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxhQUFSLENBQXNCLDBFQUF0QjtlQUlSLE1BQUEsQ0FBTyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFoQixDQUFtQixDQUFDLE9BQXBCLENBQTRCO1VBQUEsS0FBQSxFQUFPLFdBQVA7VUFBb0IsTUFBQSxFQUFRLENBQUMsbUJBQUQsRUFBc0IseUJBQXRCLEVBQWlELDZCQUFqRCxFQUFnRiwyQ0FBaEYsQ0FBNUI7U0FBNUI7TUFMOEMsQ0FBaEQ7TUFPQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQTtBQUN6RCxZQUFBO1FBQUEsS0FB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QUF0QixDQUE1QjtTQUE1QjtRQUNBLE1BQUEsQ0FBTyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFoQixDQUFtQixDQUFDLE9BQXBCLENBQTRCO1VBQUEsS0FBQSxFQUFPLElBQVA7VUFBYSxNQUFBLEVBQVEsQ0FBQyxtQkFBRCxFQUFzQiwyQkFBdEIsRUFBbUQsMENBQW5ELENBQXJCO1NBQTVCO1FBQ0EsTUFBQSxDQUFPLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWhCLENBQW1CLENBQUMsT0FBcEIsQ0FBNEI7VUFBQSxLQUFBLEVBQU8sSUFBUDtVQUFhLE1BQUEsRUFBUSxDQUFDLG1CQUFELEVBQXNCLDBCQUF0QixFQUFrRCx1Q0FBbEQsQ0FBckI7U0FBNUI7UUFDQSxNQUFBLENBQU8sS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBaEIsQ0FBbUIsQ0FBQyxPQUFwQixDQUE0QjtVQUFBLEtBQUEsRUFBTyxJQUFQO1VBQWEsTUFBQSxFQUFRLENBQUMsbUJBQUQsRUFBc0IsMEJBQXRCLEVBQWtELGlDQUFsRCxDQUFyQjtTQUE1QjtlQUNBLE1BQUEsQ0FBTyxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsRUFBQSxDQUFoQixDQUFvQixDQUFDLE9BQXJCLENBQTZCO1VBQUEsS0FBQSxFQUFPLEdBQVA7VUFBWSxNQUFBLEVBQVEsQ0FBQyxtQkFBRCxFQUFzQiwwQkFBdEIsRUFBa0QscUNBQWxELENBQXBCO1NBQTdCO01BZjBDLENBQTVDO0lBRDhCLENBQWhDO0VBdE00QixDQUE5QjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZGVzY3JpYmUgJ2RpcmVjdGl2ZSBncmFtbWFyJywgLT5cbiAgZ3JhbW1hciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYW5ndWxhcmpzJylcblxuICAgIHJ1bnMgLT5cbiAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3RleHQuaHRtbC5hbmd1bGFyJylcblxuICBpdCAncGFyc2VzIHRoZSBncmFtbWFyJywgLT5cbiAgICBleHBlY3QoZ3JhbW1hcikudG9CZVRydXRoeSgpXG4gICAgZXhwZWN0KGdyYW1tYXIuc2NvcGVOYW1lKS50b0JlICd0ZXh0Lmh0bWwuYW5ndWxhcidcblxuICBkZXNjcmliZSAnZGlyZWN0aXZlIGF0dHJpYnV0ZXMnLCAtPlxuICAgIGl0ICd0b2tlbml6ZXMgbmctcmVwZWF0IGF0dHJpYnV0ZSBpbnNpZGUgSFRNTCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPGRkIG5nLXJlcGVhdD1cImF2YWlsYWJpbGl0eSBpbiBwaG9uZS5hdmFpbGFiaWxpdHlcIj57e2F2YWlsYWJpbGl0eX19PC9kZD5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bM10pLnRvRXF1YWwgdmFsdWU6ICduZy1yZXBlYXQnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgbmctc3JjIGFuZCBuZy1jbGljayBhdHRyaWJ1dGVzIGluc2lkZSBIVE1MJywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8bGkgbmctcmVwZWF0PVwiaW1nIGluIHBob25lLmltYWdlc1wiPlxuICAgICAgICAgIDxpbWcgbmctc3JjPVwie3tpbWd9fVwiIG5nLWNsaWNrPVwic2V0SW1hZ2UoaW1nKVwiPlxuICAgICAgICA8L2xpPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVszXSkudG9FcXVhbCB2YWx1ZTogJ25nLXJlcGVhdCcsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1sxXVs0XSkudG9FcXVhbCB2YWx1ZTogJ25nLXNyYycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1sxXVsxMl0pLnRvRXF1YWwgdmFsdWU6ICduZy1jbGljaycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgbmctdmlldyBhdHRyaWJ1dGUgd2l0aG91dCB2YWx1ZSBpbnNpZGUgSFRNTCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPGRpdiBuZy12aWV3IGNsYXNzPVwidmlldy1mcmFtZVwiPjwvZGl2PlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVszXSkudG9FcXVhbCB2YWx1ZTogJ25nLXZpZXcnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgY2FwaXRhbGl6ZWQgbmctcmVwZWF0IGF0dHJpYnV0ZSBpbnNpZGUgSFRNTCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPGRkIE5HLVJFUEVBVD1cImF2YWlsYWJpbGl0eSBpbiBwaG9uZS5hdmFpbGFiaWxpdHlcIj57e2F2YWlsYWJpbGl0eX19PC9kZD5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bM10pLnRvRXF1YWwgdmFsdWU6ICdORy1SRVBFQVQnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgbmctcmVwZWF0LXN0YXJ0IGFuZCBuZy1yZXBlYXQtZW5kIGF0dHJpYnV0ZScsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPGRpdiBuZy1yZXBlYXQtc3RhcnQ+PC9kaXY+XG4gICAgICAgIDxkaXYgbmctcmVwZWF0LWVuZD48L2Rpdj5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bM10pLnRvRXF1YWwgdmFsdWU6ICduZy1yZXBlYXQtc3RhcnQnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1sxXVszXSkudG9FcXVhbCB2YWx1ZTogJ25nLXJlcGVhdC1lbmQnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgbmctY29udHJvbGxlciBhdHRyaWJ1dGUgaW4gYm9keSB0YWcnLCAtPlxuICAgICAgbGluZXMgPSBncmFtbWFyLnRva2VuaXplTGluZXMgJycnXG4gICAgICAgIDxib2R5IG5nLWNvbnRyb2xsZXI9XCJUZXN0Q3RybFwiPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVszXSkudG9FcXVhbCB2YWx1ZTogJ25nLWNvbnRyb2xsZXInLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdXBwb3J0Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmh0bWwuYW5ndWxhciddXG5cbiAgICBpdCAndG9rZW5pemVzIG5nLXMgYXR0cmlidXRlJywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8c2VsZWN0IG5nLW9wdGlvbnM9XCJjb2xvci5uYW1lIGdyb3VwIGJ5IGNvbG9yLnNoYWRlIGZvciBjb2xvciBpbiBjb2xvcnNcIj5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bM10pLnRvRXF1YWwgdmFsdWU6ICduZy1vcHRpb25zJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3VwcG9ydC5vdGhlci5hdHRyaWJ1dGUtbmFtZS5odG1sLmFuZ3VsYXInXVxuXG4gICAgaXQgJ3Rva2VuaXplcyBuZy0gYXR0cmlidXRlcyBmb3IgYW5jaG9yIHRhZ3MnLCAtPlxuICAgICAgbGluZXMgPSBncmFtbWFyLnRva2VuaXplTGluZXMgJycnXG4gICAgICAgIDxhIGhyZWY9XCIvdXJsXCIgbmctY2xpY2s9J3t7c2V0SW1hZ2UoaW1nKX19Jz5cbiAgICAgICcnJ1xuICAgICAgZXhwZWN0KGxpbmVzWzBdWzldKS50b0VxdWFsIHZhbHVlOiAnbmctY2xpY2snLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdXBwb3J0Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmh0bWwuYW5ndWxhciddXG5cbiAgZGVzY3JpYmUgJ2RpcmVjdGl2ZSBlbGVtZW50JywgLT5cbiAgICBpdCAndG9rZW5pemVzIG5nLWluY2x1ZGUgZWxlbWVudCBpbnNpZGUgSFRNTCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPG5nLWluY2x1ZGUgc3JjPVwiXCI+PC9uZy1pbmNsdWRlPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVsxXSkudG9FcXVhbCB2YWx1ZTogJ25nLWluY2x1ZGUnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnZW50aXR5Lm5hbWUudGFnLmJsb2NrLmFueS5odG1sLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnbmctaW5jbHVkZScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5ibG9jay5hbnkuaHRtbCcsICdlbnRpdHkubmFtZS50YWcuYmxvY2suYW55Lmh0bWwuYW5ndWxhciddXG5cbiAgICBpdCAndG9rZW5pemVzIGNhcGl0YWxpemVkIG5nLWluY2x1ZGUgZWxlbWVudCBpbnNpZGUgSFRNTCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPE5HLUlOQ0xVREUgc3JjPVwiXCI+PC9ORy1JTkNMVURFPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVsxXSkudG9FcXVhbCB2YWx1ZTogJ05HLUlOQ0xVREUnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnZW50aXR5Lm5hbWUudGFnLmJsb2NrLmFueS5odG1sLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnTkctSU5DTFVERScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5ibG9jay5hbnkuaHRtbCcsICdlbnRpdHkubmFtZS50YWcuYmxvY2suYW55Lmh0bWwuYW5ndWxhciddXG5cbiAgZGVzY3JpYmUgJ25vcm1hbGl6YXRpb24gYW5ndWxhciB0YWcgYW5kIGF0dHJpYnV0ZScsIC0+XG4gICAgaXQgJ3Rva2VuaXplcyBkYXRhLSBwcmVmaXhlZCBhbmd1bGFyIGF0dHJpYnV0ZXMnLCAtPlxuICAgICAgbGluZXMgPSBncmFtbWFyLnRva2VuaXplTGluZXMgJycnXG4gICAgICAgIDxib2R5IGRhdGEtbmctY29udHJvbGxlcj1cIlRlc3RDdHJsXCI+XG4gICAgICAnJydcblxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzNdKS50b0VxdWFsIHZhbHVlOiAnZGF0YS1uZy1jb250cm9sbGVyJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3VwcG9ydC5vdGhlci5hdHRyaWJ1dGUtbmFtZS5odG1sLmFuZ3VsYXInXVxuXG4gICAgaXQgJ3Rva2VuaXplcyB4LSBwcmVmaXhlZCBhbmd1bGFyIGF0dHJpYnV0ZXMnLCAtPlxuICAgICAgbGluZXMgPSBncmFtbWFyLnRva2VuaXplTGluZXMgJycnXG4gICAgICAgIDxib2R5IHgtbmctY29udHJvbGxlcj1cIlRlc3RDdHJsXCI+XG4gICAgICAnJydcblxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzNdKS50b0VxdWFsIHZhbHVlOiAneC1uZy1jb250cm9sbGVyJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3VwcG9ydC5vdGhlci5hdHRyaWJ1dGUtbmFtZS5odG1sLmFuZ3VsYXInXVxuXG4gICAgaXQgJ3Rva2VuaXplcyBfIHN1ZmZpeGVkIGFuZ3VsYXIgYXR0cmlidXRlcycsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPGJvZHkgbmdfY29udHJvbGxlcj1cIlRlc3RDdHJsXCI+XG4gICAgICAnJydcblxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzNdKS50b0VxdWFsIHZhbHVlOiAnbmdfY29udHJvbGxlcicsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N1cHBvcnQub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgOiBzdWZmaXhlZCBhbmd1bGFyIGF0dHJpYnV0ZXMnLCAtPlxuICAgICAgbGluZXMgPSBncmFtbWFyLnRva2VuaXplTGluZXMgJycnXG4gICAgICAgIDxib2R5IG5nOmNvbnRyb2xsZXI9XCJUZXN0Q3RybFwiPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVszXSkudG9FcXVhbCB2YWx1ZTogJ25nOmNvbnRyb2xsZXInLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdXBwb3J0Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLmh0bWwuYW5ndWxhciddXG5cbiAgICBpdCAndG9rZW5pemVzIGRhdGEtIHByZWZpeGVkIGFuZ3VsYXIgZWxlbWVudCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPGRhdGEtbmctaW5jbHVkZSBzcmM9XCJcIj48L2RhdGEtbmctaW5jbHVkZT5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bMV0pLnRvRXF1YWwgdmFsdWU6ICdkYXRhLW5nLWluY2x1ZGUnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnZW50aXR5Lm5hbWUudGFnLmJsb2NrLmFueS5odG1sLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnZGF0YS1uZy1pbmNsdWRlJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmJsb2NrLmFueS5odG1sJywgJ2VudGl0eS5uYW1lLnRhZy5ibG9jay5hbnkuaHRtbC5hbmd1bGFyJ11cblxuICAgIGl0ICd0b2tlbml6ZXMgeC0gcHJlZml4ZWQgYW5ndWxhciBlbGVtZW50JywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8eC1uZy1pbmNsdWRlIHNyYz1cIlwiPjwveC1uZy1pbmNsdWRlPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVsxXSkudG9FcXVhbCB2YWx1ZTogJ3gtbmctaW5jbHVkZScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5ibG9jay5hbnkuaHRtbCcsICdlbnRpdHkubmFtZS50YWcuYmxvY2suYW55Lmh0bWwuYW5ndWxhciddXG4gICAgICBleHBlY3QobGluZXNbMF1bNV0pLnRvRXF1YWwgdmFsdWU6ICd4LW5nLWluY2x1ZGUnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnZW50aXR5Lm5hbWUudGFnLmJsb2NrLmFueS5odG1sLmFuZ3VsYXInXVxuXG4gICAgaXQgJ3Rva2VuaXplcyBfIHN1ZmZpeGVkIGFuZ3VsYXIgZWxlbWVudCcsIC0+XG4gICAgICBsaW5lcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lcyAnJydcbiAgICAgICAgPG5nX2luY2x1ZGUgc3JjPVwiXCI+PC9uZ19pbmNsdWRlPlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1swXVsxXSkudG9FcXVhbCB2YWx1ZTogJ25nX2luY2x1ZGUnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnLCAnZW50aXR5Lm5hbWUudGFnLmJsb2NrLmFueS5odG1sLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnbmdfaW5jbHVkZScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5ibG9jay5hbnkuaHRtbCcsICdlbnRpdHkubmFtZS50YWcuYmxvY2suYW55Lmh0bWwuYW5ndWxhciddXG5cbiAgICBpdCAndG9rZW5pemVzIDogc3VmZml4ZWQgYW5ndWxhciBlbGVtZW50JywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8bmc6aW5jbHVkZSBzcmM9XCJcIj48L25nOmluY2x1ZGU+XG4gICAgICAnJydcblxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzFdKS50b0VxdWFsIHZhbHVlOiAnbmc6aW5jbHVkZScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5ibG9jay5hbnkuaHRtbCcsICdlbnRpdHkubmFtZS50YWcuYmxvY2suYW55Lmh0bWwuYW5ndWxhciddXG4gICAgICBleHBlY3QobGluZXNbMF1bNV0pLnRvRXF1YWwgdmFsdWU6ICduZzppbmNsdWRlJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmJsb2NrLmFueS5odG1sJywgJ2VudGl0eS5uYW1lLnRhZy5ibG9jay5hbnkuaHRtbC5hbmd1bGFyJ11cblxuICBkZXNjcmliZSAnYW5ndWxhciBleHByZXNzaW9uJywgLT5cbiAgICBpdCAndG9rZW5pemVzIGFuZ3VsYXIgZXhwcmVzc2lvbnMgaW4gSFRNTCB0YWdzJywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8ZGQ+e3twaG9uZS5jYW1lcmEucHJpbWFyeX19PC9kZD5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bM10pLnRvRXF1YWwgdmFsdWU6ICd7eycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy50ZW1wbGF0ZS5hbmd1bGFyJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uYmxvY2suYmVnaW4uYW5ndWxhciddXG4gICAgICBleHBlY3QobGluZXNbMF1bNF0pLnRvRXF1YWwgdmFsdWU6ICdwaG9uZS5jYW1lcmEucHJpbWFyeScsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy50ZW1wbGF0ZS5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs1XSkudG9FcXVhbCB2YWx1ZTogJ319Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5lbmQuYW5ndWxhciddXG5cbiAgICBpdCAndG9rZW5pemVzIGFuZ3VsYXIgZXhwcmVzc2lvbnMgaW4gdmFsdWUgb2YgYXR0cmlidXRlcyB3aXRoIGRvdWJsZSBxdW90ZWQnLCAtPlxuICAgICAgbGluZXMgPSBncmFtbWFyLnRva2VuaXplTGluZXMgJycnXG4gICAgICAgIDxsaSBuZy1yZXBlYXQ9XCJwaG9uZSBpbiBwaG9uZXMgfCBmaWx0ZXI6cXVlcnkgfCBvcmRlckJ5Om9yZGVyUHJvcFwiPjwvbGk+XG4gICAgICAnJydcblxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnXCInLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5odG1sLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs2XSkudG9FcXVhbCB2YWx1ZTogJ3Bob25lIGluIHBob25lcyB8IGZpbHRlcjpxdWVyeSB8IG9yZGVyQnk6b3JkZXJQcm9wJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs3XSkudG9FcXVhbCB2YWx1ZTogJ1wiJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5odG1sLmFuZ3VsYXInXVxuXG4gICAgaXQgJ3Rva2VuaXplcyBhbmd1bGFyIGV4cHJlc3Npb25zIGluIHZhbHVlIG9mIGF0dHJpYnV0ZXMgd2l0aCBzaW5nbGUgcXVvdGVkJywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8bGkgbmctcmVwZWF0PSdpbWcgaW4gcGhvbmUuaW1hZ2VzJz5cbiAgICAgICcnJ1xuXG4gICAgICBleHBlY3QobGluZXNbMF1bNV0pLnRvRXF1YWwgdmFsdWU6ICdcXCcnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5odG1sLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs2XSkudG9FcXVhbCB2YWx1ZTogJ2ltZyBpbiBwaG9uZS5pbWFnZXMnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdHJpbmcucXVvdGVkLnNpbmdsZS5odG1sLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzddKS50b0VxdWFsIHZhbHVlOiAnXFwnJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5zaW5nbGUuaHRtbC5hbmd1bGFyJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24uc3RyaW5nLmVuZC5odG1sLmFuZ3VsYXInXVxuXG4gICAgaXQgJ3Rva2VuaXplcyBhbmd1bGFyIGV4cHJlc3Npb25zIGluIHZhbHVlIG9mIGF0dHJpYnV0ZXMgd2l0aCB7e319JywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8aW1nIG5nLXNyYz1cInt7aW1nfX1cIiBuZy1jbGljaz1cInt7c2V0SW1hZ2UoaW1nKX19XCI+XG4gICAgICAnJydcblxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzVdKS50b0VxdWFsIHZhbHVlOiAnXCInLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5odG1sLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuYmVnaW4uaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs2XSkudG9FcXVhbCB2YWx1ZTogJ3t7Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5iZWdpbi5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs3XSkudG9FcXVhbCB2YWx1ZTogJ2ltZycsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy50ZW1wbGF0ZS5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVs4XSkudG9FcXVhbCB2YWx1ZTogJ319Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5lbmQuYW5ndWxhciddXG4gICAgICBleHBlY3QobGluZXNbMF1bOV0pLnRvRXF1YWwgdmFsdWU6ICdcIicsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmh0bWwuYW5ndWxhcicsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5lbmQuaHRtbC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVsxM10pLnRvRXF1YWwgdmFsdWU6ICdcIicsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAnbWV0YS5hdHRyaWJ1dGUuaHRtbC5hbmd1bGFyJywgJ3N0cmluZy5xdW90ZWQuZG91YmxlLmh0bWwuYW5ndWxhcicsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5odG1sLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzE0XSkudG9FcXVhbCB2YWx1ZTogJ3t7Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5iZWdpbi5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1swXVsxNV0pLnRvRXF1YWwgdmFsdWU6ICdzZXRJbWFnZShpbWcpJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzBdWzE2XSkudG9FcXVhbCB2YWx1ZTogJ319Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdtZXRhLmF0dHJpYnV0ZS5odG1sLmFuZ3VsYXInLCAnc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5ibG9jay5lbmQuYW5ndWxhciddXG4gICAgICBleHBlY3QobGluZXNbMF1bMTddKS50b0VxdWFsIHZhbHVlOiAnXCInLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ21ldGEuYXR0cmlidXRlLmh0bWwuYW5ndWxhcicsICdzdHJpbmcucXVvdGVkLmRvdWJsZS5odG1sLmFuZ3VsYXInLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLmh0bWwuYW5ndWxhciddXG5cbiAgZGVzY3JpYmUgJ2FuZ3VsYXIgbmctdGVtcGxhdGUnLCAtPlxuICAgIGl0ICd0b2tlbml6ZXMgY29udGVudHMgaW5zaWRlIG5nLXRlbXBsYXRlJywgLT5cbiAgICAgIGxpbmVzID0gZ3JhbW1hci50b2tlbml6ZUxpbmVzICcnJ1xuICAgICAgICA8c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCIvdHBsLmh0bWxcIj5cbiAgICAgICAgICA8bGk+Rmlyc3QgbmFtZToge3tmaXJzdG5hbWV9fTwvbGk+XG4gICAgICAgIDwvc2NyaXB0PlxuICAgICAgJycnXG5cbiAgICAgIGV4cGVjdChsaW5lc1sxXVsxXSkudG9FcXVhbCB2YWx1ZTogJzwnLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ3B1bmN0dWF0aW9uLmRlZmluaXRpb24udGFnLmJlZ2luLmh0bWwnXVxuICAgICAgZXhwZWN0KGxpbmVzWzFdWzJdKS50b0VxdWFsIHZhbHVlOiAnbGknLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcuaW5saW5lLmFueS5odG1sJywgJ2VudGl0eS5uYW1lLnRhZy5pbmxpbmUuYW55Lmh0bWwnXVxuICAgICAgZXhwZWN0KGxpbmVzWzFdWzNdKS50b0VxdWFsIHZhbHVlOiAnPicsIHNjb3BlczogWyd0ZXh0Lmh0bWwuYW5ndWxhcicsICdtZXRhLnRhZy5pbmxpbmUuYW55Lmh0bWwnLCAncHVuY3R1YXRpb24uZGVmaW5pdGlvbi50YWcuZW5kLmh0bWwnXVxuICAgICAgZXhwZWN0KGxpbmVzWzFdWzVdKS50b0VxdWFsIHZhbHVlOiAne3snLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcudGVtcGxhdGUuYW5ndWxhcicsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmJsb2NrLmJlZ2luLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzFdWzZdKS50b0VxdWFsIHZhbHVlOiAnZmlyc3RuYW1lJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLnRlbXBsYXRlLmFuZ3VsYXInXVxuICAgICAgZXhwZWN0KGxpbmVzWzFdWzddKS50b0VxdWFsIHZhbHVlOiAnfX0nLCBzY29wZXM6IFsndGV4dC5odG1sLmFuZ3VsYXInLCAnbWV0YS50YWcudGVtcGxhdGUuYW5ndWxhcicsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmJsb2NrLmVuZC5hbmd1bGFyJ11cbiAgICAgIGV4cGVjdChsaW5lc1sxXVs4XSkudG9FcXVhbCB2YWx1ZTogJzwvJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnRhZy5iZWdpbi5odG1sJ11cbiAgICAgIGV4cGVjdChsaW5lc1sxXVs5XSkudG9FcXVhbCB2YWx1ZTogJ2xpJywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdlbnRpdHkubmFtZS50YWcuaW5saW5lLmFueS5odG1sJ11cbiAgICAgIGV4cGVjdChsaW5lc1sxXVsxMF0pLnRvRXF1YWwgdmFsdWU6ICc+Jywgc2NvcGVzOiBbJ3RleHQuaHRtbC5hbmd1bGFyJywgJ21ldGEudGFnLmlubGluZS5hbnkuaHRtbCcsICdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnRhZy5lbmQuaHRtbCddXG4iXX0=
