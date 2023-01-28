import 'https://code.jquery.com/jquery-3.6.3.min.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';
import { inv, maxIndexOf, mod, norm, getHsvColor } from './util.mjs';

const paramDefault = {
  kernelLen: 127,
  amp: 512,
  theme: 'default',
  freqSync: 'surface',
  bgColor: '#ffffff',
  surface: true,
  surfaceColor: '#ffffff',
  surfaceAlpha: 0.5,
  line: true,
  lineColor: '#000000',
  lineAlpha: 0.5,
  lineWidth: 1,
  point: false,
  pointSize: 1,
  pointColor: '#000000',
  pointAlpha: 0.5,
  normalize: false,
  output: 'canvas',
  pip: false,
};

const param = Object.assign({}, paramDefault);

export default class AnalyticSignal {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize(opts = {}) {
    this.frameCnt = 0;

    const gui = new GUI();

    gui.close();

    $('main').append(gui.domElement);
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.right = 0;

    const guiController = [
      gui.add(param, 'amp', 0, 16383),
      gui.add(param, 'theme', ['default', 'kotodama', 'mono', 'nega', 'oscillo', 'bios', 'medetai', 'psychedelic', 'reiwa']).onChange(val => {
        let { freqSync, bgColor, surface, surfaceColor, surfaceAlpha, line, lineColor, lineAlpha, lineWidth, point, pointSize, pointColor, pointAlpha } = paramDefault;

        if (val === '') {
        } else if (val === 'kotodama') {
          bgColor = '#ffffff';
          freqSync = false;
          surface = true;
          line = false;
          point = false;
          surfaceAlpha = 0.5;
          surfaceColor = '#7b68ee';
          lineAlpha = 0.3;
          lineColor = '#ffffff';
        } else if (val === 'oscillo') {
          bgColor = '#000000';
          freqSync = false;
          surface = false;
          line = true;
          point = false;
          lineAlpha = 1;
          lineColor = '#00ff00';
        } else if (val === 'mono') {
          bgColor = '#ffffff';
          freqSync = false;
          surface = false;
          line = true;
          point = false;
          lineAlpha = 1;
          lineColor = '#000000';
        } else if (val === 'nega') {
          bgColor = '#000000';
          freqSync = false;
          surface = false;
          line = true;
          point = false;
          lineAlpha = 1;
          lineColor = '#ffffff';
        } else if (val === 'bios') {
          bgColor = '#0000ff';
          freqSync = false;
          surface = false;
          line = true;
          point = false;
          lineAlpha = 1;
          lineColor = '#ffff00';
        } else if (val === 'medetai') {
          bgColor = '#c18e33';
          freqSync = false;
          surface = true;
          line = true;
          point = true;
          surfaceAlpha = 0.5;
          surfaceColor = '#e83530';
          lineAlpha = 1;
          lineColor = '#ffffff';
          pointSize = 1.5;
          pointAlpha = 1;
          pointColor = '#ffffff';
        } else if (val === 'psychedelic') {
          bgColor = '#ffa500';
          freqSync = false;
          surface = true;
          line = true;
          point = true;
          surfaceAlpha = 0.5;
          surfaceColor = '#00ffff';
          lineAlpha = 1;
          lineColor = '#ff00ff';
          pointSize = 1.5;
          pointAlpha = 1;
          pointColor = '#800000';
        } else if (val === 'reiwa') {
          bgColor = '#ffffff';
          freqSync = false;
          surface = true;
          line = true;
          point = true;
          surfaceAlpha = 0.5;
          surfaceColor = '#f7dade';
          lineAlpha = 1;
          lineColor = '#e3a9b8';
          pointSize = 1.5;
          pointAlpha = 1;
          pointColor = '#524362';
        } else {
        }

        Object.assign(param, {
          freqSync,
          bgColor,
          surface,
          surfaceColor,
          surfaceAlpha,
          lineColor,
          lineAlpha,
          lineWidth,
          line,
          pointSize,
          point,
          pointColor,
          pointAlpha,
        });

        guiController.forEach(c => c.updateDisplay());
      }),
      gui.add(param, 'freqSync', ['none', 'surface', 'line', 'point']).onChange(val => {
        if (val === '') {
        } else if (val === 'surface') {
          param.surface = true;
          param.line = false;
          param.point = false;
          param.surfaceAlpha = 1;
        } else if (val === 'line') {
          param.surface = false;
          param.line = true;
          param.point = false;
          param.lineAlpha = 1;
        } else if (val === 'point') {
          param.surface = false;
          param.line = false;
          param.point = true;
          param.pointAlpha = 1;
        }

        guiController.forEach(c => c.updateDisplay());
      }),
      gui.addColor(param, 'bgColor'),
      gui.add(param, 'surface'),
      gui.addColor(param, 'surfaceColor'),
      gui.add(param, 'surfaceAlpha', 0, 1, 0.01),
      gui.add(param, 'line'),
      gui.addColor(param, 'lineColor'),
      gui.add(param, 'lineAlpha', 0, 1, 0.01),
      gui.add(param, 'lineWidth', 0, 15, 1),
      gui.add(param, 'point'),
      gui.addColor(param, 'pointColor'),
      gui.add(param, 'pointAlpha', 0, 1, 0.01),
      gui.add(param, 'pointSize', 0, 9, 0.01),
      gui.add(param, 'normalize'),
      gui.add(param, 'output', ['canvas', 'video']).onChange(val => {
        if (val === '') {
        } else if (val === 'canvas') {
          this.videoElm.style.visibility = 'hidden'
          this.stageElm.style.visibility = 'visible'
        } else if (val === 'video') {
          this.stageElm.style.visibility = 'hidden'
          this.videoElm.style.visibility = 'visible'
        }
      }),
      gui.add(param, 'pip').onChange(isPip => {
        if (isPip) {
          this.videoElm.requestPictureInPicture();
        } else if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        }
      })
    ];

