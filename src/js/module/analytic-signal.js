import ns from './ns';
import { kernelLen, amp, width, height } from '../module/config';
import { inv, normalize, maxIndexOf, mod, norm, getHsvColor, generatePolygons, generateCircles, generateLines, generatePolylinePoints } from '../module/util';

export default class AnalyticSignal {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    const stageElm = this.stageElm = opts.stageElm;
    const fftSize = this.fftSize = opts.fftSize;
    const sampleRate = this.sampleRate = opts.sampleRate;

    const context = this.context = stageElm.getContext('2d');

    const $gain = $('[data-js-gain]');

    this.gain = Number($gain.val());

    $gain.on('input', (evt) => {
      this.gain = Number($(evt.target).val());
    });
  }

  draw({ frequencyData, timeDomainData }) {
    const context = this.context;

    const hue = this.hue(frequencyData);

    const rgba = getHsvColor(hue || 0, 0.8, 0.5).alpha(0.3).css();

    const ptArr = [];

    const fragmentTxtArr = [];

    const ghostLen = 10;

    const gain = this.gain;

    for (let i = kernelLen, l = timeDomainData.length - kernelLen; i < l; i++) {
      let hilbTmp = 0;
      for (let k = - kernelLen; k <= kernelLen; k++) {
        hilbTmp += inv(k) * (normalize(timeDomainData[i + k]) || 0);
      }
      const re = normalize(timeDomainData[i]);
      const im = hilbTmp;
      const x = width / 2 + amp * re * gain;
      const y = height / 2 - amp * im * gain;

      const volume = norm(re, im);

      ptArr.push({re, im, x, y, hue, volume, amp});
    }

    const volAvg = _.meanBy(ptArr, 'volume');
    const opacity = Math.min(Math.pow(volAvg, 2) * 10, 1);


    const prev = { x: null, y: null };

    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);

    ptArr.forEach((pt) => {
      if (prev.x != null && prev.y != null) {
        context.beginPath();
        context.fillStyle = rgba;
        context.moveTo(width / 2,  height / 2);
        context.lineTo(prev.x, prev.y);
        context.lineTo(pt.x, pt.y);
        context.lineTo(width / 2,  height / 2);
        context.fill();
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
