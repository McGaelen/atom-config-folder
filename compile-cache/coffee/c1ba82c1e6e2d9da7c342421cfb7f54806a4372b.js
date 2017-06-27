(function() {
  var LinterCoffeeScript, coffee;

  coffee = require('coffee-script');

  LinterCoffeeScript = (function() {
    function LinterCoffeeScript() {}

    LinterCoffeeScript.prototype.grammarScopes = ['source.coffee', 'source.litcoffee', 'source.coffee.jsx'];

    LinterCoffeeScript.prototype.scope = 'file';

    LinterCoffeeScript.prototype.lintOnFly = true;

    LinterCoffeeScript.prototype.lint = function(textEditor) {
      var err, filePath, source;
      filePath = textEditor.getPath();
      source = textEditor.getText();
      try {
        coffee.compile(source);
      } catch (error) {
        err = error;
        return [
          {
            type: 'error',
            filePath: filePath,
            text: err.message,
            range: this.computeRange(err.location)
          }
        ];
      }
      return [];
    };

    LinterCoffeeScript.prototype.computeRange = function(arg) {
      var colEnd, colStart, first_column, first_line, last_column, last_line, lineEnd, lineStart;
      first_line = arg.first_line, first_column = arg.first_column, last_line = arg.last_line, last_column = arg.last_column;
      lineStart = first_line;
      lineEnd = last_line || first_line;
      colStart = first_column;
      colEnd = (last_column || last_column) + 1;
      return [[lineStart, colStart], [lineEnd, colEnd]];
    };

    return LinterCoffeeScript;

  })();

  module.exports = LinterCoffeeScript;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9lZjhsai8uYXRvbS9wYWNrYWdlcy9saW50ZXItY29mZmVlc2NyaXB0L2xpYi9saW50ZXItY29mZmVlc2NyaXB0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztFQUVIOzs7aUNBQ0osYUFBQSxHQUFlLENBQUMsZUFBRCxFQUFrQixrQkFBbEIsRUFBc0MsbUJBQXRDOztpQ0FDZixLQUFBLEdBQU87O2lDQUNQLFNBQUEsR0FBVzs7aUNBQ1gsSUFBQSxHQUFNLFNBQUMsVUFBRDtBQUNKLFVBQUE7TUFBQSxRQUFBLEdBQVcsVUFBVSxDQUFDLE9BQVgsQ0FBQTtNQUNYLE1BQUEsR0FBUyxVQUFVLENBQUMsT0FBWCxDQUFBO0FBRVQ7UUFDRSxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsRUFERjtPQUFBLGFBQUE7UUFFTTtBQUNKLGVBQU87VUFBQztZQUNOLElBQUEsRUFBTSxPQURBO1lBRU4sUUFBQSxFQUFVLFFBRko7WUFHTixJQUFBLEVBQU0sR0FBRyxDQUFDLE9BSEo7WUFJTixLQUFBLEVBQU8sSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFHLENBQUMsUUFBbEIsQ0FKRDtXQUFEO1VBSFQ7O0FBVUEsYUFBTztJQWRIOztpQ0FnQk4sWUFBQSxHQUFjLFNBQUMsR0FBRDtBQUNaLFVBQUE7TUFEYyw2QkFBWSxpQ0FBYywyQkFBVztNQUNuRCxTQUFBLEdBQVk7TUFDWixPQUFBLEdBQVUsU0FBQSxJQUFhO01BQ3ZCLFFBQUEsR0FBVztNQUNYLE1BQUEsR0FBUyxDQUFDLFdBQUEsSUFBZSxXQUFoQixDQUFBLEdBQStCO0FBRXhDLGFBQU8sQ0FBQyxDQUFDLFNBQUQsRUFBWSxRQUFaLENBQUQsRUFBd0IsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUF4QjtJQU5LOzs7Ozs7RUFRaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE5QmpCIiwic291cmNlc0NvbnRlbnQiOlsiY29mZmVlID0gcmVxdWlyZSAnY29mZmVlLXNjcmlwdCdcblxuY2xhc3MgTGludGVyQ29mZmVlU2NyaXB0XG4gIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmNvZmZlZScsICdzb3VyY2UubGl0Y29mZmVlJywgJ3NvdXJjZS5jb2ZmZWUuanN4J11cbiAgc2NvcGU6ICdmaWxlJ1xuICBsaW50T25GbHk6IHRydWVcbiAgbGludDogKHRleHRFZGl0b3IpIC0+XG4gICAgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgIHNvdXJjZSA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICB0cnlcbiAgICAgIGNvZmZlZS5jb21waWxlIHNvdXJjZVxuICAgIGNhdGNoIGVyclxuICAgICAgcmV0dXJuIFt7XG4gICAgICAgIHR5cGU6ICdlcnJvcidcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICAgIHRleHQ6IGVyci5tZXNzYWdlXG4gICAgICAgIHJhbmdlOiBAY29tcHV0ZVJhbmdlKGVyci5sb2NhdGlvbilcbiAgICAgIH1dXG5cbiAgICByZXR1cm4gW11cblxuICBjb21wdXRlUmFuZ2U6ICh7Zmlyc3RfbGluZSwgZmlyc3RfY29sdW1uLCBsYXN0X2xpbmUsIGxhc3RfY29sdW1ufSkgLT5cbiAgICBsaW5lU3RhcnQgPSBmaXJzdF9saW5lXG4gICAgbGluZUVuZCA9IGxhc3RfbGluZSB8fCBmaXJzdF9saW5lXG4gICAgY29sU3RhcnQgPSBmaXJzdF9jb2x1bW5cbiAgICBjb2xFbmQgPSAobGFzdF9jb2x1bW4gfHwgbGFzdF9jb2x1bW4pICsgMVxuXG4gICAgcmV0dXJuIFtbbGluZVN0YXJ0LCBjb2xTdGFydF0sIFtsaW5lRW5kLCBjb2xFbmRdXVxuXG5tb2R1bGUuZXhwb3J0cyA9IExpbnRlckNvZmZlZVNjcmlwdFxuIl19
