(function() {
  var execSync, gemHome, getExecPathFromGemEnv, platformHome;

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

  gemHome = function() {
    var ref;
    if (process.env.GEM_HOME) {
      return process.env.GEM_HOME + "/bin";
    } else {
      return (ref = getExecPathFromGemEnv()) != null ? ref : platformHome + "/.gem/ruby/2.3.0";
    }
  };

  module.exports = gemHome();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcnVieS9saWIvZ2VtLWhvbWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFFcEMsWUFBQSxHQUFlLE9BQU8sQ0FBQyxHQUFJLENBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBdkIsR0FBb0MsYUFBcEMsR0FBdUQsTUFBdkQ7O0VBRTNCLHFCQUFBLEdBQXdCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLE1BQUEsR0FBUyxRQUFBLENBQVMsaUJBQVQ7SUFFVCxJQUFBLEdBQU8sTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFpQixDQUFDLEtBQWxCLENBQXdCLE9BQXhCLENBQ0UsQ0FBQyxJQURILENBQ1EsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLENBQUMsT0FBRixDQUFVLHNCQUFWO0lBQVIsQ0FEUjtJQUVQLElBQUcsSUFBSDthQUNFLElBQUssK0JBRFA7S0FBQSxNQUFBO2FBR0UsT0FIRjs7RUFMc0I7O0VBVXhCLE9BQUEsR0FBVSxTQUFBO0FBQ1IsUUFBQTtJQUFBLElBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFmO2FBQ0ssT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFiLEdBQXNCLE9BRDFCO0tBQUEsTUFBQTs2REFHK0IsWUFBRCxHQUFjLG1CQUg1Qzs7RUFEUTs7RUFNVixNQUFNLENBQUMsT0FBUCxHQUFpQixPQUFBLENBQUE7QUFwQmpCIiwic291cmNlc0NvbnRlbnQiOlsiZXhlY1N5bmMgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmNcblxucGxhdGZvcm1Ib21lID0gcHJvY2Vzcy5lbnZbaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInIHRoZW4gJ1VTRVJQUk9GSUxFJyBlbHNlICdIT01FJ11cblxuZ2V0RXhlY1BhdGhGcm9tR2VtRW52ID0gLT5cbiAgc3Rkb3V0ID0gZXhlY1N5bmMgJ2dlbSBlbnZpcm9ubWVudCdcblxuICBsaW5lID0gc3Rkb3V0LnRvU3RyaW5nKCkuc3BsaXQoL1xccj9cXG4vKVxuICAgICAgICAgICAuZmluZCgobCkgLT4gfmwuaW5kZXhPZignRVhFQ1VUQUJMRSBESVJFQ1RPUlknKSlcbiAgaWYgbGluZVxuICAgIGxpbmVbbGluZS5pbmRleE9mKCc6ICcpICsgMi4uXVxuICBlbHNlXG4gICAgdW5kZWZpbmVkXG5cbmdlbUhvbWUgPSAtPlxuICBpZiBwcm9jZXNzLmVudi5HRU1fSE9NRVxuICAgIFwiI3twcm9jZXNzLmVudi5HRU1fSE9NRX0vYmluXCJcbiAgZWxzZVxuICAgIGdldEV4ZWNQYXRoRnJvbUdlbUVudigpID8gXCIje3BsYXRmb3JtSG9tZX0vLmdlbS9ydWJ5LzIuMy4wXCJcblxubW9kdWxlLmV4cG9ydHMgPSBnZW1Ib21lKClcbiJdfQ==
