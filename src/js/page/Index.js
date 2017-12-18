import ns from '../module/ns';
import { kernelLen, amp, width, height } from '../module/config';
import { inv, normalize, maxIndexOf, mod, generateCircles, generateLines, generatePolylinePoints } from '../module/util';
import AnalyticSignal from '../module/analytic-signal';

export default () => {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  const initialize = () => {

    const audioElm = document.getElementById("audio");
    const stageElm = document.querySelector('[data-js-stage]');
    const damaElm = document.querySelector('[data-js-dama]');
    const playerElm = document.querySelector('[data-js-player]');
    const $btnCapture = $('[data-js-btn-capture]');

    const historyArr = [];

    let timeDomainData;

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

          let time = 0;

          const ticker = () => {
            time++;

            // 間引き処理
            if (time % 10 !== 0) {
              requestAnimationFrame(ticker);
              return;
            }

            analyser.getByteFrequencyData(frequencyData);
            analyser.getByteTimeDomainData(timeDomainData);

            const hzUnit = audioContext.sampleRate / analyser.fftSize; // frequencyData 1つあたりの周波数
            const hz = maxIndexOf(frequencyData) * hzUnit;
            const baseHz = 243; // C4
            const octave = Math.log(hz/baseHz) / Math.log(2);
            const hue = mod(octave, 1) * 360;
            // ns.currentHue = hue;

            let xTmp;
            let yTmp;

            const ptArr = ns.ptArr = [];

            stageElm.innerHTML = '';

            for (let i = kernelLen, l = timeDomainData.length - kernelLen; i < l; i++) {
              let hilbTmp = 0;
              for(let k = -kernelLen; k <= kernelLen; k++) {
                hilbTmp += inv(k) * (normalize(timeDomainData[i + k]) || 0);
              }
              const x = width/2 + amp * normalize(timeDomainData[i]);
              const y = height/2 - amp * hilbTmp;

              ns.ptArr.push({x, y});
            }

            const polylinePointsTxt = generatePolylinePoints(ptArr);

            stageElm.innerHTML = `<g>
  <polyline points="${polylinePointsTxt}" stroke="#000" fill="none"></polyline>
</g>`;

            requestAnimationFrame(ticker);
          };

          ticker();
        },
        (err) => {
          console.log("The following error occured: " + err);
        }
      );
    } else {
      console.log("getUserMedia not supported");
    }

    $btnCapture.on('click', (_evt) => {
      historyArr.push(ns.ptArr);

      const ptArr = _.last(historyArr);

      damaElm.innerHTML = '';

      let xTmp;
      let yTmp;

      const linesTxt = generateLines(ptArr);
      const circlesTxt = generateCircles(ptArr);
      const polylinePointsTxt = generatePolylinePoints(ptArr);

      damaElm.innerHTML = `<g>
  <polyline points="${polylinePointsTxt}" stroke="#000" fill="none"></polyline>
</g>
<g>
  ${circlesTxt}
</g>`;
    });
  }

  window.addEventListener("load", initialize, false);
}
