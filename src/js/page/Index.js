import ns from '../module/ns';
import { kernelLen, amp, width, height } from '../module/config';
import { inv, normalize, maxIndexOf, mod } from '../module/util';
import AnalyticSignal from '../module/analytic-signal';

export default () => {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  const initialize = () => {

    var audioElm = document.getElementById("audio");
    var $output = $(".output");
    var canvasElm = document.getElementById("canvas");
    var canvasContext = canvasElm.getContext("2d");
    var timeDomainData;

    canvasElm.width = width;
    canvasElm.height = height;

    if(navigator.getUserMedia) {
      navigator.getUserMedia(
        {audio : true},
        (stream) => {
          var url = URL.createObjectURL(stream);
          audioElm.src = url;
          audioElm.volume = 0;
          var audioContext = new AudioContext();
          var mediastreamsource = audioContext.createMediaStreamSource(stream);
          var analyser = audioContext.createAnalyser();
          var frequencyData = new Uint8Array(analyser.frequencyBinCount);
          timeDomainData = new Uint8Array(analyser.frequencyBinCount);
          mediastreamsource.connect(analyser);

          const animation = () => {
            analyser.getByteFrequencyData(frequencyData);
            analyser.getByteTimeDomainData(timeDomainData);

            var hzUnit = audioContext.sampleRate / analyser.fftSize; // frequencyData 1つあたりの周波数
            var hz = maxIndexOf(frequencyData) * hzUnit;
            var baseHz = 243; // C4
            var octave = Math.log(hz/baseHz) / Math.log(2);
            var hue = mod(octave, 1) * 360;
            // ns.currentHue = hue;

            var i, k;
            canvasContext.clearRect(0, 0, width, height);
            canvasContext.strokeStyle = tinycolor({ h: hue, s: 100, v: 100 }).toRgbString();
            canvasContext.beginPath();

            for (var i = kernelLen, l = timeDomainData.length - kernelLen; i < l; i++) {
              var hilbTmp = 0;
              for(k = -kernelLen; k <= kernelLen; k++) {
                hilbTmp += inv(k) * (normalize(timeDomainData[i + k]) || 0);
              }
              var x = width/2 + amp * normalize(timeDomainData[i]);
              var y = height/2 - amp * hilbTmp;
              canvasContext.lineTo(x, y);
            }
            canvasContext.stroke();

            requestAnimationFrame(animation);
          };

          animation();

        },
        (err) => {
          console.log("The following error occured: " + err);
        }
      );
    } else {
      console.log("getUserMedia not supported");
    }
  }

  window.addEventListener("load", initialize, false);
}