    this.stageElm = opts.stageElm;

    this.fftSize = opts.fftSize;
    this.sampleRate = opts.sampleRate;

    this.context = this.stageElm.getContext('2d');

    this.consoleElm = document.querySelector('.console');
    this.voicedFlag = false;

    this.pointElm = document.querySelector('.point');

    this.videoElm = document.querySelector('video');
    var stream = this.stageElm.captureStream(30);
    this.videoElm.srcObject = stream;
    this.videoElm.play();
  }

  draw({ frequencyData, timeDomainData }) {
    this.frameCnt++;

    const width = $(window).width();
    const height = $(window).height();

    const context = this.context;

    const hue = this.hue(frequencyData);

    const rgba = getHsvColor(hue || 0, 0.8, 0.5);

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

    const volAvg = ptArr.reduce((p, c) => p + c.volume, 0) / ptArr.length;

    ptArr.forEach(pt => {
      pt.x = width / 2 + pt.re / (param.normalize ? volAvg * 8 : 1) * amp;
      pt.y = height / 2 - pt.im / (param.normalize ? volAvg * 8 : 1) * amp;
    });

    const prev = { x: null, y: null };

    context.fillStyle = param.bgColor;
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

    if (param.surface) {
      ptArr.forEach(pt => {
        if (prev.x != null && prev.y != null) {
          context.strokeStyle = "transparent";
          context.fillStyle = (param.freqSync === 'surface') ? rgba.alpha(param.surfaceAlpha).css() : chroma(param.surfaceColor).alpha(param.surfaceAlpha);
          context.beginPath();
          context.moveTo(width / 2, height / 2);
          context.lineTo(prev.x, prev.y);
          context.lineTo(pt.x, pt.y);
          context.lineTo(width / 2, height / 2);
          context.fill();
          context.stroke();
        }

        prev.x = pt.x;
        prev.y = pt.y;
      });
    }
    if (param.line) {
      context.strokeStyle = param.freqSync === 'line' ? rgba.alpha(param.lineAlpha).css() : chroma(param.lineColor).alpha(param.lineAlpha);
      context.fillStyle = "transparent";
      context.lineWidth = param.lineWidth;
      context.beginPath();

      ptArr.forEach(pt => {
        if (prev.x != null && prev.y != null) {
          context.lineTo(pt.x, pt.y);
        } else {
          context.moveTo(pt.x, pt.y);
        }

        prev.x = pt.x;
        prev.y = pt.y;
      });

      context.fill();
      context.stroke();
    }
    if (param.point) {
      ptArr.forEach(pt => {
        if (prev.x != null && prev.y != null) {
          context.strokeStyle = "transparent";
          context.fillStyle = param.freqSync === 'point' ? rgba.alpha(param.pointAlpha).css() : chroma(param.pointColor).alpha(param.pointAlpha);
          context.beginPath();
          context.arc(pt.x, pt.y, param.pointSize, 0, Math.PI * 2);
          context.fill();
        }

        prev.x = pt.x;
        prev.y = pt.y;
      });
    }
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
