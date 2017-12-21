import ns from '../module/ns';
import { kernelLen, amp, width, height } from '../module/config';
import { inv, normalize, maxIndexOf, mod, norm, getHexString, generatePolygons, generateCircles, generateLines, generatePolylinePoints } from '../module/util';
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

          const fragmentTxtArr = [];

          let cnt = 0;
          const ghostLen = 10;

          const ticker = () => {
            cnt++;

            // // 間引き処理
            // if (cnt % 10 !== 0) {
            //   requestAnimationFrame(ticker);
            //   return;
            // }

            analyser.getByteFrequencyData(frequencyData);
            analyser.getByteTimeDomainData(timeDomainData);

            const hzUnit = audioContext.sampleRate / analyser.fftSize; // frequencyData 1つあたりの周波数
            const hz = maxIndexOf(frequencyData) * hzUnit;
            const baseHz = 243; // C4
            const octave = Math.log(hz/baseHz) / Math.log(2);

            const hue = mod(octave, 1) * 360;
            const hexString = tinycolor({ h: (hue || 0), s: 100, v: 100 }).toHexString();

            const ptArr = [];

            stageElm.innerHTML = '';

            for (let i = kernelLen, l = timeDomainData.length - kernelLen; i < l; i++) {
              let hilbTmp = 0;
              for (let k = - kernelLen; k <= kernelLen; k++) {
                hilbTmp += inv(k) * (normalize(timeDomainData[i + k]) || 0);
              }
              const re = normalize(timeDomainData[i]);
              const im = hilbTmp;
              const x = width / 2 + amp * re;
              const y = height / 2 - amp * im;

              const volume = norm(re, im);

              ptArr.push({re, im, x, y, hue, volume, amp});
            }

            const volAvg = _.meanBy(ptArr, 'volume');
            const opacity = Math.min(Math.pow(volAvg, 2) * 10, 1);

            // ns.fragmentTxt = `<g fill="${getHexString(hue)}" opacity="${opacity}">${generateCircles(ptArr)}</g>`;
            // ns.fragmentTxt = `<polyline points="${generatePolylinePoints(ptArr)}" fill="${hexString}" fill-opacity="${opacity}"></polyline>`;
            ns.fragmentTxt = `<g>${generatePolygons(ptArr, 0.1)}</g>`;
            fragmentTxtArr.push(ns.fragmentTxt);

            stageElm.innerHTML = _.takeRight(fragmentTxtArr, ghostLen).join('');

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
      damaElm.innerHTML = ns.fragmentTxt;
    });
  }

  window.addEventListener("load", initialize, false);
}
