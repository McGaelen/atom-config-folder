Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var AtomClockView = (function () {
  function AtomClockView(statusBar) {
    _classCallCheck(this, AtomClockView);

    this.statusBar = statusBar;
    this.subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(AtomClockView, [{
    key: 'start',
    value: function start() {
      this.drawElement();
      this.initialize();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.setConfigValues();
      this.setIcon(this.showIcon);
      this.startTicker();
      this.adjustElementSize();

      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-clock:toggle': function atomClockToggle() {
          return _this.toggle();
        }
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.dateFormat', function () {
        _this.refreshTicker();
        _this.adjustElementSize();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.locale', function () {
        _this.refreshTicker();
        _this.adjustElementSize();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.refreshInterval', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showClockIcon', function () {
        _this.setConfigValues();
        _this.setIcon(_this.showIcon);
        _this.adjustElementSize();
      }));
    }
  }, {
    key: 'drawElement',
    value: function drawElement() {
      this.element = document.createElement('div');
      this.element.className = 'atom-clock';
      this.element.appendChild(document.createElement('span'));

      this.statusBar.addRightTile({
        item: this.element,
        priority: -1
      });
    }
  }, {
    key: 'setConfigValues',
    value: function setConfigValues() {
      this.dateFormat = atom.config.get('atom-clock.dateFormat');
      this.locale = atom.config.get('atom-clock.locale');
      this.refreshInterval = atom.config.get('atom-clock.refreshInterval') * 1000;
      this.showIcon = atom.config.get('atom-clock.showClockIcon');
    }
  }, {
    key: 'startTicker',
    value: function startTicker() {
      var _this2 = this;

      this.setDate();
      var nextTick = this.refreshInterval - Date.now() % this.refreshInterval;
      this.tick = setTimeout(function () {
        _this2.startTicker();
      }, nextTick);
    }
  }, {
    key: 'clearTicker',
    value: function clearTicker() {
      if (this.tick) clearTimeout(this.tick);
    }
  }, {
    key: 'refreshTicker',
    value: function refreshTicker() {
      this.setConfigValues();
      this.clearTicker();
      this.startTicker();
    }
  }, {
    key: 'setDate',
    value: function setDate() {
      this.date = this.getDate(this.locale, this.dateFormat);
      this.element.firstChild.textContent = this.date;
    }
  }, {
    key: 'getDate',
    value: function getDate(locale, format) {
      if (!this.Moment) this.Moment = require('moment');

      return this.Moment().locale(locale).format(format);
    }
  }, {
    key: 'adjustElementSize',
    value: function adjustElementSize() {
      var contentWidth = this.element.firstChild.getBoundingClientRect().width + 5;
      this.element.style.width = contentWidth + 5 + 'px';
    }
  }, {
    key: 'setIcon',
    value: function setIcon(toSet) {
      if (toSet) this.element.firstChild.className += 'icon icon-clock';else this.element.firstChild.className = '';
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var style = this.element.style.display;
      this.element.style.display = style === 'none' ? '' : 'none';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clearTicker();
      this.subscriptions.dispose();
      this.element.parentNode.removeChild(this.element);
    }
  }]);

  return AtomClockView;
})();

