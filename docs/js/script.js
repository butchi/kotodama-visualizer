import "https://code.jquery.com/jquery-3.6.3.min.js"
import AnalyticSignal from "./module/analytic-signal.mjs"

const stageElm = document.querySelector("[data-js-canvas]")
const videoElm = document.querySelector("[data-js-video]")
const btnPlayElm = document.querySelector("[data-js-btn-play]")

let timeDomainData

let cnt = 0

$(globalThis).on("resize", _ => {
    stageElm.width = $(globalThis).width()
    stageElm.height = $(globalThis).height()
    videoElm.width = $(globalThis).width()
    videoElm.height = $(globalThis).height()
    stageElm.style.visibility = "visible"
}).trigger("resize")

async function initializeWithUserMedia(constraints) {
    let stream = null

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (constraints.video) {
            stream = await navigator.mediaDevices.getDisplayMedia(constraints)
        } else {
            stream = await navigator.mediaDevices.getUserMedia(constraints)
        }

        const audioElm = document.querySelector("[data-js-output]")

        audioElm.srcObject = stream
        audioElm.volume = 0
        const audioContext = new AudioContext()
        const mediastreamsource = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        const frequencyData = new Float32Array(analyser.frequencyBinCount)
        const timeDomainData = new Float32Array(analyser.frequencyBinCount)
        mediastreamsource.connect(analyser)

        const fftSize = analyser.fftSize
        const sampleRate = audioContext.sampleRate

        const analyticSignal = new AnalyticSignal({
            stageElm,
            fftSize,
            sampleRate,
        })

        const ticker = _ => {
            cnt++

            analyser.getFloatFrequencyData(frequencyData)
            analyser.getFloatTimeDomainData(timeDomainData)

            analyticSignal.draw({
                frequencyData,
                timeDomainData,
            })

            requestAnimationFrame(ticker)
        }

        ticker()
    } catch (err) {
        console.log(err)
    }
}

const initializeWithAudio = ({ audioName }) => {
    const url = `audio/${audioName}.mp3`

    const stageElm = document.querySelector("canvas")

    let frequencyData
    let timeDomainData

    let cnt = 0

    const audioContext = new AudioContext()

    const decodeAudioDataHandler = buffer => {
        if (!buffer) {
            console.log("error")
            return
        }
        const sourceNode = audioContext.createBufferSource(); // AudioBufferSourceNodeを作成
        sourceNode.buffer = buffer; // 取得した音声データ(バッファ)を音源に設定
        const analyser = audioContext.createAnalyser(); // AnalyserNodeを作成

        frequencyData = new Float32Array(analyser.frequencyBinCount)
        timeDomainData = new Float32Array(analyser.frequencyBinCount)

        sourceNode.connect(analyser); // AudioBufferSourceNodeをAnalyserNodeに接続
        analyser.connect(audioContext.destination);  // AnalyserNodeをAudioDestinationNodeに接続
        sourceNode.start(0); // 再生開始

        const fftSize = analyser.fftSize
        const sampleRate = audioContext.sampleRate

        const analyticSignal = new AnalyticSignal({
            stageElm,
            fftSize,
            sampleRate,
        })

        const ticker = _ => {
            cnt++

            analyser.getFloatFrequencyData(frequencyData)
            analyser.getFloatTimeDomainData(timeDomainData)

            analyticSignal.draw({
                frequencyData,
                timeDomainData,
            })

            requestAnimationFrame(ticker)
        }

        ticker()
    }

    const audioLoadHandler = response => {
        // 取得したデータをデコードする。
        audioContext.decodeAudioData(response, decodeAudioDataHandler, _error => {
            console.log("decodeAudioData error")
        })
    }

    const request = new XMLHttpRequest()
    request.open("GET", url, true)
    request.responseType = "arraybuffer"

    request.onload = _ => {
        audioLoadHandler(request.response)
    }

    request.send()
}

$(btnPlayElm).one("click", _ => {
    let audioName
    $(btnPlayElm).hide()

    const queryString = location.search
    const paramLi = new URLSearchParams(queryString)
    if (paramLi.get("audio")) {
        audioName = paramLi.get("audio")

        initializeWithAudio({ audioName })
    } else if (paramLi.get("display")) {
        initializeWithUserMedia({ video: true, audio: true })
    } else {
        initializeWithUserMedia({ audio: true })
    }
})
