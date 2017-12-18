import ns from '../module/ns';
import { inv, normalize, maxIndexOf, mod } from '../module/util';
import AnalyticSignal from '../module/analytic-signal';

export default () => {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  ns.width = 256;
  ns.height = 256;

  ns.tWidth = 128;
  ns.tHeight = 128;

  ns.kernelLen = 127;
  ns.amp = 128;

  function initialize() {

    var audioElm = document.getElementById("audio");
    var $output = $(".output");
    var canvasElm = document.getElementById("canvas");
    var canvasContext = canvasElm.getContext("2d");
    var timeDomainData;
    ns.$stage = $('.snapshot');

    canvasElm.width = ns.width;
    canvasElm.height = ns.height;

    if(navigator.getUserMedia) {
      navigator.getUserMedia(
        {audio : true},
        function(stream) {
          var url = URL.createObjectURL(stream);
          audioElm.src = url;
          audioElm.volume = 0;
          var audioContext = new AudioContext();
          var mediastreamsource = audioContext.createMediaStreamSource(stream);
          var analyser = audioContext.createAnalyser();
          var frequencyData = new Uint8Array(analyser.frequencyBinCount);
          timeDomainData = new Uint8Array(analyser.frequencyBinCount);
          mediastreamsource.connect(analyser);

          var animation = function(){
            analyser.getByteFrequencyData(frequencyData);
            analyser.getByteTimeDomainData(timeDomainData);

            var hzUnit = audioContext.sampleRate / analyser.fftSize; // frequencyData 1つあたりの周波数
            var hz = maxIndexOf(frequencyData) * hzUnit;
            var baseHz = 243; // C4
            var octave = Math.log(hz/baseHz) / Math.log(2);
            var hue = mod(octave, 1) * 360;
            ns.currentHue = hue;

            var i, k;
            canvasContext.clearRect(0, 0, ns.width, ns.height);
            canvasContext.strokeStyle = tinycolor({ h: hue, s: 100, v: 100 }).toRgbString();
            canvasContext.beginPath();

            for (var i = ns.kernelLen, l = timeDomainData.length - ns.kernelLen; i < l; i++) {
              var hilbTmp = 0;
              for(k = -ns.kernelLen; k <= ns.kernelLen; k++) {
                hilbTmp += inv(k) * (normalize(timeDomainData[i + k]) || 0);
              }
              var x = ns.width/2 + ns.amp * normalize(timeDomainData[i]);
              var y = ns.height/2 - ns.amp * hilbTmp;
              canvasContext.lineTo(x, y);
            }
            canvasContext.stroke();

            requestAnimationFrame(animation);
          };

          animation();

        },
        function(err) {
          console.log("The following error occured: " + err);
        }
      );
    } else {
      console.log("getUserMedia not supported");
    }

    $('.btn-rec').on('click', function() {
      var as = new AnalyticSignal(timeDomainData);
      as.$canvas.css('left', 300 + Math.random()*500);
      as.$canvas.css('top', Math.random()*500);
      as.draw(ns.currentHue);
      as.play();
    });
  }

  window.addEventListener("load", initialize, false);
}