import $ from 'jquery';
import * as dat from 'dat.gui';
import ns from './ns';
import { inv, normalize, maxIndexOf, mod, norm, getHsvColor, generatePolygons, generateCircles, generateLines, generatePolylinePoints } from '../module/util';

const param = {
  kernelLen: 127,
  amp: 512,
  freqSync: 'stroke',
  fillColor: '#000000',
  fillAlpha: 0,
  strokeColor: '#ffffff',
  strokeAlpha: 1,
  line: true,
  pointSize: 1,
  point: true,
};

export default class AnalyticSignal {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    const gui = new dat.GUI();

    $('main').append(gui.domElement);
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.right = 0;

    gui.add(param, 'amp', 0, 2048);
    gui.add(param, 'freqSync', ['none', 'fill', 'stroke', 'point']);
    gui.addColor(param, 'fillColor', 'color');
    gui.add(param, 'fillAlpha', 0, 1, 0.01);
    gui.addColor(param, 'strokeColor', 'color');
    gui.add(param, 'strokeAlpha', 0, 1, 0.01);
    gui.add(param, 'line');
    gui.add(param, 'point');
    gui.add(param, 'pointSize', 0, 99, 0.01);

    const stageElm = this.stageElm = opts.stageElm;
    const fftSize = this.fftSize = opts.fftSize;
    const sampleRate = this.sampleRate = opts.sampleRate;

    const context = this.context = stageElm.getContext('2d');

    const videoElm = document.querySelector('video');
    var str = this.stageElm.captureStream(30);
    videoElm.srcObject = str;
  }

  draw({ frequencyData, timeDomainData }) {
    const width = $(window).width();
    const height = $(window).height();

    const context = this.context;
  
    const hue = this.hue(frequencyData);

    const rgba = getHsvColor(hue || 0, 0.8, 0.5).alpha(0.3).css();

    const ptArr = [];

    const fragmentTxtArr = [];

    const ghostLen = 10;

    let amp = param.amp;

    for (let i = param.kernelLen, l = timeDomainData.length - param.kernelLen; i < l; i++) {
      let hilbTmp = 0;
      for (let k = - param.kernelLen; k <= param.kernelLen; k++) {
        hilbTmp += inv(k) * (timeDomainData[i + k] || 0);
      }
      const re = timeDomainData[i];
      const im = hilbTmp;
      const x = width / 2 + amp * re;
      const y = height / 2 - amp * im;

      const volume = norm(re, im);

      ptArr.push({ re, im, x, y, hue, volume, amp });
    }

    const volAvg = _.meanBy(ptArr, 'volume');
    const opacity = Math.min(Math.pow(volAvg, 2) * 10, 1);


    const prev = { x: null, y: null };

    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);

    ptArr.forEach((pt) => {
      if (prev.x != null && prev.y != null) {
        if (param.line) {
          context.beginPath();
          context.fillStyle = param.freqSync === 'fill' ? rgba : getHsvColor(param.fillColor).alpha(param.fillAlpha);
          context.moveTo(width / 2, height / 2);
          context.lineTo(prev.x, prev.y);
          context.lineTo(pt.x, pt.y);
          context.lineTo(width / 2, height / 2);
          context.fill();
  
          context.beginPath();
          context.strokeStyle = param.freqSync === 'stroke' ? rgba : getHsvColor(param.strokeColor).alpha(param.strokeAlpha);
          context.lineTo(prev.x, prev.y);
          context.lineTo(pt.x, pt.y);
          context.stroke();
        }

        if (param.point) {
          context.beginPath();
          context.fillStyle = param.freqSync === 'point' ? rgba : getHsvColor(param.fillColor).alpha(param.fillAlpha);
          context.arc(pt.x, pt.y, param.pointSize, 0, Math.PI * 2);
          context.fill();
        }
      }

      prev.x = pt.x;
      prev.y = pt.y;
    });
  }

  hue(frequencyData) {
    let ret;

    const sampleRate = this.sampleRate;
    const fftSize = this.fftSize;

    const hzUnit = sampleRate / fftSize; // frequencyData 1つあたりの周波数
    const hz = maxIndexOf(frequencyData) * hzUnit;
    const baseHz = 243; // C4
    const octave = Math.log(hz/baseHz) / Math.log(2);

    ret = mod(octave, 1) * 360;

    return ret;
  }
}
