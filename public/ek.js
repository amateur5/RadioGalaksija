// Napravi i stilizuj div
const waveformDiv = document.getElementById('waveform');
waveformDiv.style.width = '400px';
waveformDiv.style.height = '100px';
waveformDiv.style.border = '2px dashed #555';
waveformDiv.style.resize = 'both';
waveformDiv.style.overflow = 'auto';
waveformDiv.style.cursor = 'move';
waveformDiv.style.background = 'repeating-linear-gradient(45deg, #333, #333 10px, #444 10px, #444 20px)';
document.body.style.background = '#000';

// Drag funkcija
waveformDiv.onmousedown = function (event) {
  let shiftX = event.clientX - waveformDiv.getBoundingClientRect().left;
  let shiftY = event.clientY - waveformDiv.getBoundingClientRect().top;

  function moveAt(pageX, pageY) {
    waveformDiv.style.position = 'absolute';
    waveformDiv.style.left = pageX - shiftX + 'px';
    waveformDiv.style.top = pageY - shiftY + 'px';
  }

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  document.addEventListener('mousemove', onMouseMove);

  waveformDiv.onmouseup = function () {
    document.removeEventListener('mousemove', onMouseMove);
    waveformDiv.onmouseup = null;
  };
};

waveformDiv.ondragstart = function () {
  return false;
};

// Wavesurfer
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'yellow',
  progressColor: 'blue',
  height: 100,
  barWidth: 2,
  responsive: true,
  interact: false
});

wavesurfer.load('https://stream.zeno.fm/krdfduyswxhtv');

// Boja po jačini strima (ne output zvuk!)
wavesurfer.on('audioprocess', () => {
  const analyser = wavesurfer.backend.getAnalyserNode();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  let avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

  if (avg < 30) {
    wavesurfer.setWaveColor('yellow');
  } else if (avg < 100) {
    wavesurfer.setWaveColor('blue');
  } else {
    wavesurfer.setWaveColor('red');
  }
});
