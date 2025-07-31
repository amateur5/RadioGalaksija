document.addEventListener('DOMContentLoaded', () => {
  const waveformDiv = document.getElementById('waveform');
  console.log('DIV waveform pronadjen:', waveformDiv);

  Object.assign(waveformDiv.style, {
    width: '400px',
    height: '100px',
    border: '2px dashed #555',
    resize: 'both',
    overflow: 'auto',
    cursor: 'move',
    background: 'repeating-linear-gradient(45deg, #333, #333 10px, #444 10px, #444 20px)',
    boxSizing: 'border-box',
    padding: '10px',
    position: 'absolute',
    left: '10px',
    top: '200px'
  });

  waveformDiv.onmousedown = function (event) {
    let shiftX = event.clientX - waveformDiv.getBoundingClientRect().left;
    let shiftY = event.clientY - waveformDiv.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
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

  waveformDiv.ondragstart = () => false;

  const innerWaveform = document.createElement('div');
  innerWaveform.style.width = '100%';
  innerWaveform.style.height = '100%';
  waveformDiv.appendChild(innerWaveform);

  console.log('Kreiram wavesurfer...');
  const wavesurfer = WaveSurfer.create({
    container: innerWaveform,
    waveColor: 'yellow',
    progressColor: 'blue',
    height: 80,
    barWidth: 2,
    responsive: true,
    interact: false
  });

  console.log('Ucitam stream...');
  wavesurfer.load('https://stream.zeno.fm/krdfduyswxhtv');

  wavesurfer.on('ready', () => {
    console.log('Stream je spreman, pocinjem reprodukciju...');
    wavesurfer.play();
  });

  wavesurfer.on('error', (e) => {
    console.error('Wavesurfer greska:', e);
  });

  wavesurfer.on('audioprocess', () => {
    const analyser = wavesurfer.backend.getAnalyserNode();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

    console.log('Prosecan nivo zvuka:', avg);

    if (avg < 30) {
      wavesurfer.setWaveColor('yellow');
    } else if (avg < 100) {
      wavesurfer.setWaveColor('blue');
    } else {
      wavesurfer.setWaveColor('red');
    }
  });
});
