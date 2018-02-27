(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ns = require('./ns');

var _ns2 = _interopRequireDefault(_ns);

var _config = require('../module/config');

var _util = require('../module/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnalyticSignal = function () {
  function AnalyticSignal() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AnalyticSignal);

    this.initialize(opts);
  }

  _createClass(AnalyticSignal, [{
    key: 'initialize',
    value: function initialize() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var stageElm = this.stageElm = opts.stageElm;
      var fftSize = this.fftSize = opts.fftSize;
      var sampleRate = this.sampleRate = opts.sampleRate;

      var context = this.context = stageElm.getContext('2d');
    }
  }, {
    key: 'draw',
    value: function draw(_ref) {
      var frequencyData = _ref.frequencyData,
          timeDomainData = _ref.timeDomainData;

      var context = this.context;

      var hue = this.hue(frequencyData);

      var hexString = tinycolor({ h: hue || 0, s: 100, v: 100 }).toHexString();

      var ptArr = [];

      var fragmentTxtArr = [];

      var ghostLen = 10;

      for (var i = _config.kernelLen, l = timeDomainData.length - _config.kernelLen; i < l; i++) {
        var hilbTmp = 0;
        for (var k = -_config.kernelLen; k <= _config.kernelLen; k++) {
          hilbTmp += (0, _util.inv)(k) * ((0, _util.normalize)(timeDomainData[i + k]) || 0);
        }
        var re = (0, _util.normalize)(timeDomainData[i]);
        var im = hilbTmp;
        var x = _config.width / 2 + _config.amp * re;
        var y = _config.height / 2 - _config.amp * im;

        var volume = (0, _util.norm)(re, im);

        ptArr.push({ re: re, im: im, x: x, y: y, hue: hue, volume: volume, amp: _config.amp });
      }

      var volAvg = _.meanBy(ptArr, 'volume');
      var opacity = Math.min(Math.pow(volAvg, 2) * 10, 1);

      var prev = { x: null, y: null };

      context.fillStyle = '#fff';
      context.fillRect(0, 0, _config.width, _config.height);

      ptArr.forEach(function (pt) {
        if (prev.x != null && prev.y != null) {
          context.beginPath();
          context.fillStyle = hexString;
          context.moveTo(_config.width / 2, _config.height / 2);
          context.lineTo(prev.x, prev.y);
          context.lineTo(pt.x, pt.y);
          context.lineTo(_config.width / 2, _config.height / 2);
          context.fill();
        }

        prev.x = pt.x;
        prev.y = pt.y;
      });
    }
  }, {
    key: 'hue',
    value: function hue(frequencyData) {
      var ret = void 0;

      var sampleRate = this.sampleRate;
      var fftSize = this.fftSize;

      var hzUnit = sampleRate / fftSize; // frequencyData 1つあたりの周波数
      var hz = (0, _util.maxIndexOf)(frequencyData) * hzUnit;
      var baseHz = 243; // C4
      var octave = Math.log(hz / baseHz) / Math.log(2);

      ret = (0, _util.mod)(octave, 1) * 360;

      return ret;
    }
  }]);

  return AnalyticSignal;
}();

exports.default = AnalyticSignal;

},{"../module/config":2,"../module/util":6,"./ns":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var kernelLen = exports.kernelLen = 127;
var amp = exports.amp = 100;
var width = exports.width = 256;
var height = exports.height = 256;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Main = function () {
  function Main() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Main);

    console.log('Hello, world!');

    this.initialize();

    console.log('Thanks, world!');
  }

  _createClass(Main, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      $(function () {
        _this.router = new _router2.default();
      });
    }
  }]);

  return Main;
}();

