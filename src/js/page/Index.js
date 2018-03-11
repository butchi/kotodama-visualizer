import qs from 'qs';
import ns from '../module/ns';
import AnalyticSignal from '../module/analytic-signal';

export default () => {
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

  const initializeWithUserMedia = () => {
    const stageElm = document.querySelector('[data-js-stage]');
    const $btnPlay = $('[data-js-btn-play]');

    let frequencyData;
    let timeDomainData;

    let cnt = 0;

    const audioContext = new AudioContext();

    if(navigator.getUserMedia) {
      navigator.getUserMedia(
        {audio : true},
        (stream) => {
          const audioElm = document.querySelector('[data-js-output]');

          const url = URL.createObjectURL(stream);
          audioElm.src = url;
          audioElm.volume = 0;
          const audioContext = new AudioContext();
          const mediastreamsource = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          const frequencyData = new Uint8Array(analyser.frequencyBinCount);
          timeDomainData = new Uint8Array(analyser.frequencyBinCount);
          mediastreamsource.connect(analyser);

          const fftSize = analyser.fftSize;
          const sampleRate = audioContext.sampleRate;

          const kotodamaArr = [];

          let analyticSignal;

          const addTama = () => {
            analyticSignal = new AnalyticSignal({
              stageElm,
              fftSize,
              sampleRate,
            });

            kotodamaArr.push(analyticSignal);
          };

          setInterval(() => {
            addTama()
          }, 3000);

          addTama();

          const ticker = () => {
            cnt++;

            analyser.getByteFrequencyData(frequencyData);
            analyser.getByteTimeDomainData(timeDomainData);

            analyticSignal.draw({
              frequencyData,
              timeDomainData,
            });

            requestAnimationFrame(ticker);
          }

          ticker();
        },
        (err) => {
          console.log("The following error occured: " + err);
        }
      )
    }
  }

  initializeWithUserMedia();
}
