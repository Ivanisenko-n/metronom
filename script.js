let metronomeInterval;
let beatsPerMinute = 120;
let currentBeat = 0;
let tapTimes = [];
let selectedValue = 4;

const firstBeatSound = new Audio('1.mp3');
const otherBeatSound = new Audio('2.mp3');

// Получаем элементы управления
// const startButton = document.getElementById('start');
// const stopButton = document.getElementById('stop');
const bpmInput = document.getElementById('bpm');
const bpmSlider = document.getElementById('bpm-slider');
const tapTempoButton = document.getElementById('tap-tempo');
const speedTrainerBtn = document.getElementById('speed-trainer-btn');

const toggleMetronomeButton = document.getElementById('toggle-metronome');

let isMetronomeRunning = false;

toggleMetronomeButton.addEventListener('click', toggleMetronome);

// Вызываем функцию для установки начального значения
setupSegmentedControl();

document.addEventListener('keydown', function(event) {
    toggleMetronomeButton.blur();
    if (event.key === ' ' || event.code === 'Space') {
        toggleMetronome();
    }
});



// Добавляем обработчик события для кнопки "Старт/Стоп"
function toggleMetronome() {
    // if (metronome) {
        if (isMetronomeRunning) {
            // Если метроном запущен, останавливаем его
            stopMetronome();
        } else {
            // Если метроном остановлен, запускаем его
            startMetronome();
        }

        // Инвертируем состояние
        isMetronomeRunning = !isMetronomeRunning;
    // }
};

function startMetronome() {
    stopMetronome(); // Stop previous metronome if running

    const isSpeedTrainerActive = $('#speed-trainer-btn').hasClass('active');

    if (isSpeedTrainerActive) {
        startSpeedTrainer();
    } else {
        beatsPerMinute = parseInt($('#bpm').val(), 10);
        // selectedValue = parseInt($('#beats-per-bar').val(), 10);
        setupSegmentedControl();

        const millisecondsPerBeat = 60000 / beatsPerMinute;
        metronomeInterval = setInterval(playBeat, millisecondsPerBeat);
    }
    
    // $('#start').prop('disabled', true);
    $('#toggle-metronome').text('СТОП (SPACE)').addClass('active');
    $('#tap-tempo').prop('disabled', true);
    $('#bpm').prop('disabled', true);
    $('#bpm-slider').prop('disabled', true);
    $('#speed-trainer-btn').prop('disabled', true);
    updateMetronomeDisplay();
}

function stopMetronome() {
    clearInterval(metronomeInterval);
    currentBeat = 0;
    updateMetronomeDisplay();
    // $('#start').prop('disabled', false);
    $('#toggle-metronome').text('СТАРТ (SPACE)').removeClass('active');
    $('#tap-tempo').prop('disabled', false);
    $('#bpm').prop('disabled', false);
    $('#bpm-slider').prop('disabled', false);
    $('#speed-trainer-btn').prop('disabled', false);
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

    // Обновляем отображение текущей скорости
    updateMetronomeDisplay();
}

function playBeat() {

    currentBeat = (currentBeat % selectedValue) + 1;
    updateMetronomeDisplay();

    if (currentBeat === 1) {
        firstBeatSound.play();
    } else {
        otherBeatSound.play();
    }
}

function updateMetronomeDisplay() {
    // Удаляем класс active-dot у всех точек
    document.querySelectorAll('.dot').forEach(dot => {
        dot.classList.remove('active-dot');
    });

    // Используем requestAnimationFrame для обновления DOM перед добавлением класса
    requestAnimationFrame(() => {
        // Добавляем класс active-dot к точке, соответствующей текущему биту
        const activeDot = document.querySelector(`.dot:nth-child(${currentBeat})`);
        if (activeDot) {
            activeDot.classList.add('active-dot');
        }
    });
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
    // document.getElementById('current-speed').innerText = `Текущая скорость: ${Math.round(beatsPerMinute)} BPM`;
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
$(document).ready(function() {
  $('#speed-trainer-btn').on('click', function() {
    toggleSpeedTrainerControls();
  });
});
function toggleSpeedTrainerControls() {
    const speedTrainerControls = $('.box-speed-trainer');
    const speedTrainerButton = $('#speed-trainer-btn');
    // const speedTrainerButton = $('#speed-trainer-controls');

    if (speedTrainerControls.css('display') === 'none') {
        speedTrainerControls.css('display', 'block');
        speedTrainerButton.addClass('active');
    } else {
        speedTrainerControls.css('display', 'none');
        speedTrainerButton.removeClass('active');
    }
}


let repetitionsCounter = 0;

function startSpeedTrainer() {
    const initialBPM = parseInt($('#initial-bpm').val(), 10);
    const finalBPM = parseInt($('#final-bpm').val(), 10);
    const beatsBeforeChange = parseInt($('#beats-before-change').val(), 10);
    const bpmIncrease = parseInt($('#bpm-increase').val(), 10);

    stopMetronome(); // Stop previous metronome if running
    beatsPerMinute = initialBPM;
    updateBPMInput();
    repetitionsCounter = 0; // Сбросим счетчик повторений

    let millisecondsPerBeat = 60000 / beatsPerMinute; // Инициализация

    function updateMetronome() {
        // console.log(beatsPerMinute, initialBPM, finalBPM);
        updateProgressBar(beatsPerMinute, initialBPM, finalBPM);
        playBeat();

        if (currentBeat === 4) {
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


function setupSegmentedControl() {
    // Обработчик события изменения для нового блока segmented-control
    document.querySelectorAll('.segmented-control input[type="radio"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            // Получение выбранного значения
            selectedValue = this.value;
            
            // Ваш код для обработки выбранного значения, например:
            // console.log('Выбран размер: ' + selectedValue);
            updateDots(selectedValue);
        });
    });

    // Изначальное выполнение кода для установки начального значения (если нужно)
    document.querySelector('.segmented-control input[type="radio"]:checked').dispatchEvent(new Event('change'));
}
function updateDots(count) {
    const dotsContainer = document.getElementById('dots-container');

    // Очищаем предыдущие точки
    dotsContainer.innerHTML = '';

    // Добавляем новые точки
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dotsContainer.appendChild(dot);
    }
}
// Изменение значение прогресс бара
    function drawProgressBar(initialValue, finalValue) {
        const initialPercent = (initialValue / finalValue) * 100;
        $('#progress').width(`${initialPercent}%`);
    }

    function updateProgressBar(currentValue, initialValue, finalValue) {
        const percentChange = ((currentValue - initialValue) / (finalValue - initialValue)) * 100;
        $('#progress').width(`${percentChange}%`);
        $('.current-progress-speed').text(currentValue);
    }
// ---------

function toggleTheme() {
    const root = $(':root');
    const currentTheme = root.attr('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    root.attr('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

$(document).ready(function () {
    const themeSwitch = $('#switch-1');
    themeSwitch.change(toggleTheme);
});
