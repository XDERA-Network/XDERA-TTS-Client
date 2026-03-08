const sendBtn = document.getElementById('sendBtn');
const inputText = document.getElementById('inputText');
const backdrop = document.getElementById('backdrop');
const status = document.getElementById('status');
const visualizer = document.getElementById('visualizer');
const bars = document.querySelectorAll('.bar');

let audioCtx = null;
let analyser = null;
let dataArray = null;
let nextStartTime = 0;
let isFinished = false;
let audioQueue = [];
let isPlaybackStarted = false;

const API_Flavour = "[ENTER_YOUR_API_KEY_HERE!]";
inputText.value = "[bright playful energy, quick chatter] heey look who finally showed up, took you long enough you know, [teasing flirty tone] were you getting ready or something or do you just like making me wait on purpose, [light smug laugh, playful energy] wow you really are the worst sometimes but somehow it is still kinda fun hanging around you, [tone softens for a moment] besides it is nicer than going home too early, that place gets really quiet at night, [brief distant tone, almost casual but heavy underneath] ever since everyone left it just feels like a big empty room anyway, [quick upbeat switch, playful again] so yeah you are basically my excuse to stay out longer now, lucky you, [cheeky flirty finish] so do not disappear on me okay~";

function syncHighlight() {
    const text = inputText.value;
    const highlighted = text.replace(/\[([^\]]+)\]/g, '<span class="tag">[$1]</span>');
    backdrop.innerHTML = highlighted + (text.endsWith('\n') ? '\n' : '');
}

inputText.oninput = syncHighlight;
inputText.onscroll = () => {
    backdrop.scrollTop = inputText.scrollTop;
    backdrop.scrollLeft = inputText.scrollLeft;
};

syncHighlight();

function pcmToFloat32(array) {
    const int16 = new Int16Array(array.buffer, array.byteOffset, array.byteLength / 2);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
    return float32;
}

function initVisualizer() {
    if (analyser) return;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        bars.forEach((bar, i) => {
            const val = dataArray[i % dataArray.length];
            const height = Math.max(2, (val / 255) * 14);
            bar.style.height = `${height}px`;
            if (val > 20) bar.classList.add('active');
            else bar.classList.remove('active');
        });
    };
    draw();
}

function processQueue() {
    while (audioQueue.length > 0) {
        const array = audioQueue.shift();
        const float32 = pcmToFloat32(array);
        const buffer = audioCtx.createBuffer(1, float32.length, 25605);
        buffer.getChannelData(0).set(float32);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);

        const now = audioCtx.currentTime;
        if (nextStartTime < now) nextStartTime = now + 0.1;

        source.start(nextStartTime);
        nextStartTime += buffer.duration;

        source.onended = () => {
            if (isFinished && audioCtx.currentTime >= nextStartTime - 0.1) {
                isPlaybackStarted = false;
                status.innerText = "Complete";
                setTimeout(() => {
                    status.innerText = "Ready";
                    sendBtn.disabled = false;
                }, 2000);
            }
        };
    }
}

sendBtn.onclick = async () => {
    const text = inputText.value.trim();
    if (!text) return;

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        initVisualizer();
    }
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const wsUrl = `wss://server.rce.my.id/xdera/project/api/tts?key=${API_Flavour}`;
    const ws = new WebSocket(wsUrl);

    sendBtn.disabled = true;
    status.innerText = "Initializing...";
    nextStartTime = 0;
    isFinished = false;
    audioQueue = [];
    isPlaybackStarted = false;

    ws.onopen = () => {
        status.innerText = "Buffering...";
        ws.send(text);
    };

    ws.onmessage = async (event) => {
        let rawData = event.data;
        if (rawData instanceof Blob) rawData = await rawData.text();

        let data;
        try {
            data = JSON.parse(rawData);
        } catch (e) {
            return;
        }

        if (data.error) {
            status.innerText = "Error";
            alert(data.error);
            sendBtn.disabled = false;
            return;
        }

        if (data.audio_chunk) {
            const binary = atob(data.audio_chunk);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

            audioQueue.push(array);
            if (!isPlaybackStarted) {
                isPlaybackStarted = true;
                status.innerText = "Streaming...";
            }
            processQueue();
        }

        if (data.done) {
            isFinished = true;
            processQueue();
        }
    };

    ws.onerror = () => {
        status.innerText = "Error";
        sendBtn.disabled = false;
    };

    ws.onclose = () => {
        if (!isFinished) status.innerText = "Disconnected";
    };
};
