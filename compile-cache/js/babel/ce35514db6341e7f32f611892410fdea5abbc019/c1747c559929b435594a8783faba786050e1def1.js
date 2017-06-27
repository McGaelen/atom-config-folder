function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var path = _interopRequireWildcard(_path);

// NOTE: If using 'fit' you must add it to the list below!

var _jasmineFix = require('jasmine-fix');

// eslint-disable-line import/no-extraneous-dependencies

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

// Fixture paths
'use babel';

var invalidPath = path.join(__dirname, 'fixtures', 'invalid', 'invalid.ts');
var noConfigPath = path.join(__dirname, 'fixtures', 'no-config', 'noConfig.ts');
var validPath = path.join(__dirname, 'fixtures', 'valid', 'valid.ts');
var validTypecheckedPath = path.join(__dirname, 'fixtures', 'valid-typechecked', 'valid-typechecked.ts');
var invalidTypecheckedPath = path.join(__dirname, 'fixtures', 'invalid-typechecked', 'invalid-typechecked.ts');

describe('The TSLint provider for Linter', function () {
  var lint = _libMain2['default'].provideLinter().lint;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.packages.activatePackage('linter-tslint');
  }));

  describe('When the package is activated', function () {
    describe('When dealing with typechecking off (no semantic rules)', function () {
      (0, _jasmineFix.it)('finds nothing wrong with a valid file', _asyncToGenerator(function* () {
        var editor = yield atom.workspace.open(validPath);
        var result = yield lint(editor);
        expect(result.length).toBe(0);
      }));

      (0, _jasmineFix.it)('handles messages from TSLint', _asyncToGenerator(function* () {
        var expectedMsgRegEx = /Missing semicolon \(<a href=".*">semicolon<\/a>\)/;
        var editor = yield atom.workspace.open(invalidPath);
        var result = yield lint(editor);
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('warning');
        expect(expectedMsgRegEx.test(result[0].html)).toBeTruthy();
        expect(result[0].text).not.toBeDefined();
        expect(result[0].filePath).toBe(invalidPath);
        expect(result[0].range).toEqual([[0, 14], [0, 14]]);
      }));

      (0, _jasmineFix.it)('handles undefined filepath', _asyncToGenerator(function* () {
        var editor = yield atom.workspace.open();
        var result = yield lint(editor);
        expect(result).toBeNull();
      }));

      (0, _jasmineFix.it)('finishes validatation even when there is no tslint.json', _asyncToGenerator(function* () {
        var editor = yield atom.workspace.open(noConfigPath);
        yield lint(editor);
      }));
    });

    describe('When dealing with typechecking on (with semantic rules)', function () {
      (0, _jasmineFix.beforeEach)(function () {
        atom.config.set('linter-tslint.enableSemanticRules', true);
      });

      afterEach(function () {
        atom.config.set('linter-tslint.enableSemanticRules', false);
      });

      (0, _jasmineFix.it)('finds nothing wrong with a valid file', _asyncToGenerator(function* () {
        var editor = yield atom.workspace.open(validTypecheckedPath);
        var result = yield lint(editor);
        expect(result.length).toBe(0);
      }));

      (0, _jasmineFix.it)('handles messages from TSLint', _asyncToGenerator(function* () {
        var expectedMsgRegEx = /This expression is unnecessarily compared to a boolean. Just use it directly. \(<a href=".*">no-boolean-literal-compare<\/a>\)/;
        var editor = yield atom.workspace.open(invalidTypecheckedPath);
        var result = yield lint(editor);
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('error');
        expect(expectedMsgRegEx.test(result[0].html)).toBeTruthy();
        expect(result[0].text).not.toBeDefined();
        expect(result[0].filePath).toBe(invalidTypecheckedPath);
        expect(result[0].range).toEqual([[1, 0], [1, 1]]);
      }));
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvZWY4bGovLmF0b20vcGFja2FnZXMvbGludGVyLXRzbGludC9zcGVjL2xpbnRlci10c2xpbnQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRXNCLE1BQU07O0lBQWhCLElBQUk7Ozs7MEJBRWUsYUFBYTs7Ozt1QkFDbkIsYUFBYTs7Ozs7QUFMdEMsV0FBVyxDQUFDOztBQVFaLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDOUUsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNsRixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3hFLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDM0csSUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUscUJBQXFCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQzs7QUFFakgsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLFlBQU07QUFDL0MsTUFBTSxJQUFJLEdBQUcscUJBQWEsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDOztBQUUvQyxnREFBVyxhQUFZO0FBQ3JCLFVBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7R0FDdEQsRUFBQyxDQUFDOztBQUVILFVBQVEsQ0FBQywrQkFBK0IsRUFBRSxZQUFNO0FBQzlDLFlBQVEsQ0FBQyx3REFBd0QsRUFBRSxZQUFNO0FBQ3ZFLDBC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QixFQUFDLENBQUM7O0FBRUgsMEJBQUcsOEJBQThCLG9CQUFFLGFBQVk7QUFDN0MsWUFBTSxnQkFBZ0IsR0FBRyxnSUFBZ0ksQ0FBQztBQUMxSixZQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDakUsWUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckMsY0FBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMzRCxjQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN6QyxjQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELGNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ25ELEVBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL2VmOGxqLy5hdG9tL3BhY2thZ2VzL2xpbnRlci10c2xpbnQvc3BlYy9saW50ZXItdHNsaW50LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbi8vIE5PVEU6IElmIHVzaW5nICdmaXQnIHlvdSBtdXN0IGFkZCBpdCB0byB0aGUgbGlzdCBiZWxvdyFcbmltcG9ydCB7IGJlZm9yZUVhY2gsIGl0IH0gZnJvbSAnamFzbWluZS1maXgnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IGxpbnRlclRzbGludCBmcm9tICcuLi9saWIvbWFpbic7XG5cbi8vIEZpeHR1cmUgcGF0aHNcbmNvbnN0IGludmFsaWRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ2ludmFsaWQnLCAnaW52YWxpZC50cycpO1xuY29uc3Qgbm9Db25maWdQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ25vLWNvbmZpZycsICdub0NvbmZpZy50cycpO1xuY29uc3QgdmFsaWRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ3ZhbGlkJywgJ3ZhbGlkLnRzJyk7XG5jb25zdCB2YWxpZFR5cGVjaGVja2VkUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICd2YWxpZC10eXBlY2hlY2tlZCcsICd2YWxpZC10eXBlY2hlY2tlZC50cycpO1xuY29uc3QgaW52YWxpZFR5cGVjaGVja2VkUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsICdpbnZhbGlkLXR5cGVjaGVja2VkJywgJ2ludmFsaWQtdHlwZWNoZWNrZWQudHMnKTtcblxuZGVzY3JpYmUoJ1RoZSBUU0xpbnQgcHJvdmlkZXIgZm9yIExpbnRlcicsICgpID0+IHtcbiAgY29uc3QgbGludCA9IGxpbnRlclRzbGludC5wcm92aWRlTGludGVyKCkubGludDtcblxuICBiZWZvcmVFYWNoKGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLXRzbGludCcpO1xuICB9KTtcblxuICBkZXNjcmliZSgnV2hlbiB0aGUgcGFja2FnZSBpcyBhY3RpdmF0ZWQnLCAoKSA9PiB7XG4gICAgZGVzY3JpYmUoJ1doZW4gZGVhbGluZyB3aXRoIHR5cGVjaGVja2luZyBvZmYgKG5vIHNlbWFudGljIHJ1bGVzKScsICgpID0+IHtcbiAgICAgIGl0KCdmaW5kcyBub3RoaW5nIHdyb25nIHdpdGggYSB2YWxpZCBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHZhbGlkUGF0aCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGxpbnQoZWRpdG9yKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5sZW5ndGgpLnRvQmUoMCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ2hhbmRsZXMgbWVzc2FnZXMgZnJvbSBUU0xpbnQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkTXNnUmVnRXggPSAvTWlzc2luZyBzZW1pY29sb24gXFwoPGEgaHJlZj1cIi4qXCI+c2VtaWNvbG9uPFxcL2E+XFwpLztcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihpbnZhbGlkUGF0aCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGxpbnQoZWRpdG9yKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgIGV4cGVjdChyZXN1bHRbMF0udHlwZSkudG9CZSgnd2FybmluZycpO1xuICAgICAgICBleHBlY3QoZXhwZWN0ZWRNc2dSZWdFeC50ZXN0KHJlc3VsdFswXS5odG1sKSkudG9CZVRydXRoeSgpO1xuICAgICAgICBleHBlY3QocmVzdWx0WzBdLnRleHQpLm5vdC50b0JlRGVmaW5lZCgpO1xuICAgICAgICBleHBlY3QocmVzdWx0WzBdLmZpbGVQYXRoKS50b0JlKGludmFsaWRQYXRoKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdFswXS5yYW5nZSkudG9FcXVhbChbWzAsIDE0XSwgWzAsIDE0XV0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdoYW5kbGVzIHVuZGVmaW5lZCBmaWxlcGF0aCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBsaW50KGVkaXRvcik7XG4gICAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVOdWxsKCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ2ZpbmlzaGVzIHZhbGlkYXRhdGlvbiBldmVuIHdoZW4gdGhlcmUgaXMgbm8gdHNsaW50Lmpzb24nLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4obm9Db25maWdQYXRoKTtcbiAgICAgICAgYXdhaXQgbGludChlZGl0b3IpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnV2hlbiBkZWFsaW5nIHdpdGggdHlwZWNoZWNraW5nIG9uICh3aXRoIHNlbWFudGljIHJ1bGVzKScsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci10c2xpbnQuZW5hYmxlU2VtYW50aWNSdWxlcycsIHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXRzbGludC5lbmFibGVTZW1hbnRpY1J1bGVzJywgZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdmaW5kcyBub3RoaW5nIHdyb25nIHdpdGggYSB2YWxpZCBmaWxlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHZhbGlkVHlwZWNoZWNrZWRQYXRoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbGludChlZGl0b3IpO1xuICAgICAgICBleHBlY3QocmVzdWx0Lmxlbmd0aCkudG9CZSgwKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnaGFuZGxlcyBtZXNzYWdlcyBmcm9tIFRTTGludCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRNc2dSZWdFeCA9IC9UaGlzIGV4cHJlc3Npb24gaXMgdW5uZWNlc3NhcmlseSBjb21wYXJlZCB0byBhIGJvb2xlYW4uIEp1c3QgdXNlIGl0IGRpcmVjdGx5LiBcXCg8YSBocmVmPVwiLipcIj5uby1ib29sZWFuLWxpdGVyYWwtY29tcGFyZTxcXC9hPlxcKS87XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oaW52YWxpZFR5cGVjaGVja2VkUGF0aCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGxpbnQoZWRpdG9yKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdC5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgIGV4cGVjdChyZXN1bHRbMF0udHlwZSkudG9CZSgnZXJyb3InKTtcbiAgICAgICAgZXhwZWN0KGV4cGVjdGVkTXNnUmVnRXgudGVzdChyZXN1bHRbMF0uaHRtbCkpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdFswXS50ZXh0KS5ub3QudG9CZURlZmluZWQoKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdFswXS5maWxlUGF0aCkudG9CZShpbnZhbGlkVHlwZWNoZWNrZWRQYXRoKTtcbiAgICAgICAgZXhwZWN0KHJlc3VsdFswXS5yYW5nZSkudG9FcXVhbChbWzEsIDBdLCBbMSwgMV1dKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19