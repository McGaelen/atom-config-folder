Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.startWorker = startWorker;
exports.terminateWorker = terminateWorker;
exports.changeConfig = changeConfig;
exports.requestJob = requestJob;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cryptoRandomString = require('crypto-random-string');

var _cryptoRandomString2 = _interopRequireDefault(_cryptoRandomString);

'use babel';

var workerInstance = undefined;

function startWorker(worker, config) {
  if (workerInstance !== worker) {
    workerInstance = worker;
    workerInstance.start(config);
  }
}

function terminateWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

function changeConfig(key, value) {
  if (workerInstance) {
    workerInstance.send({
      messageType: 'config',
      message: { key: key, value: value }
    });
  }
}

function requestJob(jobType, textEditor) {
  var emitKey = (0, _cryptoRandomString2['default'])(10);

  return new Promise(function (resolve, reject) {
    var errSub = workerInstance.on('task:error', function () {
      // Re-throw errors from the task
      var error = new Error(arguments[0]);
      // Set the stack to the one given to us by the worker
      error.stack = arguments[1];
      reject(error);
    });

    var responseSub = workerInstance.on(emitKey, function (data) {
      errSub.dispose();
      responseSub.dispose();
      resolve(data);
    });

    try {
      workerInstance.send({
        messageType: 'job',
        message: {
          emitKey: emitKey,
          jobType: jobType,
          content: textEditor.getText(),
          filePath: textEditor.getPath()
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvZWY4bGovLmF0b20vcGFja2FnZXMvbGludGVyLXRzbGludC9saWIvd29ya2VySGVscGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7a0NBRStCLHNCQUFzQjs7OztBQUZyRCxXQUFXLENBQUM7O0FBSVosSUFBSSxjQUFjLFlBQUEsQ0FBQzs7QUFFWixTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQzFDLE1BQUksY0FBYyxLQUFLLE1BQU0sRUFBRTtBQUM3QixrQkFBYyxHQUFHLE1BQU0sQ0FBQztBQUN4QixrQkFBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM5QjtDQUNGOztBQUVNLFNBQVMsZUFBZSxHQUFHO0FBQ2hDLE1BQUksY0FBYyxFQUFFO0FBQ2xCLGtCQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDM0Isa0JBQWMsR0FBRyxJQUFJLENBQUM7R0FDdkI7Q0FDRjs7QUFFTSxTQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3ZDLE1BQUksY0FBYyxFQUFFO0FBQ2xCLGtCQUFjLENBQUMsSUFBSSxDQUFDO0FBQ2xCLGlCQUFXLEVBQUUsUUFBUTtBQUNyQixhQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUU7S0FDeEIsQ0FBQyxDQUFDO0dBQ0o7Q0FDRjs7QUFFTSxTQUFTLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFO0FBQzlDLE1BQU0sT0FBTyxHQUFHLHFDQUFtQixFQUFFLENBQUMsQ0FBQzs7QUFFdkMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsUUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWTs7QUFFekQsVUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVoQyxXQUFLLENBQUMsS0FBSyxHQUFHLFVBQUksQ0FBQyxDQUFDLENBQUM7QUFDckIsWUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2YsQ0FBQyxDQUFDOztBQUVILFFBQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ3ZELFlBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNqQixpQkFBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3RCLGFBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNmLENBQUMsQ0FBQzs7QUFFSCxRQUFJO0FBQ0Ysb0JBQWMsQ0FBQyxJQUFJLENBQUM7QUFDbEIsbUJBQVcsRUFBRSxLQUFLO0FBQ2xCLGVBQU8sRUFBRTtBQUNQLGlCQUFPLEVBQVAsT0FBTztBQUNQLGlCQUFPLEVBQVAsT0FBTztBQUNQLGlCQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRTtBQUM3QixrQkFBUSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUU7U0FDL0I7T0FDRixDQUFDLENBQUM7S0FDSixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsWUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ1g7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL2VmOGxqLy5hdG9tL3BhY2thZ2VzL2xpbnRlci10c2xpbnQvbGliL3dvcmtlckhlbHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgY3J5cHRvUmFuZG9tU3RyaW5nIGZyb20gJ2NyeXB0by1yYW5kb20tc3RyaW5nJztcblxubGV0IHdvcmtlckluc3RhbmNlO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRXb3JrZXIod29ya2VyLCBjb25maWcpIHtcbiAgaWYgKHdvcmtlckluc3RhbmNlICE9PSB3b3JrZXIpIHtcbiAgICB3b3JrZXJJbnN0YW5jZSA9IHdvcmtlcjtcbiAgICB3b3JrZXJJbnN0YW5jZS5zdGFydChjb25maWcpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXJtaW5hdGVXb3JrZXIoKSB7XG4gIGlmICh3b3JrZXJJbnN0YW5jZSkge1xuICAgIHdvcmtlckluc3RhbmNlLnRlcm1pbmF0ZSgpO1xuICAgIHdvcmtlckluc3RhbmNlID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlQ29uZmlnKGtleSwgdmFsdWUpIHtcbiAgaWYgKHdvcmtlckluc3RhbmNlKSB7XG4gICAgd29ya2VySW5zdGFuY2Uuc2VuZCh7XG4gICAgICBtZXNzYWdlVHlwZTogJ2NvbmZpZycsXG4gICAgICBtZXNzYWdlOiB7IGtleSwgdmFsdWUgfSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdEpvYihqb2JUeXBlLCB0ZXh0RWRpdG9yKSB7XG4gIGNvbnN0IGVtaXRLZXkgPSBjcnlwdG9SYW5kb21TdHJpbmcoMTApO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgZXJyU3ViID0gd29ya2VySW5zdGFuY2Uub24oJ3Rhc2s6ZXJyb3InLCAoLi4uZXJyKSA9PiB7XG4gICAgICAvLyBSZS10aHJvdyBlcnJvcnMgZnJvbSB0aGUgdGFza1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoZXJyWzBdKTtcbiAgICAgIC8vIFNldCB0aGUgc3RhY2sgdG8gdGhlIG9uZSBnaXZlbiB0byB1cyBieSB0aGUgd29ya2VyXG4gICAgICBlcnJvci5zdGFjayA9IGVyclsxXTtcbiAgICAgIHJlamVjdChlcnJvcik7XG4gICAgfSk7XG5cbiAgICBjb25zdCByZXNwb25zZVN1YiA9IHdvcmtlckluc3RhbmNlLm9uKGVtaXRLZXksIChkYXRhKSA9PiB7XG4gICAgICBlcnJTdWIuZGlzcG9zZSgpO1xuICAgICAgcmVzcG9uc2VTdWIuZGlzcG9zZSgpO1xuICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICB3b3JrZXJJbnN0YW5jZS5zZW5kKHtcbiAgICAgICAgbWVzc2FnZVR5cGU6ICdqb2InLFxuICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgZW1pdEtleSxcbiAgICAgICAgICBqb2JUeXBlLFxuICAgICAgICAgIGNvbnRlbnQ6IHRleHRFZGl0b3IuZ2V0VGV4dCgpLFxuICAgICAgICAgIGZpbGVQYXRoOiB0ZXh0RWRpdG9yLmdldFBhdGgoKSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJlamVjdChlKTtcbiAgICB9XG4gIH0pO1xufVxuIl19