import ns from './ns';
import { inv, normalize } from './util';

export default class AnalyticSignal {
  constructor(arr) {
    this.origArr = new Uint8Array(arr.length);
    for (var n = 0; n < arr.length; n++) {
      this.origArr[n] = arr[n];
    }

    this.state = 'stop';

    this.reArr = new Array();
    this.imArr = new Array();

    this.vol = 0;

    for (var i = ns.kernelLen, l = arr.length - ns.kernelLen; i < l; i++) {
      var hilbTmp = 0;
      for (var k = -ns.kernelLen; k <= ns.kernelLen; k++) {
        hilbTmp += inv(k) * (normalize(arr[i + k]) || 0);
      }
      var reVal = normalize(arr[i]);
      var imVal = hilbTmp;

      this.reArr.push(reVal);
      this.imArr.push(imVal);

      this.vol = Math.max(this.vol, Math.sqrt(reVal*reVal+imVal*imVal));
    }

    this.$canvas = $('<canvas></canvas>');
    this.$canvas.attr('width', ns.width);
    this.$canvas.attr('height', ns.height);
    ns.$stage.append(this.$canvas);

    var me = this;
    this.$canvas.on('mousedown', function(evt) {
      me.state = 'move';
      me.play();

      $('body').on('mousemove', function(evt) {
        if(me.state === 'move') {
          me.$canvas.css({
            'left': evt.pageX - ns.tWidth/2,
            'top': evt.pageY - ns.tHeight/2
          });
        }
      });
    });

    this.$canvas.on('mouseup', function(evt) {
      me.state = 'stop';
      $('body').off('mousemove');
    });
  }

  draw(hue) {
    var canvasContext = this.$canvas.get(0).getContext("2d");

    canvasContext.clearRect(0, 0, ns.width, ns.height);
    canvasContext.strokeStyle = tinycolor({ h: (hue || 0), s: 100, v: 100 }).toRgbString();
    canvasContext.beginPath();

    var len = this.reArr.length;
    for (var i = 0; i < len; i++) {
      var x, y;
      x = ns.width/2 + ns.amp * this.reArr[i];
      y = ns.height/2 - ns.amp * this.imArr[i];
      canvasContext.lineTo(x, y);
    }
    canvasContext.stroke();

    // volume circle
    // canvasContext.beginPath();
    // canvasContext.strokeStyle = 'rgb(128, 128, 128)';
    // canvasContext.arc(ns.width/2, ns.height/2, this.vol*ns.amp, 0, Math.PI*2, true);;
    // canvasContext.stroke();
  };

  play() {
    //Create the instance of AudioBuffer (Synchronously)
    var context = new AudioContext();
    var audioBuffer = context.createBuffer(1, 1024, context.sampleRate);
    // var audioBuffer = context.createBuffer(channel, length, context.sampleRate);

    var data = audioBuffer.getChannelData(0);
    var i;
    for(i=0; i<this.origArr.length; i++) {
      data[i] = (this.origArr[i]-128)/128;
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