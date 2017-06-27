Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _http = require('http');

var _atom = require('atom');

var _helpers = require('./helpers');

var _path = require('path');

'use babel';

var API = (function () {
  function API(configPath) {
    _classCallCheck(this, API);

    this.port = 44877;
    this.process = new _atom.BufferedProcess({
      command: 'SourceKittenDaemon',
      args: ['start', '--port', this.port, '--project', configPath],
      options: { env: (0, _helpers.getEnv)() },
      stdout: function stdout(buffer) {
        console.debug('KittenDaemon :: stdout', buffer.toString());
      },
      stderr: function stderr(buffer) {
        console.debug('KittenDaemon :: stderr', buffer.toString());
      }
    });
  }

  _createClass(API, [{
    key: 'autocomplete',
    value: function autocomplete(filePath, fileContents, characterIndex) {
      var name = (0, _path.basename)(filePath);
      var port = this.port;
      return (0, _helpers.tempFile)(name, fileContents, function (tempFile) {
        return new Promise(function (resolve, reject) {
          var data = [];
          var req = (0, _http.request)({
            hostname: '127.0.0.1',
            port: port,
            path: '/complete',
            method: 'GET',
            headers: {
              'X-Offset': characterIndex,
              'X-Path': tempFile,
              'X-File': name
            }
          }, function (res) {
            res.on('error', reject);
            res.on('data', function (chunk) {
              data.push(chunk);
            });
            res.on('end', function () {
              resolve(JSON.parse(data.join('')));
            });
          });
          req.end();
        });
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.process.kill();
    }
  }]);

  return API;
})();

exports.API = API;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYWVsZW4vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXN3aWZ0L2xpYi9hcGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRXNCLE1BQU07O29CQUNFLE1BQU07O3VCQUNMLFdBQVc7O29CQUNuQixNQUFNOztBQUw3QixXQUFXLENBQUE7O0lBT0UsR0FBRztBQUNILFdBREEsR0FBRyxDQUNGLFVBQVUsRUFBRTswQkFEYixHQUFHOztBQUVaLFFBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFBO0FBQ2pCLFFBQUksQ0FBQyxPQUFPLEdBQUcsMEJBQW9CO0FBQ2pDLGFBQU8sRUFBRSxvQkFBb0I7QUFDN0IsVUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUM7QUFDN0QsYUFBTyxFQUFFLEVBQUMsR0FBRyxFQUFFLHNCQUFRLEVBQUM7QUFDeEIsWUFBTSxFQUFFLGdCQUFTLE1BQU0sRUFBRTtBQUN2QixlQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO09BQzNEO0FBQ0QsWUFBTSxFQUFFLGdCQUFTLE1BQU0sRUFBRTtBQUN2QixlQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO09BQzNEO0tBQ0YsQ0FBQyxDQUFBO0dBQ0g7O2VBZFUsR0FBRzs7V0FlRixzQkFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRTtBQUNuRCxVQUFNLElBQUksR0FBRyxvQkFBUyxRQUFRLENBQUMsQ0FBQTtBQUMvQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0FBQ3RCLGFBQU8sdUJBQVMsSUFBSSxFQUFFLFlBQVksRUFBRSxVQUFTLFFBQVEsRUFBRTtBQUNyRCxlQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMzQyxjQUFNLElBQUksR0FBRyxFQUFFLENBQUE7QUFDZixjQUFNLEdBQUcsR0FBRyxtQkFBUTtBQUNsQixvQkFBUSxFQUFFLFdBQVc7QUFDckIsZ0JBQUksRUFBRSxJQUFJO0FBQ1YsZ0JBQUksRUFBRSxXQUFXO0FBQ2pCLGtCQUFNLEVBQUUsS0FBSztBQUNiLG1CQUFPLEVBQUU7QUFDUCx3QkFBVSxFQUFFLGNBQWM7QUFDMUIsc0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHNCQUFRLEVBQUUsSUFBSTthQUNmO1dBQ0YsRUFBRSxVQUFTLEdBQUcsRUFBRTtBQUNmLGVBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3ZCLGVBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQzdCLGtCQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ2pCLENBQUMsQ0FBQTtBQUNGLGVBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQVc7QUFDdkIscUJBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQ25DLENBQUMsQ0FBQTtXQUNILENBQUMsQ0FBQTtBQUNGLGFBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtTQUNWLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNIOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDcEI7OztTQTlDVSxHQUFHIiwiZmlsZSI6Ii9Vc2Vycy9nYWVsZW4vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXN3aWZ0L2xpYi9hcGkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge3JlcXVlc3R9IGZyb20gJ2h0dHAnXG5pbXBvcnQge0J1ZmZlcmVkUHJvY2Vzc30gZnJvbSAnYXRvbSdcbmltcG9ydCB7Z2V0RW52LCB0ZW1wRmlsZX0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGNsYXNzIEFQSSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZ1BhdGgpIHtcbiAgICB0aGlzLnBvcnQgPSA0NDg3N1xuICAgIHRoaXMucHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe1xuICAgICAgY29tbWFuZDogJ1NvdXJjZUtpdHRlbkRhZW1vbicsXG4gICAgICBhcmdzOiBbJ3N0YXJ0JywgJy0tcG9ydCcsIHRoaXMucG9ydCwgJy0tcHJvamVjdCcsIGNvbmZpZ1BhdGhdLFxuICAgICAgb3B0aW9uczoge2VudjogZ2V0RW52KCl9LFxuICAgICAgc3Rkb3V0OiBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnS2l0dGVuRGFlbW9uIDo6IHN0ZG91dCcsIGJ1ZmZlci50b1N0cmluZygpKVxuICAgICAgfSxcbiAgICAgIHN0ZGVycjogZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0tpdHRlbkRhZW1vbiA6OiBzdGRlcnInLCBidWZmZXIudG9TdHJpbmcoKSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGF1dG9jb21wbGV0ZShmaWxlUGF0aCwgZmlsZUNvbnRlbnRzLCBjaGFyYWN0ZXJJbmRleCkge1xuICAgIGNvbnN0IG5hbWUgPSBiYXNlbmFtZShmaWxlUGF0aClcbiAgICBjb25zdCBwb3J0ID0gdGhpcy5wb3J0XG4gICAgcmV0dXJuIHRlbXBGaWxlKG5hbWUsIGZpbGVDb250ZW50cywgZnVuY3Rpb24odGVtcEZpbGUpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IFtdXG4gICAgICAgIGNvbnN0IHJlcSA9IHJlcXVlc3Qoe1xuICAgICAgICAgIGhvc3RuYW1lOiAnMTI3LjAuMC4xJyxcbiAgICAgICAgICBwb3J0OiBwb3J0LFxuICAgICAgICAgIHBhdGg6ICcvY29tcGxldGUnLFxuICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1gtT2Zmc2V0JzogY2hhcmFjdGVySW5kZXgsXG4gICAgICAgICAgICAnWC1QYXRoJzogdGVtcEZpbGUsXG4gICAgICAgICAgICAnWC1GaWxlJzogbmFtZVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgcmVzLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICByZXMub24oJ2RhdGEnLCBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgICAgZGF0YS5wdXNoKGNodW5rKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmVzLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShkYXRhLmpvaW4oJycpKSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICByZXEuZW5kKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMucHJvY2Vzcy5raWxsKClcbiAgfVxufVxuIl19