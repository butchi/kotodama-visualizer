import { inv, maxIndexOf, mod, norm, getHsvColor } from './util.mjs';

const param = {
  kernelLen: 127,
  amp: 512,
  freqSync: 'stroke',
  fillColor: '#000000',
  fillAlpha: 0,
  strokeColor: '#000000',
  strokeAlpha: 1,
  lineWidth: 1,
  line: true,
  pointSize: 1,
  point: false,
  normalize: false,
  output: 'canvas',
};

export default class AnalyticSignal {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    globalThis.frameCnt = 0;

    const gui = new dat.GUI();

    $('main').append(gui.domElement);
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.right = 0;

    gui.add(param, 'amp', 0, 16383);
    gui.add(param, 'freqSync', ['none', 'fill', 'stroke', 'point']);
    gui.addColor(param, 'fillColor');
    gui.add(param, 'fillAlpha', 0, 1, 0.01);
    gui.addColor(param, 'strokeColor');
    gui.add(param, 'strokeAlpha', 0, 1, 0.01);
    gui.add(param, 'lineWidth', 0, 5, 1);
    gui.add(param, 'line');
    gui.add(param, 'point');
    gui.add(param, 'pointSize', 0, 9, 0.01);
    gui.add(param, 'normalize');
    gui.add(param, 'output', ['canvas', 'video']).onChange(val => {
      if (val === '') {
      } else if (val === 'canvas') {
        videoElm.style.visibility = 'hidden'
        stageElm.style.visibility = 'visible'
      } else if (val === 'video') {
        stageElm.style.visibility = 'hidden'
        videoElm.style.visibility = 'visible'
      }
    });

    const stageElm = this.stageElm = opts.stageElm;
    const fftSize = this.fftSize = opts.fftSize;
    const sampleRate = this.sampleRate = opts.sampleRate;

    const context = this.context = stageElm.getContext('2d');

    this.consoleElm = document.querySelector('.console');
    this.voicedFlag = false;

    this.pointElm = document.querySelector('.point');

    const videoElm = document.querySelector('video');
    var str = this.stageElm.captureStream(30);
    videoElm.srcObject = str;
  }

  draw({ frequencyData, timeDomainData }) {
    globalThis.frameCnt++;

    const width = $(window).width();
    const height = $(window).height();

    const context = this.context;

    const hue = this.hue(frequencyData);

    const rgba = getHsvColor(hue || 0, 0.8, 0.5).alpha(0.3).css();

    const ptArr = [];

    let amp = param.amp;

    for (let i = param.kernelLen, l = timeDomainData.length - param.kernelLen; i < l; i++) {
      let hilbTmp = 0;
      for (let k = - param.kernelLen; k <= param.kernelLen; k++) {
        hilbTmp += inv(k) * (timeDomainData[i + k] || 0);
      }
      const re = timeDomainData[i];
      const im = hilbTmp;

      const volume = norm(re, im);

      ptArr.push({ re, im, hue, volume, amp });
    }

    const volAvg = _.meanBy(ptArr, 'volume');

    ptArr.forEach(pt => {
      pt.x = width / 2 + pt.re / (param.normalize ? volAvg : 1) * amp;
      pt.y = height / 2 - pt.im / (param.normalize ? volAvg : 1) * amp;
    });

    const prev = { x: null, y: null };

    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);

    // const lenNum = ptArr.reduce((p, c, i, arr) => {
    //   const len = Math.sqrt((arr[i].re - (arr[i - 1] || {}).re) ** 2 + (arr[i].im - (arr[i - 1] || {}).im) ** 2) || 0;

    //   return p + len;
    // }, 0)

    // const rotNum = ptArr.reduce((p, c, i, arr) => {
    //   const arg = (pCur = { re: 0, im: 0 }, pPrev = { re: 0, im: 0 }) => Math.atan2(pCur.im - pPrev.im, pCur.re - pPrev.re);

    //   if (arg(arr[i]) - arg(arr[i - 1]) < 0 && arg(arr[i - 1]) - arg(arr[i - 2]) > 0) {
    //     return p + 1;
    //   }

    //   return p;
    // }, 0)

    // const curveNum = ptArr.reduce((p, c, i, arr) => {
    //   const arg = (pCur = { re: 0, im: 0 }, pPrev = { re: 0, im: 0 }) => Math.atan2(pCur.im - pPrev.im, pCur.re - pPrev.re);

    //   if ((arg(arr[i]) - arg(arr[i - 1])) - (arg(arr[i - 1]) - arg(arr[i - 2])) < - Math.PI / 2) {
    //     return p + 1;
    //   }

    //   return p;
    // }, 0)

    // if (volAvg > .01) {
    //   if (!this.voicedFlag) {
    //     this.voicedFlag = true;
    //   } else {
    //     this.pointElm.style.transform = `translate(${rotNum * 3}px, ${lenNum / volAvg}px)`
    //   }
    // } else {
    //   this.voicedFlag = false;
    // }

    ptArr.forEach(pt => {
      if (prev.x != null && prev.y != null) {
        if (param.line) {
          context.beginPath();
          context.fillStyle = (param.freqSync === 'fill' && !param.point) ? rgba : chroma(param.fillColor).alpha(param.fillAlpha);
          context.moveTo(width / 2, height / 2);
          context.lineTo(prev.x, prev.y);
          context.lineTo(pt.x, pt.y);
          context.lineTo(width / 2, height / 2);
          context.fill();

          context.beginPath();
          context.strokeStyle = param.freqSync === 'stroke' ? rgba : chroma(param.strokeColor).alpha(param.strokeAlpha);
          context.lineWidth = param.lineWidth;
          context.lineTo(prev.x, prev.y);
          context.lineTo(pt.x, pt.y);
        }

        if (param.point) {
          context.beginPath();
          context.strokeStyle = getHsvColor(param.strokeColor).alpha(param.strokeAlpha);
          context.fillStyle = param.freqSync === 'point' ? rgba : chroma(param.fillColor).alpha(param.fillAlpha);
          context.arc(pt.x, pt.y, param.pointSize, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.stroke();

      prev.x = pt.x;
      prev.y = pt.y;
    });
  }

  hue(frequencyData) {
    let ret;

    const sampleRate = this.sampleRate;
    const fftSize = this.fftSize;

    // frequencyData 1つあたりの周波数
    const hzUnit = sampleRate / fftSize;

    const hz = maxIndexOf(frequencyData) * hzUnit;

    // ベースとなる音高はC4
    const baseHz = 243;

    const octave = Math.log(hz / baseHz) / Math.log(2);

    ret = mod(octave, 1) * 360;

    return ret;
  }
}
