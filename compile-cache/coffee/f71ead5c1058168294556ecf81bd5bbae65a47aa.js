(function() {
  var execSync, getExecPathFromGemEnv, platformHome, ref, ref1;

  execSync = require('child_process').execSync;

  platformHome = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

  getExecPathFromGemEnv = function() {
    var line, stdout;
    stdout = execSync('gem environment');
    line = stdout.toString().split(/\r?\n/).find(function(l) {
      return ~l.indexOf('EXECUTABLE DIRECTORY');
    });
    if (line) {
      return line.slice(line.indexOf(': ') + 2);
    } else {
      return void 0;
    }
  };

  module.exports = (ref = (ref1 = process.env.GEM_HOME) != null ? ref1 : getExecPathFromGemEnv()) != null ? ref : platformHome + "/.gem/ruby/2.3.0";

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcnVieS9saWIvZ2VtLWhvbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFFcEMsWUFBQSxHQUFlLE9BQU8sQ0FBQyxHQUFJLENBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBdkIsR0FBb0MsYUFBcEMsR0FBdUQsTUFBdkQ7O0VBRTNCLHFCQUFBLEdBQXdCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLE1BQUEsR0FBUyxRQUFBLENBQVMsaUJBQVQ7SUFFVCxJQUFBLEdBQU8sTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFpQixDQUFDLEtBQWxCLENBQXdCLE9BQXhCLENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLENBQUMsT0FBRixDQUFVLHNCQUFWO0lBQVIsQ0FEUjtJQUVQLElBQUcsSUFBSDthQUNFLElBQUssK0JBRFA7S0FBQSxNQUFBO2FBR0UsT0FIRjs7RUFMc0I7O0VBVXhCLE1BQU0sQ0FBQyxPQUFQLGtHQUFxRSxZQUFELEdBQWM7QUFkbEYiLCJzb3VyY2VzQ29udGVudCI6WyJleGVjU3luYyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5leGVjU3luY1xuXG5wbGF0Zm9ybUhvbWUgPSBwcm9jZXNzLmVudltpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgdGhlbiAnVVNFUlBST0ZJTEUnIGVsc2UgJ0hPTUUnXVxuXG5nZXRFeGVjUGF0aEZyb21HZW1FbnYgPSAtPlxuICBzdGRvdXQgPSBleGVjU3luYyAnZ2VtIGVudmlyb25tZW50J1xuXG4gIGxpbmUgPSBzdGRvdXQudG9TdHJpbmcoKS5zcGxpdCgvXFxyP1xcbi8pXG4gICAgICAgICAgIC5maW5kKChsKSAtPiB+bC5pbmRleE9mKCdFWEVDVVRBQkxFIERJUkVDVE9SWScpKVxuICBpZiBsaW5lXG4gICAgbGluZVtsaW5lLmluZGV4T2YoJzogJykgKyAyLi5dXG4gIGVsc2VcbiAgICB1bmRlZmluZWRcblxubW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzLmVudi5HRU1fSE9NRSA/IGdldEV4ZWNQYXRoRnJvbUdlbUVudigpID8gXCIje3BsYXRmb3JtSG9tZX0vLmdlbS9ydWJ5LzIuMy4wXCJcbiJdfQ==