exports.default = Main;

},{"./router":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * グローバル直下に変数を置かないよう、ネームスペースを切る。
 * ネームスペース以下の変数にアクセスしたいときは各クラスでこれをimportする
 */

window.App = window.App || {};
var ns = window.App;
exports.default = ns;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ns = require('./ns');

var _ns2 = _interopRequireDefault(_ns);

var _common = require('../page/common');

var _common2 = _interopRequireDefault(_common);

var _index = require('../page/index');

var _index2 = _interopRequireDefault(_index);

var _sub = require('../page/sub');

var _sub2 = _interopRequireDefault(_sub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function page(pageId, callback) {
  if (document.querySelector('body[data-page-id="' + pageId + '"]')) {
    callback();
  }
};

var Router = function () {
  function Router() {
    _classCallCheck(this, Router);

    this.initialize();
  }

  _createClass(Router, [{
    key: 'initialize',
    value: function initialize() {
      _ns2.default.page = _ns2.default.page || {};

      (0, _common2.default)();

      page('index', _index2.default);
      page('sub', _sub2.default);
    }
  }]);

  return Router;
}();

exports.default = Router;

},{"../page/common":7,"../page/index":8,"../page/sub":9,"./ns":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHexString = exports.norm = exports.mod = exports.maxIndexOf = exports.normalize = exports.inv = undefined;

var _config = require('./config');

var inv = exports.inv = function inv(n) {
  if (n === 0) {
    return 0;
  } else {
    return 1 / (n * Math.PI);
  }
};

var normalize = exports.normalize = function normalize(val) {
  return (val - 128) / 128;
};

var maxIndexOf = exports.maxIndexOf = function maxIndexOf(arr) {
  return _.indexOf(arr, _.max(arr));
};

// from http://shnya.jp/blog/?p=323
var mod = exports.mod = function mod(i, j) {
  return i % j + (i < 0 ? j : 0);
};

var norm = exports.norm = function norm(x) {
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return Math.sqrt(x * x + y * y);
};

var getHexString = exports.getHexString = function getHexString() {
  var hue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var brightness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var saturation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

  var h = hue;
  var s = saturation;
  var v = brightness;

  return tinycolor({ h: h, s: s, v: v }).toHexString();
};

// export const generateLines = (ptArr) => {
//   return ptArr.reduce((txt, pt, i, arr) => {
//     if (i > 0) {
//       const prevPt = arr[i - 1];
//       return txt + `<line x1="${prevPt.x}" y1="${prevPt.y}" x2="${pt.x}" y2="${pt.y}"></line>`;
//     }

//     return '';
//   });
// };

// export const generatePolygons = (ptArr, opacity = 1) => {
//   return ptArr.reduce((txt, pt, i, arr) => {
//     if (i > 0) {
//       const prevPt = arr[i - 1];
//       return txt + `<polygon points="${width / 2},${height / 2} ${prevPt.x},${prevPt.y} ${pt.x},${pt.y}" fill="${getHexString(pt.hue)}" fill-opacity="${opacity}"></polygon>`;
//     }

//     return '';
//   }, '');
// };

// export const generateCircles = (ptArr) => {
//   return ptArr.reduce((txt, pt) => {
//     return txt + `<circle cx="${pt.x}" cy="${pt.y}" r=".5"></circle>`;
//   }, '');
// };

// export const generatePolylinePoints = (ptArr) => {
//   return ptArr.reduce((txt, pt) => {
//     return txt + `${pt.x} ${pt.y} `;
//   }, '');
// };

},{"./config":2}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ns = require('../module/ns');

var _ns2 = _interopRequireDefault(_ns);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  console.log('page common');

  setEnvClass();
};

function setEnvClass() {
  var $html = $('html');

  _ns2.default.isSp = false;
  _ns2.default.isPc = false;
  _ns2.default.isTab = false;

  if ($html.hasClass('is-sp')) {
    _ns2.default.isSp = true;
  }
  if ($html.hasClass('is-pc')) {
    _ns2.default.isPc = true;
  }
  if ($html.hasClass('is-tab')) {
    _ns2.default.isTab = true;
  }
}

},{"../module/ns":4}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ns = require('../module/ns');

var _ns2 = _interopRequireDefault(_ns);

var _analyticSignal = require('../module/analytic-signal');

var _analyticSignal2 = _interopRequireDefault(_analyticSignal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  var initialize = function initialize() {
    var url = 'audio/vivaldi-spring.mp3';

    var stageElm = document.querySelector('[data-js-stage]');
    var $btnPlay = $('[data-js-btn-play]');

    var frequencyData = void 0;
    var timeDomainData = void 0;

    var cnt = 0;

    var audioContext = new AudioContext();

    var decodeAudioDataHandler = function decodeAudioDataHandler(buffer) {
      if (!buffer) {
        console.log('error');
        return;
      }

      var sourceNode = audioContext.createBufferSource(); // AudioBufferSourceNodeを作成
      sourceNode.buffer = buffer; // 取得した音声データ(バッファ)を音源に設定
      var analyser = audioContext.createAnalyser(); // AnalyserNodeを作成

      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      timeDomainData = new Uint8Array(analyser.frequencyBinCount);

      sourceNode.connect(analyser); // AudioBufferSourceNodeをAnalyserNodeに接続
      analyser.connect(audioContext.destination); // AnalyserNodeをAudioDestinationNodeに接続
      sourceNode.start(0); // 再生開始

      var fftSize = analyser.fftSize;
      var sampleRate = audioContext.sampleRate;

      var analyticSignal = new _analyticSignal2.default({
        stageElm: stageElm,
        fftSize: fftSize,
        sampleRate: sampleRate
      });

      var ticker = function ticker() {
        cnt++;

        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(timeDomainData);

        analyticSignal.draw({
          frequencyData: frequencyData,
          timeDomainData: timeDomainData
        });

        requestAnimationFrame(ticker);
      };

      ticker();
    };

    var audioLoadHandler = function audioLoadHandler(response) {
      // 取得したデータをデコードする。
      audioContext.decodeAudioData(response, decodeAudioDataHandler, function (error) {
        console.log('decodeAudioData error');
      });
    };

    $btnPlay.on('click', function (_evt) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = function () {
        audioLoadHandler(request.response);
      };

      request.send();
    });
  };

  window.addEventListener("load", initialize, false);
};

},{"../module/analytic-signal":1,"../module/ns":4}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ns = require('../module/ns');

var _ns2 = _interopRequireDefault(_ns);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  console.log('sub page');
};

},{"../module/ns":4}],10:[function(require,module,exports){
'use strict';

var _ns = require('./module/ns');

var _ns2 = _interopRequireDefault(_ns);

var _main = require('./module/main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// エントリーポイント。indexからはライブラリとこれしか呼ばない

_ns2.default.main = new _main2.default();

},{"./module/main":3,"./module/ns":4}]},{},[10]);
