document.addEventListener('DOMContentLoaded', () => {
    // --- ДАННЫЕ ВЕРСИИ 1.1 ---
    const phones = {
        'Xiaomi15U': { image: 'Xiaomi15U.png', stabilizationPoint: { x: '56.82%', y: '23.49%' } },
        'VivoX200U': { image: 'VivoX200U.png', stabilizationPoint: { x: '44.81%', y: '24.38%' } },
        'SamsungS25U': { image: 'SamsungS25U.png', stabilizationPoint: { x: '37.38%', y: '25.02%' } },
        'HuaweiPura80U': { image: 'HuaweiPura80U.png', stabilizationPoint: { x: '50.90%', y: '25.63%' } }
    };
    const DEV_PASSWORD = 'dev123';
    let targetRotation = 0, currentRotation = -1; // -1 чтобы первая отрисовка всегда срабатывала
    let isDevMode = false;

    // --- ЭЛЕМЕНТЫ DOM ---
    const wrapperBg = document.getElementById('wrapper-bg');
    const phoneImage = document.getElementById('phone-image');
    const phoneSelect = document.getElementById('phone-select');
    const knob = document.getElementById('stabilization-knob');
    const knobHandle = document.getElementById('knob-handle');
    const fpsCounter = document.getElementById('fps-counter');
    const devModeButton = document.getElementById('dev-mode-button');
    const devModeInfo = document.getElementById('dev-mode-info');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');

    function init() {
        for (const model in phones) {
            const option = document.createElement('option');
            option.value = model; option.textContent = model;
            phoneSelect.appendChild(option);
        }
        updatePhone();
        
        knob.addEventListener('mousedown', onDragStart);
        knob.addEventListener('touchstart', onDragStart, { passive: false });
        wrapperBg.addEventListener('wheel', handleMouseWheel, { passive: false });
        phoneSelect.addEventListener('change', updatePhone);
        devModeButton.addEventListener('click', () => passwordModal.classList.remove('hidden'));
        passwordSubmit.addEventListener('click', handlePasswordSubmit);
        passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) passwordModal.classList.add('hidden'); });
        passwordInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handlePasswordSubmit(); });
        phoneImage.addEventListener('click', handleDevClick);
        
        // Запускаем оба цикла анимации
        requestAnimationFrame(fpsLoop);
        requestAnimationFrame(animationLoop);
    }

    // --- НОВЫЙ, МГНОВЕННЫЙ ЦИКЛ АНИМАЦИИ ---
    function animationLoop() {
        // Если целевое значение не совпадает с текущим - обновляем.
        // Никакого сглаживания, просто прямое присваивание.
        if (currentRotation !== targetRotation) {
            currentRotation = targetRotation;
            phoneImage.style.transform = `perspective(1000px) rotateZ(${currentRotation}deg)`;
            knobHandle.style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
        }
        
        // Цикл работает постоянно, чтобы мгновенно подхватывать изменения.
        // Это очень дешевая операция, если нет изменений DOM.
        requestAnimationFrame(animationLoop);
    }

    // --- ОБРАБОТЧИКИ СОБЫТИЙ (только меняют targetRotation) ---
    let startDragAngle = 0, startPhoneRotation = 0;
    function onDragStart(e) {
        e.preventDefault();
        startDragAngle = getAngleFromEvent(e);
        startPhoneRotation = currentRotation; // Используем уже отрисованное значение
        document.body.style.cursor = 'grabbing';
        wrapperBg.classList.add('is-rotating');
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    }
    function onDragMove(e) {
        const angleDifference = getAngleFromEvent(e) - startDragAngle;
        targetRotation = startPhoneRotation + angleDifference;
    }
    function onDragEnd() {
        document.body.style.cursor = 'default';
        wrapperBg.classList.remove('is-rotating');
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
    }
    
    let wheelTimeout;
    function handleMouseWheel(e) {
        e.preventDefault();
        targetRotation += e.deltaY > 0 ? 5 : -5;
        wrapperBg.classList.add('is-rotating');
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            wrapperBg.classList.remove('is-rotating');
        }, 300);
    }
    
    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    function getAngleFromEvent(e) { const rect = knob.getBoundingClientRect(); const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2; const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX; const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY; return (Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)); }
    
    function updatePhone() {
        const selectedModel = phoneSelect.value; if (!selectedModel) return;
        const phoneData = phones[selectedModel];
        const originPoint = `${phoneData.stabilizationPoint.x} ${phoneData.stabilizationPoint.y}`;
        phoneImage.style.transformOrigin = originPoint;
        document.getElementById('phone-container').style.transformOrigin = originPoint;
        phoneImage.src = phoneData.image;
        
        targetRotation = 0;
        // Принудительно сбрасываем состояние без анимации
        currentRotation = -1; // Гарантируем, что цикл обновит значение
        animationLoop(); // Вызываем один раз для немедленного сброса
        wrapperBg.classList.remove('is-rotating');
    }
    
    // --- FPS И DEV-РЕЖИМ ---
    let lastTime = performance.now(); let frameCount = 0;
    function fpsLoop(currentTime) { frameCount++; if (currentTime - lastTime >= 1000) { fpsCounter.textContent = `${frameCount} FPS`; frameCount = 0; lastTime = currentTime; } requestAnimationFrame(fpsLoop); }
    function handlePasswordSubmit(){if(passwordInput.value===DEV_PASSWORD){isDevMode=true;passwordModal.classList.add('hidden');document.getElementById('dev-mode-info').classList.remove('hidden');devModeButton.style.backgroundColor='#4caf50';passwordInput.value='';document.getElementById('password-error').classList.add('hidden')}else{document.getElementById('password-error').classList.remove('hidden')}}
    function handleDevClick(event){ if(!isDevMode)return;event.stopPropagation(); const rect=event.target.getBoundingClientRect();const x=event.clientX-rect.left;const y=event.clientY-rect.top; const xPercent=(x/rect.width*100).toFixed(2);const yPercent=(y/rect.height*100).toFixed(2); const selectedModel=phoneSelect.value; phones[selectedModel].stabilizationPoint={x:`${xPercent}%`,y:`${yPercent}%`}; updatePhone(); const codeToCopy=`'${selectedModel}': {\n    image: '${selectedModel}.png',\n    stabilizationPoint: { x: '${xPercent}%', y: '${yPercent}%' }\n},`; console.log("Скопируйте этот код и вставьте в объект 'phones' в файле app.js:\n",codeToCopy); alert(`Точка для "${selectedModel}" установлена!\nКод для вставки в консоли (F12).`); }
    
    init();
});
