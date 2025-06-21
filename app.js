document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ ВЕРСИИ 1.1 С НОВЫМИ КООРДИНАТАМИ ---
    const phones = {
        'Xiaomi15U': { image: 'Xiaomi15U.png', stabilizationPoint: { x: '56.82%', y: '23.49%' }, maxZoom: 120 },
        'VivoX200U': { image: 'VivoX200U.png', stabilizationPoint: { x: '44.81%', y: '24.38%' }, maxZoom: 100 },
        'SamsungS25U': { image: 'SamsungS25U.png', stabilizationPoint: { x: '37.38%', y: '25.02%' }, maxZoom: 100 }, // Координаты обновлены
        'HuaweiPura80U': { image: 'HuaweiPura80U.png', stabilizationPoint: { x: '50.90%', y: '25.63%' }, maxZoom: 100 } // Координаты обновлены
    };
    const DEV_PASSWORD = 'dev123';
    let currentPhoneRotation = 0, startDragAngle = 0, startPhoneRotation = 0, isDevMode = false;

    // --- ЭЛЕМЕНТЫ DOM ---
    const wrapperBg = document.getElementById('wrapper-bg'); const phoneContainer = document.getElementById('phone-container'); const phoneImage = document.getElementById('phone-image'); const phoneSelect = document.getElementById('phone-select'); const knob = document.getElementById('stabilization-knob'); const knobHandle = document.getElementById('knob-handle'); const devModeButton = document.getElementById('dev-mode-button'); const devModeInfo = document.getElementById('dev-mode-info'); const passwordModal = document.getElementById('password-modal'); const passwordInput = document.getElementById('password-input'); const passwordSubmit = document.getElementById('password-submit'); const passwordError = document.getElementById('password-error');
    const fpsCounter = document.getElementById('fps-counter'); // Счетчик FPS

    function init() {
        for (const model in phones) {
            const option = document.createElement('option');
            option.value = model; option.textContent = model;
            phoneSelect.appendChild(option);
        }
        updatePhone();
        
        // Обработчики
        knob.addEventListener('mousedown', onDragStart); knob.addEventListener('touchstart', onDragStart, { passive: false });
        wrapperBg.addEventListener('wheel', handleMouseWheel, { passive: false });
        phoneSelect.addEventListener('change', updatePhone);
        devModeButton.addEventListener('click', () => passwordModal.classList.remove('hidden'));
        passwordSubmit.addEventListener('click', handlePasswordSubmit);
        passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) passwordModal.classList.add('hidden'); });
        passwordInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handlePasswordSubmit(); });
        phoneImage.addEventListener('click', handleDevClick);
        
        // Запускаем цикл для счетчика FPS
        requestAnimationFrame(fpsLoop);
    }

    // --- ЛОГИКА FPS ---
    let lastTime = performance.now(); let frameCount = 0;
    function fpsLoop(currentTime) {
        frameCount++;
        if (currentTime - lastTime >= 1000) {
            fpsCounter.textContent = `${frameCount} FPS`;
            frameCount = 0;
            lastTime = currentTime;
        }
        requestAnimationFrame(fpsLoop);
    }

    // --- ЛОГИКА ВРАЩЕНИЯ И ЭФФЕКТОВ ---
    function onDragStart(e) { e.preventDefault(); startDragAngle = getAngleFromEvent(e); startPhoneRotation = currentPhoneRotation; document.body.style.cursor = 'grabbing'; document.addEventListener('mousemove', onDragMove); document.addEventListener('mouseup', onDragEnd); document.addEventListener('touchmove', onDragMove, { passive: false }); document.addEventListener('touchend', onDragEnd); }
    function onDragMove(e) { const currentDragAngle = getAngleFromEvent(e); const angleDifference = currentDragAngle - startDragAngle; currentPhoneRotation = startPhoneRotation + angleDifference; applyRotationAndEffects(); }
    function onDragEnd() { document.body.style.cursor = 'default'; document.removeEventListener('mousemove', onDragMove); document.removeEventListener('mouseup', onDragEnd); document.removeEventListener('touchmove', onDragMove); document.removeEventListener('touchend', onDragEnd); }
    function getAngleFromEvent(e) { const rect = knob.getBoundingClientRect(); const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2; const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX; const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY; const angleRad = Math.atan2(clientY - centerY, clientX - centerX); return angleRad * (180 / Math.PI); }
    function handleMouseWheel(e) { e.preventDefault(); const rotationStep = 5; currentPhoneRotation += e.deltaY > 0 ? rotationStep : -rotationStep; applyRotationAndEffects(); }
    function applyRotationAndEffects() { phoneImage.style.transform = `perspective(1000px) rotateZ(${currentPhoneRotation}deg)`; knobHandle.style.transform = `translateX(-50%) rotate(${currentPhoneRotation}deg)`; const MAX_BLUR = 25; const BLUR_SENSITIVITY = 30; const blurAmount = Math.min(MAX_BLUR, Math.abs(currentPhoneRotation) / BLUR_SENSITIVITY); wrapperBg.style.backdropFilter = `blur(${blurAmount}px)`; }
    
    // Убрана логика зума из JS, так как ее больше нет в HTML
    function updatePhone() {
        const selectedModel = phoneSelect.value; if (!selectedModel) return;
        const phoneData = phones[selectedModel];
        const originPoint = `${phoneData.stabilizationPoint.x} ${phoneData.stabilizationPoint.y}`;
        phoneImage.style.transformOrigin = originPoint; phoneContainer.style.transformOrigin = originPoint;
        phoneImage.src = phoneData.image;
        currentPhoneRotation = 0; applyRotationAndEffects();
    }
    
    // --- РЕЖИМ РАЗРАБОТЧИКА ---
    function handlePasswordSubmit(){if(passwordInput.value===DEV_PASSWORD){isDevMode=true;passwordModal.classList.add('hidden');devModeInfo.classList.remove('hidden');devModeButton.style.backgroundColor='#4caf50';passwordInput.value='';passwordError.classList.add('hidden')}else{passwordError.classList.remove('hidden')}}
    function handleDevClick(event){ if(!isDevMode)return;event.stopPropagation(); const rect=event.target.getBoundingClientRect();const x=event.clientX-rect.left;const y=event.clientY-rect.top; const xPercent=(x/rect.width*100).toFixed(2);const yPercent=(y/rect.height*100).toFixed(2); const selectedModel=phoneSelect.value; phones[selectedModel].stabilizationPoint={x:`${xPercent}%`,y:`${yPercent}%`}; updatePhone(); const codeToCopy=`'${selectedModel}': {\n    image: '${selectedModel}.png',\n    stabilizationPoint: { x: '${xPercent}%', y: '${yPercent}%' }\n},`; console.log("Скопируйте этот код и вставьте в объект 'phones' в файле app.js:\n",codeToCopy); alert(`Точка для "${selectedModel}" установлена!\nКод для вставки в консоли (F12).`); }
    
    init();
});
