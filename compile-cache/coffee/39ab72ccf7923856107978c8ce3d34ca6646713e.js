(function() {
  var BufferedProcess, ClangFlags, addClangFlags, addCommonArgs, addDocumentationArgs, fs, getCommonArgs, makeFileBasedArgs, path, tmp;

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  fs = require('fs');

  tmp = require('tmp');

  ClangFlags = require('clang-flags');

  module.exports = {
    makeBufferedClangProcess: function(editor, args, callback, input) {
      return new Promise(function(resolve) {
        var bufferedProcess, command, errors, exit, filePath, options, outputs, ref, ref1, stderr, stdout;
        command = atom.config.get("autocomplete-clang.clangCommand");
        options = {
          cwd: path.dirname(editor.getPath())
        };
        ref = [[], []], outputs = ref[0], errors = ref[1];
        stdout = function(data) {
          return outputs.push(data);
        };
        stderr = function(data) {
          return errors.push(data);
        };
        if ((args.join(" ")).length > (atom.config.get("autocomplete-clang.argsCountThreshold") || 7000)) {
          ref1 = makeFileBasedArgs(args, editor), args = ref1[0], filePath = ref1[1];
          exit = function(code) {
            fs.unlinkSync(filePath);
            return callback(code, outputs.join('\n'), errors.join('\n'), resolve);
          };
        } else {
          exit = function(code) {
            return callback(code, outputs.join('\n'), errors.join('\n'), resolve);
          };
        }
        bufferedProcess = new BufferedProcess({
          command: command,
          args: args,
          options: options,
          stdout: stdout,
          stderr: stderr,
          exit: exit
        });
        bufferedProcess.process.stdin.setEncoding = 'utf-8';
        bufferedProcess.process.stdin.write(input);
        return bufferedProcess.process.stdin.end();
      });
    },
    buildCodeCompletionArgs: function(editor, row, column, language) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommonArgs(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-fsyntax-only");
      args.push("-x" + language);
      args.push("-Xclang", "-code-completion-macros");
      args.push("-Xclang", "-code-completion-at=-:" + (row + 1) + ":" + (column + 1));
      if (fs.existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    },
    buildGoDeclarationCommandArgs: function(editor, language, term) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommonArgs(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-fsyntax-only");
      args.push("-x" + language);
      args.push("-Xclang", "-ast-dump");
      args.push("-Xclang", "-ast-dump-filter");
      args.push("-Xclang", "" + term);
      if (fs.existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    },
    buildEmitPchCommandArgs: function(editor, language) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommonArgs(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-x" + language + "-header");
      args.push("-Xclang", "-emit-pch", "-o", pchPath);
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    }
  };

  getCommonArgs = function(editor, language) {
    var currentDir, filePath, pchFile, pchFilePrefix;
    pchFilePrefix = atom.config.get("autocomplete-clang.pchFilePrefix");
    pchFile = [pchFilePrefix, language, "pch"].join('.');
    filePath = editor.getPath();
    currentDir = path.dirname(filePath);
    return {
      std: atom.config.get("autocomplete-clang.std " + language),
      filePath: filePath,
      currentDir: currentDir,
      pchPath: path.join(currentDir, pchFile)
    };
  };

  addCommonArgs = function(args, std, currentDir, pchPath, filePath) {
    var i, j, len, ref;
    if (std) {
      args.push("-std=" + std);
    }
    ref = atom.config.get("autocomplete-clang.includePaths");
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      args.push("-I" + i);
    }
    args.push("-I" + currentDir);
    args = addDocumentationArgs(args);
    args = addClangFlags(args, filePath);
    args.push("-");
    return args;
  };

  addClangFlags = function(args, filePath) {
    var clangflags, error;
    try {
      clangflags = ClangFlags.getClangFlags(filePath);
      if (clangflags) {
        args = args.concat(clangflags);
      }
    } catch (error1) {
      error = error1;
      console.log("clang-flags error:", error);
    }
    return args;
  };

  addDocumentationArgs = function(args) {
    if (atom.config.get("autocomplete-clang.includeDocumentation")) {
      args.push("-Xclang", "-code-completion-brief-comments");
      if (atom.config.get("autocomplete-clang.includeNonDoxygenCommentsAsDocumentation")) {
        args.push("-fparse-all-comments");
      }
      if (atom.config.get("autocomplete-clang.includeSystemHeadersDocumentation")) {
        args.push("-fretain-comments-from-system-headers");
      }
    }
    return args;
  };

  makeFileBasedArgs = function(args, editor) {
    var filePath;
    args = args.join('\n');
    args = args.replace(/\\/g, "\\\\");
    args = args.replace(/\ /g, "\\\ ");
    filePath = tmp.fileSync().name;
    fs.writeFile(filePath, args, function(error) {
      if (error) {
        return console.error("Error writing file", error);
      }
    });
    args = ['@' + filePath];
    return [args, filePath];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtY2xhbmcvbGliL2NsYW5nLWFyZ3MtYnVpbGRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ04sVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSx3QkFBQSxFQUEwQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsUUFBZixFQUF5QixLQUF6QjthQUNwQixJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQ7QUFDVixZQUFBO1FBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEI7UUFDVixPQUFBLEdBQVU7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWIsQ0FBTDs7UUFDVixNQUFvQixDQUFDLEVBQUQsRUFBSyxFQUFMLENBQXBCLEVBQUMsZ0JBQUQsRUFBVTtRQUNWLE1BQUEsR0FBUyxTQUFDLElBQUQ7aUJBQVMsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiO1FBQVQ7UUFDVCxNQUFBLEdBQVMsU0FBQyxJQUFEO2lCQUFTLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtRQUFUO1FBQ1QsSUFBRyxDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixDQUFELENBQWdCLENBQUMsTUFBakIsR0FBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLENBQUEsSUFBNEQsSUFBN0QsQ0FBN0I7VUFDRSxPQUFt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QUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLE1BQXBCO0lBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixNQUFwQjtJQUNQLFFBQUEsR0FBVyxHQUFHLENBQUMsUUFBSixDQUFBLENBQWMsQ0FBQztJQUMxQixFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkIsU0FBQyxLQUFEO01BQzNCLElBQThDLEtBQTlDO2VBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxvQkFBZCxFQUFvQyxLQUFwQyxFQUFBOztJQUQyQixDQUE3QjtJQUVBLElBQUEsR0FBTyxDQUFDLEdBQUEsR0FBTSxRQUFQO1dBQ1AsQ0FBQyxJQUFELEVBQU8sUUFBUDtFQVJrQjtBQTdGcEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG50bXAgPSByZXF1aXJlICd0bXAnXG5DbGFuZ0ZsYWdzID0gcmVxdWlyZSAnY2xhbmctZmxhZ3MnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3M6IChlZGl0b3IsIGFyZ3MsIGNhbGxiYWNrLCBpbnB1dCktPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgICAgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5jbGFuZ0NvbW1hbmRcIlxuICAgICAgb3B0aW9ucyA9IGN3ZDogcGF0aC5kaXJuYW1lIGVkaXRvci5nZXRQYXRoKClcbiAgICAgIFtvdXRwdXRzLCBlcnJvcnNdID0gW1tdLCBbXV1cbiAgICAgIHN0ZG91dCA9IChkYXRhKS0+IG91dHB1dHMucHVzaCBkYXRhXG4gICAgICBzdGRlcnIgPSAoZGF0YSktPiBlcnJvcnMucHVzaCBkYXRhXG4gICAgICBpZiAoYXJncy5qb2luKFwiIFwiKSkubGVuZ3RoID4gKGF0b20uY29uZmlnLmdldChcImF1dG9jb21wbGV0ZS1jbGFuZy5hcmdzQ291bnRUaHJlc2hvbGRcIikgb3IgNzAwMClcbiAgICAgICAgW2FyZ3MsIGZpbGVQYXRoXSA9IG1ha2VGaWxlQmFzZWRBcmdzIGFyZ3MsIGVkaXRvclxuICAgICAgICBleGl0ID0gKGNvZGUpLT5cbiAgICAgICAgICBmcy51bmxpbmtTeW5jIGZpbGVQYXRoXG4gICAgICAgICAgY2FsbGJhY2sgY29kZSwgKG91dHB1dHMuam9pbiAnXFxuJyksIChlcnJvcnMuam9pbiAnXFxuJyksIHJlc29sdmVcbiAgICAgIGVsc2VcbiAgICAgICAgZXhpdCA9IChjb2RlKS0+IGNhbGxiYWNrIGNvZGUsIChvdXRwdXRzLmpvaW4gJ1xcbicpLCAoZXJyb3JzLmpvaW4gJ1xcbicpLCByZXNvbHZlXG4gICAgICBidWZmZXJlZFByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBvcHRpb25zLCBzdGRvdXQsIHN0ZGVyciwgZXhpdH0pXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5zZXRFbmNvZGluZyA9ICd1dGYtOCdcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlIGlucHV0XG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuXG4gIGJ1aWxkQ29kZUNvbXBsZXRpb25BcmdzOiAoZWRpdG9yLCByb3csIGNvbHVtbiwgbGFuZ3VhZ2UpIC0+XG4gICAge3N0ZCwgZmlsZVBhdGgsIGN1cnJlbnREaXIsIHBjaFBhdGh9ID0gZ2V0Q29tbW9uQXJncyBlZGl0b3IsbGFuZ3VhZ2VcbiAgICBhcmdzID0gW11cbiAgICBhcmdzLnB1c2ggXCItZnN5bnRheC1vbmx5XCJcbiAgICBhcmdzLnB1c2ggXCIteCN7bGFuZ3VhZ2V9XCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWNvZGUtY29tcGxldGlvbi1tYWNyb3NcIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCItY29kZS1jb21wbGV0aW9uLWF0PS06I3tyb3cgKyAxfToje2NvbHVtbiArIDF9XCJcbiAgICBhcmdzLnB1c2goXCItaW5jbHVkZS1wY2hcIiwgcGNoUGF0aCkgaWYgZnMuZXhpc3RzU3luYyhwY2hQYXRoKVxuICAgIGFkZENvbW1vbkFyZ3MgYXJncywgc3RkLCBjdXJyZW50RGlyLCBwY2hQYXRoLCBmaWxlUGF0aFxuXG4gIGJ1aWxkR29EZWNsYXJhdGlvbkNvbW1hbmRBcmdzOiAoZWRpdG9yLCBsYW5ndWFnZSwgdGVybSktPlxuICAgIHtzdGQsIGZpbGVQYXRoLCBjdXJyZW50RGlyLCBwY2hQYXRofSA9IGdldENvbW1vbkFyZ3MgZWRpdG9yLGxhbmd1YWdlXG4gICAgYXJncyA9IFtdXG4gICAgYXJncy5wdXNoIFwiLWZzeW50YXgtb25seVwiXG4gICAgYXJncy5wdXNoIFwiLXgje2xhbmd1YWdlfVwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1hc3QtZHVtcFwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1hc3QtZHVtcC1maWx0ZXJcIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCIje3Rlcm19XCJcbiAgICBhcmdzLnB1c2goXCItaW5jbHVkZS1wY2hcIiwgcGNoUGF0aCkgaWYgZnMuZXhpc3RzU3luYyhwY2hQYXRoKVxuICAgIGFkZENvbW1vbkFyZ3MgYXJncywgc3RkLCBjdXJyZW50RGlyLCBwY2hQYXRoLCBmaWxlUGF0aFxuXG4gIGJ1aWxkRW1pdFBjaENvbW1hbmRBcmdzOiAoZWRpdG9yLCBsYW5ndWFnZSktPlxuICAgIHtzdGQsIGZpbGVQYXRoLCBjdXJyZW50RGlyLCBwY2hQYXRofSA9IGdldENvbW1vbkFyZ3MgZWRpdG9yLGxhbmd1YWdlXG4gICAgYXJncyA9IFtdXG4gICAgYXJncy5wdXNoIFwiLXgje2xhbmd1YWdlfS1oZWFkZXJcIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCItZW1pdC1wY2hcIiwgXCItb1wiLCBwY2hQYXRoXG4gICAgYWRkQ29tbW9uQXJncyBhcmdzLCBzdGQsIGN1cnJlbnREaXIsIHBjaFBhdGgsIGZpbGVQYXRoXG5cbmdldENvbW1vbkFyZ3MgPSAoZWRpdG9yLCBsYW5ndWFnZSktPlxuICBwY2hGaWxlUHJlZml4ID0gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLnBjaEZpbGVQcmVmaXhcIlxuICBwY2hGaWxlID0gW3BjaEZpbGVQcmVmaXgsIGxhbmd1YWdlLCBcInBjaFwiXS5qb2luICcuJ1xuICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgY3VycmVudERpciA9IHBhdGguZGlybmFtZSBmaWxlUGF0aFxuICB7XG4gICAgc3RkOiAoYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLnN0ZCAje2xhbmd1YWdlfVwiKSxcbiAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgY3VycmVudERpcjogY3VycmVudERpcixcbiAgICBwY2hQYXRoOiAocGF0aC5qb2luIGN1cnJlbnREaXIsIHBjaEZpbGUpXG4gIH1cblxuYWRkQ29tbW9uQXJncyA9IChhcmdzLCBzdGQsIGN1cnJlbnREaXIsIHBjaFBhdGgsIGZpbGVQYXRoKS0+XG4gIGFyZ3MucHVzaCBcIi1zdGQ9I3tzdGR9XCIgaWYgc3RkXG4gIGFyZ3MucHVzaCBcIi1JI3tpfVwiIGZvciBpIGluIGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5pbmNsdWRlUGF0aHNcIlxuICBhcmdzLnB1c2ggXCItSSN7Y3VycmVudERpcn1cIlxuICBhcmdzID0gYWRkRG9jdW1lbnRhdGlvbkFyZ3MgYXJnc1xuICBhcmdzID0gYWRkQ2xhbmdGbGFncyBhcmdzLCBmaWxlUGF0aFxuICBhcmdzLnB1c2ggXCItXCJcbiAgYXJnc1xuXG5hZGRDbGFuZ0ZsYWdzID0gKGFyZ3MsIGZpbGVQYXRoKS0+XG4gIHRyeVxuICAgIGNsYW5nZmxhZ3MgPSBDbGFuZ0ZsYWdzLmdldENsYW5nRmxhZ3MoZmlsZVBhdGgpXG4gICAgYXJncyA9IGFyZ3MuY29uY2F0IGNsYW5nZmxhZ3MgaWYgY2xhbmdmbGFnc1xuICBjYXRjaCBlcnJvclxuICAgIGNvbnNvbGUubG9nIFwiY2xhbmctZmxhZ3MgZXJyb3I6XCIsIGVycm9yXG4gIGFyZ3NcblxuYWRkRG9jdW1lbnRhdGlvbkFyZ3MgPSAoYXJncyktPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZURvY3VtZW50YXRpb25cIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCItY29kZS1jb21wbGV0aW9uLWJyaWVmLWNvbW1lbnRzXCJcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZU5vbkRveHlnZW5Db21tZW50c0FzRG9jdW1lbnRhdGlvblwiXG4gICAgICBhcmdzLnB1c2ggXCItZnBhcnNlLWFsbC1jb21tZW50c1wiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVTeXN0ZW1IZWFkZXJzRG9jdW1lbnRhdGlvblwiXG4gICAgICBhcmdzLnB1c2ggXCItZnJldGFpbi1jb21tZW50cy1mcm9tLXN5c3RlbS1oZWFkZXJzXCJcbiAgYXJnc1xuXG5tYWtlRmlsZUJhc2VkQXJncyA9IChhcmdzLCBlZGl0b3IpLT5cbiAgYXJncyA9IGFyZ3Muam9pbignXFxuJylcbiAgYXJncyA9IGFyZ3MucmVwbGFjZSAvXFxcXC9nLCBcIlxcXFxcXFxcXCJcbiAgYXJncyA9IGFyZ3MucmVwbGFjZSAvXFwgL2csIFwiXFxcXFxcIFwiXG4gIGZpbGVQYXRoID0gdG1wLmZpbGVTeW5jKCkubmFtZVxuICBmcy53cml0ZUZpbGUgZmlsZVBhdGgsIGFyZ3MsIChlcnJvcikgLT5cbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igd3JpdGluZyBmaWxlXCIsIGVycm9yKSBpZiBlcnJvclxuICBhcmdzID0gWydAJyArIGZpbGVQYXRoXVxuICBbYXJncywgZmlsZVBhdGhdXG4iXX0=
