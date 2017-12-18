import ns from '../module/ns';
import { kernelLen, amp, width, height } from '../module/config';
import { inv, normalize, maxIndexOf, mod } from '../module/util';
import AnalyticSignal from '../module/analytic-signal';

export default () => {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  const initialize = () => {

    const audioElm = document.getElementById("audio");
    const $output = $(".output");
    const canvasElm = document.getElementById("canvas");
    const canvasContext = canvasElm.getContext("2d");
    let timeDomainData;

    canvasElm.width = width;
    canvasElm.height = height;

    if(navigator.getUserMedia) {
      navigator.getUserMedia(
        {audio : true},
        (stream) => {
          const url = URL.createObjectURL(stream);
          audioElm.src = url;
          audioElm.volume = 0;
          const audioContext = new AudioContext();
          const mediastreamsource = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          const frequencyData = new Uint8Array(analyser.frequencyBinCount);
          timeDomainData = new Uint8Array(analyser.frequencyBinCount);
          mediastreamsource.connect(analyser);

          const animation = () => {
            analyser.getByteFrequencyData(frequencyData);
            analyser.getByteTimeDomainData(timeDomainData);

            const hzUnit = audioContext.sampleRate / analyser.fftSize; // frequencyData 1つあたりの周波数
            const hz = maxIndexOf(frequencyData) * hzUnit;
            const baseHz = 243; // C4
            const octave = Math.log(hz/baseHz) / Math.log(2);
            const hue = mod(octave, 1) * 360;
            // ns.currentHue = hue;

            canvasContext.clearRect(0, 0, width, height);
            canvasContext.strokeStyle = tinycolor({ h: hue, s: 100, v: 100 }).toRgbString();
            canvasContext.beginPath();

            for (let i = kernelLen, l = timeDomainData.length - kernelLen; i < l; i++) {
              let hilbTmp = 0;
              for(let k = -kernelLen; k <= kernelLen; k++) {
                hilbTmp += inv(k) * (normalize(timeDomainData[i + k]) || 0);
              }
              const x = width/2 + amp * normalize(timeDomainData[i]);
              const y = height/2 - amp * hilbTmp;
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