Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getEnv = getEnv;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _consistentEnv = require('consistent-env');

var _consistentEnv2 = _interopRequireDefault(_consistentEnv);

'use babel';

var _atomLinter = require('atom-linter');

Object.defineProperty(exports, 'tempFile', {
  enumerable: true,
  get: function get() {
    return _atomLinter.tempFile;
  }
});

function getEnv() {
  return (0, _consistentEnv2['default'])();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYWVsZW4vLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXN3aWZ0L2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7NkJBRTJCLGdCQUFnQjs7OztBQUYzQyxXQUFXLENBQUE7OzBCQUdZLGFBQWE7Ozs7O3VCQUE1QixRQUFROzs7O0FBQ1QsU0FBUyxNQUFNLEdBQUc7QUFDdkIsU0FBTyxpQ0FBZ0IsQ0FBQTtDQUN4QiIsImZpbGUiOiIvVXNlcnMvZ2FlbGVuLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1zd2lmdC9saWIvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBnZXRFbnZpcm9ubWVudCBmcm9tICdjb25zaXN0ZW50LWVudidcbmV4cG9ydCB7dGVtcEZpbGV9IGZyb20gJ2F0b20tbGludGVyJ1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudigpIHtcbiAgcmV0dXJuIGdldEVudmlyb25tZW50KClcbn1cbiJdfQ==