exports['default'] = AtomClockView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9nYWVsZW4vLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9saWIvYXRvbS1jbG9jay12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOztBQUYxQyxXQUFXLENBQUM7O0lBSVMsYUFBYTtBQUVyQixXQUZRLGFBQWEsQ0FFcEIsU0FBUyxFQUFFOzBCQUZKLGFBQWE7O0FBRzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7R0FDL0M7O2VBTGtCLGFBQWE7O1dBTzNCLGlCQUFHO0FBQ04sVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2xCLFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtLQUNsQjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtBQUN0QixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7O0FBRXhCLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELDJCQUFtQixFQUFFO2lCQUFNLE1BQUssTUFBTSxFQUFFO1NBQUE7T0FDekMsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsWUFBTTtBQUM1RSxjQUFLLGFBQWEsRUFBRSxDQUFBO0FBQ3BCLGNBQUssaUJBQWlCLEVBQUUsQ0FBQTtPQUN6QixDQUFDLENBQUMsQ0FBQTs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcs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TUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNuRDs7O1dBRWdCLDZCQUFHO0FBQ2xCLFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUM1RSxVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7S0FDbkQ7OztXQUVNLGlCQUFDLEtBQUssRUFBRTtBQUNiLFVBQUksS0FBSyxFQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQSxLQUV0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO0tBQ3pDOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQTtBQUN0QyxVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxLQUFLLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFBO0tBQzVEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNsQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDbEQ7OztTQWhIa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL1VzZXJzL2dhZWxlbi8uYXRvbS9wYWNrYWdlcy9hdG9tLWNsb2NrL2xpYi9hdG9tLWNsb2NrLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0b21DbG9ja1ZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5kcmF3RWxlbWVudCgpXG4gICAgdGhpcy5pbml0aWFsaXplKClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgIHRoaXMuc3RhcnRUaWNrZXIoKVxuICAgIHRoaXMuYWRqdXN0RWxlbWVudFNpemUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnYXRvbS1jbG9jazp0b2dnbGUnOiAoKSA9PiB0aGlzLnRvZ2dsZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLmRhdGVGb3JtYXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgICAgdGhpcy5hZGp1c3RFbGVtZW50U2l6ZSgpXG4gICAgfSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLWNsb2NrLmxvY2FsZScsICgpID0+IHtcbiAgICAgIHRoaXMucmVmcmVzaFRpY2tlcigpXG4gICAgICB0aGlzLmFkanVzdEVsZW1lbnRTaXplKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2sucmVmcmVzaEludGVydmFsJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd0Nsb2NrSWNvbicsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICAgIHRoaXMuc2V0SWNvbih0aGlzLnNob3dJY29uKVxuICAgICAgdGhpcy5hZGp1c3RFbGVtZW50U2l6ZSgpXG4gICAgfSkpXG5cbiAgfVxuXG4gIGRyYXdFbGVtZW50KCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTmFtZSA9ICdhdG9tLWNsb2NrJ1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJykpXG5cbiAgICB0aGlzLnN0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbTogdGhpcy5lbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IC0xXG4gICAgfSlcbiAgfVxuXG4gIHNldENvbmZpZ1ZhbHVlcygpIHtcbiAgICB0aGlzLmRhdGVGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcpXG4gICAgdGhpcy5sb2NhbGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY2xvY2subG9jYWxlJylcbiAgICB0aGlzLnJlZnJlc2hJbnRlcnZhbCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnKSAqIDEwMDBcbiAgICB0aGlzLnNob3dJY29uID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnNob3dDbG9ja0ljb24nKVxuICB9XG5cbiAgc3RhcnRUaWNrZXIoKSB7XG4gICAgdGhpcy5zZXREYXRlKClcbiAgICB2YXIgbmV4dFRpY2sgPSB0aGlzLnJlZnJlc2hJbnRlcnZhbCAtIChEYXRlLm5vdygpICUgdGhpcy5yZWZyZXNoSW50ZXJ2YWwpXG4gICAgdGhpcy50aWNrID0gc2V0VGltZW91dCAoKCkgPT4gIHsgdGhpcy5zdGFydFRpY2tlcigpIH0sIG5leHRUaWNrKVxuICB9XG5cbiAgY2xlYXJUaWNrZXIoKSB7XG4gICAgaWYgKHRoaXMudGljaylcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpY2spXG4gIH1cblxuICByZWZyZXNoVGlja2VyKCkge1xuICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN0YXJ0VGlja2VyKClcbiAgfVxuXG4gIHNldERhdGUoKSB7XG4gICAgdGhpcy5kYXRlID0gdGhpcy5nZXREYXRlKHRoaXMubG9jYWxlLCB0aGlzLmRhdGVGb3JtYXQpXG4gICAgdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQudGV4dENvbnRlbnQgPSB0aGlzLmRhdGVcbiAgfVxuXG4gIGdldERhdGUobG9jYWxlLCBmb3JtYXQpIHtcbiAgICBpZiAoIXRoaXMuTW9tZW50KVxuICAgICAgdGhpcy5Nb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKVxuXG4gICAgcmV0dXJuIHRoaXMuTW9tZW50KCkubG9jYWxlKGxvY2FsZSkuZm9ybWF0KGZvcm1hdClcbiAgfVxuXG4gIGFkanVzdEVsZW1lbnRTaXplKCkge1xuICAgIHZhciBjb250ZW50V2lkdGggPSB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCArIDVcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSBjb250ZW50V2lkdGggKyA1ICsgJ3B4J1xuICB9XG5cbiAgc2V0SWNvbih0b1NldCkge1xuICAgIGlmICh0b1NldClcbiAgICAgIHRoaXMuZWxlbWVudC5maXJzdENoaWxkLmNsYXNzTmFtZSArPSAnaWNvbiBpY29uLWNsb2NrJ1xuICAgIGVsc2VcbiAgICAgIHRoaXMuZWxlbWVudC5maXJzdENoaWxkLmNsYXNzTmFtZSA9ICcnXG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXlcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHN0eWxlID09PSAnbm9uZScgPyAnJyA6ICdub25lJ1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KVxuICB9XG5cbn1cbiJdfQ==