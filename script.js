let metronomeInterval;
let beatsPerMinute = 120;
let beatsPerBar = 4;
let currentBeat = 0;
let tapTimes = [];

const firstBeatSound = new Audio('1.mp3');
const otherBeatSound = new Audio('2.mp3');

// Получаем элементы управления
// const startButton = document.getElementById('start');
// const stopButton = document.getElementById('stop');
const bpmInput = document.getElementById('bpm');
const bpmSlider = document.getElementById('bpm-slider');
const tapTempoButton = document.getElementById('tap-tempo');
const beatsPerBarButton = document.getElementById('beats-per-bar');
const speedTrainerBtn = document.getElementById('speed-trainer-btn');

const toggleMetronomeButton = document.getElementById('toggle-metronome');

let isMetronomeRunning = false;

toggleMetronomeButton.addEventListener('click', toggleMetronome);

document.addEventListener('keydown', function(event) {
    toggleMetronomeButton.blur();
    if (event.key === ' ' || event.code === 'Space') {
        toggleMetronome();
    }
});

// Добавляем обработчик события для кнопки "Старт/Стоп"
function toggleMetronome() {
    console.log('toogle');
    if (metronome) {
        if (isMetronomeRunning) {
            // Если метроном запущен, останавливаем его
            // metronome.stop();
            stopMetronome();
        } else {
            // Если метроном остановлен, запускаем его
            // metronome.start();
            startMetronome();
        }

        // Инвертируем состояние
        isMetronomeRunning = !isMetronomeRunning;
    }
};

function startMetronome() {
    stopMetronome(); // Stop previous metronome if running

    const isSpeedTrainerActive = document.getElementById('speed-trainer-btn').classList.contains('active');

    if (isSpeedTrainerActive) {
        startSpeedTrainer();
    } else {
        beatsPerMinute = parseInt(document.getElementById('bpm').value, 10);
        beatsPerBar = parseInt(document.getElementById('beats-per-bar').value, 10);

        const millisecondsPerBeat = 60000 / beatsPerMinute;
        metronomeInterval = setInterval(playBeat, millisecondsPerBeat);
    }
    // startButton.disabled = true;
    toggleMetronomeButton.textContent = 'СТОП';
    toggleMetronomeButton.classList.add('active');
    tapTempoButton.disabled = true;
    bpmInput.disabled = true;
    bpmSlider.disabled = true;
    beatsPerBarButton.disabled = true;
    speedTrainerBtn.disabled = true;
}

function stopMetronome() {
    clearInterval(metronomeInterval);
    currentBeat = 0;
    updateMetronomeDisplay();
    // startButton.disabled = false;
    toggleMetronomeButton.textContent = 'СТАРТ';
    toggleMetronomeButton.classList.remove('active');
    tapTempoButton.disabled = false;
    bpmInput.disabled = false;
    bpmSlider.disabled = false;
    beatsPerBarButton.disabled = false;
    speedTrainerBtn.disabled = false;
}

// Слушаем изменения значения в поле ввода
bpmInput.addEventListener('input', function() {
    const bpmValue = parseInt(bpmInput.value);
    updateMetronomeSpeed(bpmValue);
});

// Слушаем изменения значения ползунка
bpmSlider.addEventListener('input', function() {
    const bpmValue = parseInt(bpmSlider.value);
    updateMetronomeSpeed(bpmValue);
});

function updateMetronomeSpeed(bpm) {
    // Обновляем значение в поле ввода
    bpmInput.value = bpm;
    
    // Обновляем значение на ползунке
    bpmSlider.value = bpm;

    // Обновляем скорость метронома
    // metronome.setBPM(bpm);

    // Обновляем отображение текущей скорости
    updateMetronomeDisplay();
}

function playBeat() {
    currentBeat = (currentBeat % beatsPerBar) + 1;
    updateMetronomeDisplay();

    if (currentBeat === 1) {
        firstBeatSound.play();

        // Добавляем класс для анимации пульсации и изменения цвета на первом ударе только для числового значения
        document.getElementById('current-bpm').classList.add('pulsating');
        document.getElementById('current-bpm').style.color = '#ff0000';
        
        // Возвращаем к обычному цвету и размеру после анимации
        setTimeout(function() {
            document.getElementById('current-bpm').classList.remove('pulsating');
            document.getElementById('current-bpm').style.color = '#333';
        }, 500);
    } else {
        otherBeatSound.play();
    }
}

function updateMetronomeDisplay() {
    document.getElementById('metronome').innerText = currentBeat;
}

function calculateAverageBPM() {
    if (tapTimes.length < 2) {
        return beatsPerMinute; // Use the current value if less than two taps
    }

    const timeDiff1 = tapTimes[1] - tapTimes[0];
    const averageTimeDiff = timeDiff1;

    // Calculate the average time between taps and convert it to BPM
    const averageBPM = 60000 / averageTimeDiff;

    return averageBPM;
}

function updateBPMInput() {
    document.getElementById('bpm').value = Math.round(beatsPerMinute);
    document.getElementById('current-speed').innerText = `Текущая скорость: ${Math.round(beatsPerMinute)} BPM`;
}

document.getElementById('tap-tempo').addEventListener('click', function() {
    const tapTime = Date.now();
    tapTimes.push(tapTime);

    // Keep only the last two taps
    if (tapTimes.length > 2) {
        tapTimes.shift();
    }

    // Update the metronome tempo immediately when tapping
    beatsPerMinute = calculateAverageBPM();
    updateBPMInput();
});

function toggleSpeedTrainerControls() {
    const speedTrainerControls = document.getElementById('speed-trainer-controls');
    const speedTrainerButton = document.getElementById('speed-trainer-btn');

    if (speedTrainerControls.style.display === 'none') {
        speedTrainerControls.style.display = 'block';
        speedTrainerButton.classList.add('active');
    } else {
        speedTrainerControls.style.display = 'none';
        speedTrainerButton.classList.remove('active');
    }
}

let repetitionsCounter = 0;

function startSpeedTrainer() {
    const initialBPM = parseInt(document.getElementById('initial-bpm').value, 10);
    const finalBPM = parseInt(document.getElementById('final-bpm').value, 10);
    const beatsBeforeChange = parseInt(document.getElementById('beats-before-change').value, 10);
    const bpmIncrease = parseInt(document.getElementById('bpm-increase').value, 10);

    stopMetronome(); // Stop previous metronome if running
    beatsPerMinute = initialBPM;
    updateBPMInput();
    repetitionsCounter = 0; // Сбросим счетчик повторений

    let millisecondsPerBeat = 60000 / beatsPerMinute; // Инициализация

    function updateMetronome() {
        playBeat();

        if (currentBeat === 1) {
            repetitionsCounter++; // Увеличиваем счетчик при первом ударе
        }

        if (repetitionsCounter === beatsBeforeChange) {
            beatsPerMinute += bpmIncrease;
            updateBPMInput();
            repetitionsCounter = 0; // Сбросим счетчик повторений
            millisecondsPerBeat = 60000 / beatsPerMinute; // Обновляем значение

            if (beatsPerMinute > finalBPM) {
                beatsPerMinute = finalBPM;
                updateBPMInput();
            }

            clearInterval(metronomeInterval); // Очищаем предыдущий интервал
            metronomeInterval = setInterval(updateMetronome, millisecondsPerBeat); // Создаем новый интервал
        }
    }

    metronomeInterval = setInterval(updateMetronome, millisecondsPerBeat);
}



