document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ С ИСПРАВЛЕННЫМИ ПУТЯМИ ---
    const phones = {
        'Xiaomi15U': { image: 'Xiaomi15U.png', stabilizationPoint: { x: '56.82%', y: '23.49%' }, maxZoom: 120 },
        'VivoX200U': { image: 'VivoX200U.png', stabilizationPoint: { x: '44.81%', y: '24.38%' }, maxZoom: 100 }
    };
    const DEV_PASSWORD = 'dev123';
    let currentPhoneRotation = 0, startDragAngle = 0, startPhoneRotation = 0, isDevMode = false;

    // --- ЭЛЕМЕНТЫ DOM (без изменений) ---
    const wrapperBg = document.getElementById('wrapper-bg'); const phoneContainer = document.getElementById('phone-container'); const phoneImage = document.getElementById('phone-image'); const zoomSlider = document.getElementById('zoom-slider'); const zoomValue = document.getElementById('zoom-value'); const phoneSelect = document.getElementById('phone-select'); const knob = document.getElementById('stabilization-knob'); const knobHandle = document.getElementById('knob-handle'); const audio = document.getElementById('audio-source'); const playPauseBtn = document.getElementById('play-pause-btn'); const playIcon = playPauseBtn.querySelector('i'); const timeline = document.getElementById('timeline-container'); const progress = document.getElementById('progress'); const devModeButton = document.getElementById('dev-mode-button'); const devModeInfo = document.getElementById('dev-mode-info'); const passwordModal = document.getElementById('password-modal'); const passwordInput = document.getElementById('password-input'); const passwordSubmit = document.getElementById('password-submit'); const passwordError = document.getElementById('password-error');

    function init() {
        for (const model in phones) {
            const option = document.createElement('option');
            option.value = model; option.textContent = model;
            phoneSelect.appendChild(option);
        }
        updatePhone();
        
        // Обработчики для ПК
        knob.addEventListener('mousedown', onDragStart);
        wrapperBg.addEventListener('wheel', handleMouseWheel, { passive: false });
        // ДОБАВЛЕНЫ ОБРАБОТЧИКИ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ
        knob.addEventListener('touchstart', onDragStart, { passive: false });
        
        // Остальные обработчики
        phoneSelect.addEventListener('change', updatePhone); zoomSlider.addEventListener('input', handleZoom); playPauseBtn.addEventListener('click', togglePlay); audio.addEventListener('timeupdate', updateProgress); timeline.addEventListener('click', setTime); devModeButton.addEventListener('click', () => passwordModal.classList.remove('hidden')); passwordSubmit.addEventListener('click', handlePasswordSubmit); passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) passwordModal.classList.add('hidden'); }); passwordInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handlePasswordSubmit(); }); phoneImage.addEventListener('click', handleDevClick);
    }

    // --- ОБЪЕДИНЕННАЯ ЛОГИКА ВРАЩЕНИЯ (ДЛЯ ПК И МОБИЛЬНЫХ) ---
    function onDragStart(e) {
        e.preventDefault();
        startDragAngle = getAngleFromEvent(e);
        startPhoneRotation = currentPhoneRotation;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove);
        document.addEventListener('touchend', onDragEnd);
    }
    function onDragMove(e) {
        const currentDragAngle = getAngleFromEvent(e);
        const angleDifference = currentDragAngle - startDragAngle;
        currentPhoneRotation = startPhoneRotation + angleDifference;
        applyRotationAndEffects();
    }
    function onDragEnd() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
    }
    // Универсальная функция для получения угла
    function getAngleFromEvent(e) {
        const rect = knob.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
        return angleRad * (180 / Math.PI);
    }

    // ... (остальной код остается без изменений) ...
    function handleMouseWheel(e) { e.preventDefault(); const rotationStep = 5; currentPhoneRotation += e.deltaY > 0 ? rotationStep : -rotationStep; applyRotationAndEffects(); }
    function applyRotationAndEffects() { phoneImage.style.transform = `perspective(1000px) rotateZ(${currentPhoneRotation}deg)`; knobHandle.style.transform = `translateX(-50%) rotate(${currentPhoneRotation}deg)`; const MAX_BLUR = 25; const BLUR_SENSITIVITY = 30; const blurAmount = Math.min(MAX_BLUR, Math.abs(currentPhoneRotation) / BLUR_SENSITIVITY); wrapperBg.style.backdropFilter = `blur(${blurAmount}px)`; }
    function handleZoom() { zoomValue.textContent = parseFloat(zoomSlider.value).toFixed(1); phoneContainer.style.transform = `scale(${zoomSlider.value})`; }
    function updatePhone() { const selectedModel = phoneSelect.value; if (!selectedModel) return; const phoneData = phones[selectedModel]; const originPoint = `${phoneData.stabilizationPoint.x} ${phoneData.stabilizationPoint.y}`; phoneImage.style.transformOrigin = originPoint; phoneContainer.style.transformOrigin = originPoint; phoneImage.src = phoneData.image; zoomSlider.max = phoneData.maxZoom; if (parseFloat(zoomSlider.value) > phoneData.maxZoom) { zoomSlider.value = phoneData.maxZoom; } handleZoom(); currentPhoneRotation = 0; applyRotationAndEffects(); }
    function togglePlay(){if(audio.paused){audio.play();playIcon.classList.replace('fa-play','fa-pause')}else{audio.pause();playIcon.classList.replace('fa-pause','fa-play')}}
    function updateProgress(){const{duration,currentTime}=audio;if(duration){const progressPercent=(currentTime/duration)*100;progress.style.width=`${progressPercent}%`}}
    function setTime(e){const width=this.clientWidth;const clickX=e.offsetX;const duration=audio.duration;if(duration){audio.currentTime=(clickX/width)*duration}}
    function handlePasswordSubmit(){if(passwordInput.value===DEV_PASSWORD){isDevMode=true;passwordModal.classList.add('hidden');devModeInfo.classList.remove('hidden');devModeButton.style.backgroundColor='#4caf50';passwordInput.value='';passwordError.classList.add('hidden')}else{passwordError.classList.remove('hidden')}}
    function handleDevClick(event){ if(!isDevMode)return;event.stopPropagation(); const rect=event.target.getBoundingClientRect();const x=event.clientX-rect.left;const y=event.clientY-rect.top; const xPercent=(x/rect.width*100).toFixed(2);const yPercent=(y/rect.height*100).toFixed(2); const selectedModel=phoneSelect.value; phones[selectedModel].stabilizationPoint={x:`${xPercent}%`,y:`${yPercent}%`}; updatePhone(); const codeToCopy=`'${selectedModel}': {\n    image: '${selectedModel}.png',\n    stabilizationPoint: { x: '${xPercent}%', y: '${yPercent}%' },\n    maxZoom: ${phones[selectedModel].maxZoom}\n},`; console.log("Скопируйте этот код и вставьте в объект 'phones' в файле app.js:\n",codeToCopy); alert(`Точка для "${selectedModel}" установлена!\nКод для вставки в консоли (F12).`); }

    init();
});
