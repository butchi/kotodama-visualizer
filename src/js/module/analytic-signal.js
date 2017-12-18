import ns from './ns';
import { kernelLen, amp, width, height } from './config';
import { inv, normalize } from './util';

export default class AnalyticSignal {
  constructor(arr) {
    this.origArr = new Uint8Array(arr.length);
    for (let n = 0; n < arr.length; n++) {
      this.origArr[n] = arr[n];
    }

    this.state = 'stop';

    this.reArr = new Array();
    this.imArr = new Array();

    this.vol = 0;

    for (let i = kernelLen, l = arr.length - kernelLen; i < l; i++) {
      let hilbTmp = 0;
      for (var k = -kernelLen; k <= kernelLen; k++) {
        hilbTmp += inv(k) * (normalize(arr[i + k]) || 0);
      }
      const reVal = normalize(arr[i]);
      const imVal = hilbTmp;

      this.reArr.push(reVal);
      this.imArr.push(imVal);

      this.vol = Math.max(this.vol, Math.sqrt(reVal*reVal+imVal*imVal));
    }
  }

  draw(hue) {
    const canvasContext = this.$canvas.get(0).getContext("2d");

    canvasContext.clearRect(0, 0, width, height);
    canvasContext.strokeStyle = tinycolor({ h: (hue || 0), s: 100, v: 100 }).toRgbString();
    canvasContext.beginPath();

    const len = this.reArr.length;
    for (let i = 0; i < len; i++) {
      const x = width / 2 + amp * this.reArr[i];
      const y = height / 2 - amp * this.imArr[i];
      canvasContext.lineTo(x, y);
    }
    canvasContext.stroke();
  };

  play() {
    //Create the instance of AudioBuffer (Synchronously)
    const context = new AudioContext();
    const audioBuffer = context.createBuffer(1, 1024, context.sampleRate);
    // var audioBuffer = context.createBuffer(channel, length, context.sampleRate);

    const data = audioBuffer.getChannelData(0);
    for(let i = 0; i < this.origArr.length; i++) {
      data[i] = (this.origArr[i] - 128) / 128;
    }

    //Create the instance of AudioBufferSourceNode
    var source = context.createBufferSource();
    //Set the instance of AudioBuffer
    source.buffer = audioBuffer;

    source.loop               = true;
    source.loopStart          = 0;
    source.loopEnd            = audioBuffer.duration;
    source.playbackRate.value = 1.0;
    //AudioBufferSourceNode (input) -> AudioDestinationNode (output)
    source.connect(context.destination);

    source.start(0);
    source.stop(0.5);
  }
}