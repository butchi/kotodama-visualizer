import ns from '../module/ns';
import AnalyticSignal from '../module/analytic-signal';

export default () => {
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

  const initialize = () => {
    const url = 'audio/vivaldi-spring.mp3';

    const stageElm = document.querySelector('[data-js-stage]');
    const $btnPlay = $('[data-js-btn-play]');

    let frequencyData;
    let timeDomainData;

    let cnt = 0;

    const audioContext = new AudioContext();

    const decodeAudioDataHandler = (buffer) => {
      if (!buffer) {
        console.log('error');
        return;
      }

      const sourceNode = audioContext.createBufferSource(); // AudioBufferSourceNodeを作成
      sourceNode.buffer = buffer; // 取得した音声データ(バッファ)を音源に設定
      const analyser = audioContext.createAnalyser(); // AnalyserNodeを作成

      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      timeDomainData = new Uint8Array(analyser.frequencyBinCount);

      sourceNode.connect(analyser); // AudioBufferSourceNodeをAnalyserNodeに接続
      analyser.connect(audioContext.destination);  // AnalyserNodeをAudioDestinationNodeに接続
      sourceNode.start(0); // 再生開始

      const fftSize = analyser.fftSize;
      const sampleRate = audioContext.sampleRate;

      const analyticSignal = new AnalyticSignal({
        stageElm,
        fftSize,
        sampleRate,
      });

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
    }

    const audioLoadHandler = (response) => {
      // 取得したデータをデコードする。
      audioContext.decodeAudioData(response, decodeAudioDataHandler, (error) => {
        console.log('decodeAudioData error');
      });
    }

    $btnPlay.on('click', (_evt) => {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = () => {
        audioLoadHandler(request.response);
      }

      request.send();
    });
  }

  window.addEventListener("load", initialize, false);
}
