(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ns = require('./ns');

var _ns2 = _interopRequireDefault(_ns);

var _config = require('./config');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnalyticSignal = function () {
  function AnalyticSignal(arr) {
    _classCallCheck(this, AnalyticSignal);

    this.origArr = new Uint8Array(arr.length);
    for (var n = 0; n < arr.length; n++) {
      this.origArr[n] = arr[n];
    }

    this.state = 'stop';

    this.reArr = new Array();
    this.imArr = new Array();

    this.vol = 0;

    for (var i = _config.kernelLen, l = arr.length - _config.kernelLen; i < l; i++) {
      var hilbTmp = 0;
      for (var k = -_config.kernelLen; k <= _config.kernelLen; k++) {
        hilbTmp += (0, _util.inv)(k) * ((0, _util.normalize)(arr[i + k]) || 0);
      }
      var reVal = (0, _util.normalize)(arr[i]);
      var imVal = hilbTmp;

      this.reArr.push(reVal);
      this.imArr.push(imVal);

      this.vol = Math.max(this.vol, Math.sqrt(reVal * reVal + imVal * imVal));
    }
  }

  _createClass(AnalyticSignal, [{
    key: 'draw',
    value: function draw(hue) {}
  }, {
    key: 'play',
    value: function play() {
      //Create the instance of AudioBuffer (Synchronously)
      var context = new AudioContext();
      var audioBuffer = context.createBuffer(1, 1024, context.sampleRate);
      // var audioBuffer = context.createBuffer(channel, length, context.sampleRate);

      var data = audioBuffer.getChannelData(0);
      for (var i = 0; i < this.origArr.length; i++) {
        data[i] = (this.origArr[i] - 128) / 128;
      }

      //Create the instance of AudioBufferSourceNode
      var source = context.createBufferSource();
      //Set the instance of AudioBuffer
      source.buffer = audioBuffer;

      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = audioBuffer.duration;
      source.playbackRate.value = 1.0;
      //AudioBufferSourceNode (input) -> AudioDestinationNode (output)
      source.connect(context.destination);

      source.start(0);
      source.stop(0.5);
    }
  }]);

  return AnalyticSignal;
}();

exports.default = AnalyticSignal;

},{"./config":2,"./ns":4,"./util":6}],2:[function(require,module,exports){
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
exports.generatePolylinePoints = exports.generateCircles = exports.generatePolygons = exports.generateLines = exports.getHexString = exports.norm = exports.mod = exports.maxIndexOf = exports.normalize = exports.inv = undefined;

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

var generateLines = exports.generateLines = function generateLines(ptArr) {
  return ptArr.reduce(function (txt, pt, i, arr) {
    if (i > 0) {
      var prevPt = arr[i - 1];
      return txt + ('<line x1="' + prevPt.x + '" y1="' + prevPt.y + '" x2="' + pt.x + '" y2="' + pt.y + '"></line>');
    }

    return '';
  });
};

var generatePolygons = exports.generatePolygons = function generatePolygons(ptArr) {
  var opacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  return ptArr.reduce(function (txt, pt, i, arr) {
    if (i > 0) {
      var prevPt = arr[i - 1];
      return txt + ('<polygon points="' + _config.width / 2 + ',' + _config.height / 2 + ' ' + prevPt.x + ',' + prevPt.y + ' ' + pt.x + ',' + pt.y + '" fill="' + getHexString(pt.hue) + '" fill-opacity="' + opacity + '"></polygon>');
    }

    return '';
  }, '');
};

var generateCircles = exports.generateCircles = function generateCircles(ptArr) {
  return ptArr.reduce(function (txt, pt) {
    return txt + ('<circle cx="' + pt.x + '" cy="' + pt.y + '" r=".5"></circle>');
  }, '');
};

var generatePolylinePoints = exports.generatePolylinePoints = function generatePolylinePoints(ptArr) {
  return ptArr.reduce(function (txt, pt) {
    return txt + (pt.x + ' ' + pt.y + ' ');
  }, '');
};

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

var _config = require('../module/config');

var _util = require('../module/util');

var _analyticSignal = require('../module/analytic-signal');

var _analyticSignal2 = _interopRequireDefault(_analyticSignal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  var initialize = function initialize() {

    var audioElm = document.getElementById("audio");
    var stageElm = document.querySelector('[data-js-stage]');
    var damaElm = document.querySelector('[data-js-dama]');
    var playerElm = document.querySelector('[data-js-player]');
    var $btnCapture = $('[data-js-btn-capture]');

    var timeDomainData = void 0;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: true }, function (stream) {
        var url = URL.createObjectURL(stream);
        audioElm.src = url;
        audioElm.volume = 0;
        var audioContext = new AudioContext();
        var mediastreamsource = audioContext.createMediaStreamSource(stream);
        var analyser = audioContext.createAnalyser();
        var frequencyData = new Uint8Array(analyser.frequencyBinCount);
        timeDomainData = new Uint8Array(analyser.frequencyBinCount);
        mediastreamsource.connect(analyser);

        var fragmentTxtArr = [];

        var cnt = 0;
        var ghostLen = 10;

        var ticker = function ticker() {
          cnt++;

          // // 間引き処理
          // if (cnt % 10 !== 0) {
          //   requestAnimationFrame(ticker);
          //   return;
          // }

          analyser.getByteFrequencyData(frequencyData);
          analyser.getByteTimeDomainData(timeDomainData);

          var hzUnit = audioContext.sampleRate / analyser.fftSize; // frequencyData 1つあたりの周波数
          var hz = (0, _util.maxIndexOf)(frequencyData) * hzUnit;
          var baseHz = 243; // C4
          var octave = Math.log(hz / baseHz) / Math.log(2);

          var hue = (0, _util.mod)(octave, 1) * 360;
          var hexString = tinycolor({ h: hue || 0, s: 100, v: 100 }).toHexString();

          var ptArr = [];

          stageElm.innerHTML = '';

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

          // ns.fragmentTxt = `<g fill="${getHexString(hue)}" opacity="${opacity}">${generateCircles(ptArr)}</g>`;
          // ns.fragmentTxt = `<polyline points="${generatePolylinePoints(ptArr)}" fill="${hexString}" fill-opacity="${opacity}"></polyline>`;
          _ns2.default.fragmentTxt = '<g>' + (0, _util.generatePolygons)(ptArr, 0.1) + '</g>';
          fragmentTxtArr.push(_ns2.default.fragmentTxt);

          stageElm.innerHTML = _.takeRight(fragmentTxtArr, ghostLen).join('');

          requestAnimationFrame(ticker);
        };

        ticker();
      }, function (err) {
        console.log("The following error occured: " + err);
      });
    } else {
      console.log("getUserMedia not supported");
    }

    $btnCapture.on('click', function (_evt) {
      damaElm.innerHTML = _ns2.default.fragmentTxt;
    });
  };

  window.addEventListener("load", initialize, false);
};

},{"../module/analytic-signal":1,"../module/config":2,"../module/ns":4,"../module/util":6}],9:[function(require,module,exports){
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
