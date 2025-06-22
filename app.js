document.addEventListener('DOMContentLoaded', () => {
    // --- ФИНАЛЬНЫЕ ДАННЫЕ С ТВОИМИ КООРДИНАТАМИ ---
    const phones = {
        'Redmi9A': { image: 'Redmi9A.png', stabilizationPoint: { x: '34.93%', y: '9.04%' } },
        'SamsungS21U': { image: 'SamsungS21U.png', stabilizationPoint: { x: '19.01%', y: '18.26%' } },
        'RealmeGT7Pro': { image: 'RealmeGT7Pro.png', stabilizationPoint: { x: '38.82%', y: '26.66%' } },
        'HuaweiPura70U': { image: 'HuaweiPura70U.png', stabilizationPoint: { x: '45.37%', y: '25.02%' } },
        'OnePlus12': { image: 'OnePlus12.png', stabilizationPoint: { x: '26.38%', y: '17.03%' } },
        'SamsungS24U': { image: 'SamsungS24U.png', stabilizationPoint: { x: '18.41%', y: '20.09%' } },
        'Xiaomi15U': { image: 'Xiaomi15U.png', stabilizationPoint: { x: '42.09%', y: '34.85%' } },
        'VivoX200U': { image: 'VivoX200U.png', stabilizationPoint: { x: '44.55%', y: '35.46%' } },
        'SamsungS25U': { image: 'SamsungS25U.png', stabilizationPoint: { x: '37.38%', y: '25.63%' } },
        'HuaweiPura80U': { image: 'HuaweiPura80U.png', stabilizationPoint: { x: '40.66%', y: '37.10%' } }
    };
    const DEV_PASSWORD_ENCODED = "ZGV2MTIz"; // btoa('dev123')
    let currentRotation = 0, targetRotation = 0;
    let isDevMode = false;

    // --- ЭЛЕМЕНТЫ DOM ---
    const wrapperBg = document.getElementById('wrapper-bg');
    const phoneContainer = document.getElementById('phone-container');
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
        window.updatePhoneSelector = updatePhoneSelector;
        updatePhoneSelector();
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
        
        requestAnimationFrame(fpsLoop);
        requestAnimationFrame(animationLoop);
    }
    
    // --- ОСНОВНЫЕ ФУНКЦИИ ---
    function updatePhoneSelector() {
        const unlockedPhones = Object.keys(phones); // Разблокируем все телефоны всегда
        const currentSelected = phoneSelect.value;
        phoneSelect.innerHTML = '';
        unlockedPhones.forEach(modelName => {
            if (phones[modelName]) {
                const option = document.createElement('option');
                option.value = modelName; option.textContent = modelName;
                phoneSelect.appendChild(option);
            }
        });
        if (unlockedPhones.includes(currentSelected)) { phoneSelect.value = currentSelected; }
        updatePhone();
    }
    
    function updatePhone() {
        const selectedModel = phoneSelect.value; if (!selectedModel) return;
        const phoneData = phones[selectedModel];
        const originPoint = `${phoneData.stabilizationPoint.x} ${phoneData.stabilizationPoint.y}`;
        phoneImage.style.transformOrigin = originPoint;
        phoneContainer.style.transformOrigin = originPoint;
        phoneImage.src = phoneData.image;
        targetRotation = 0;
        currentRotation = -1; // Гарантируем, что цикл обновит значение
        applyInitialTransform();
    }

    // --- ЛОГИКА АНИМАЦИИ И ВРАЩЕНИЯ (МГНОВЕННАЯ) ---
    function animationLoop() {
        if (currentRotation !== targetRotation) {
            currentRotation = targetRotation;
            phoneImage.style.transform = `perspective(1000px) rotateZ(${currentRotation}deg)`;
            knobHandle.style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
        }
        requestAnimationFrame(animationLoop);
    }

    let startDragAngle = 0, startPhoneRotation = 0;
    function onDragStart(e) { if(isDevMode) return; e.preventDefault(); startDragAngle = getAngleFromEvent(e); startPhoneRotation = currentRotation; document.body.style.cursor = 'grabbing'; wrapperBg.classList.add('is-rotating'); document.addEventListener('mousemove', onDragMove); document.addEventListener('mouseup', onDragEnd); document.addEventListener('touchmove', onDragMove, { passive: false }); document.addEventListener('touchend', onDragEnd); }
    function onDragMove(e) { const angleDifference = getAngleFromEvent(e) - startDragAngle; targetRotation = startPhoneRotation + angleDifference; }
    function onDragEnd() { document.body.style.cursor = 'default'; wrapperBg.classList.remove('is-rotating'); document.removeEventListener('mousemove', onDragMove); document.removeEventListener('mouseup', onDragEnd); document.removeEventListener('touchmove', onDragMove); document.removeEventListener('touchend', onDragEnd); }
    
    let wheelTimeout;
    function handleMouseWheel(e) { if(isDevMode) return; e.preventDefault(); targetRotation += e.deltaY > 0 ? 5 : -5; wrapperBg.classList.add('is-rotating'); clearTimeout(wheelTimeout); wheelTimeout = setTimeout(() => { wrapperBg.classList.remove('is-rotating'); }, 300); }
    
    function getAngleFromEvent(e) { const rect = knob.getBoundingClientRect(); const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2; const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX; const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY; return (Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)); }

    function applyInitialTransform() {
        phoneImage.style.transform = `perspective(1000px) rotateZ(0deg)`;
        knobHandle.style.transform = `translateX(-50%) rotate(0deg)`;
        wrapperBg.classList.remove('is-rotating');
    }
    
    // --- FPS И DEV-РЕЖИМ ---
    let lastTime = performance.now(); let frameCount = 0;
    function fpsLoop(currentTime) { frameCount++; if (currentTime - lastTime >= 1000) { fpsCounter.textContent = `${frameCount} FPS`; frameCount = 0; lastTime = currentTime; } requestAnimationFrame(fpsLoop); }
    function handlePasswordSubmit(){ if(btoa(passwordInput.value) === DEV_PASSWORD_ENCODED){ isDevMode = true; passwordModal.classList.add('hidden'); devModeInfo.classList.remove('hidden'); devModeButton.style.backgroundColor = '#4caf50'; updatePhoneSelector(); }else{ document.getElementById('password-error').classList.remove('hidden'); } }
    function handleDevClick(event){ if(!isDevMode)return; event.stopPropagation(); const rect=event.target.getBoundingClientRect();const x=event.clientX-rect.left;const y=event.clientY-rect.top; const xPercent=(x/rect.width*100).toFixed(2);const yPercent=(y/rect.height*100).toFixed(2); const selectedModel=phoneSelect.value; phones[selectedModel].stabilizationPoint={x:`${xPercent}%`,y:`${yPercent}%`}; updatePhone(); const codeToCopy=`'${selectedModel}': {\n    image: '${selectedModel}.png',\n    stabilizationPoint: { x: '${xPercent}%', y: '${yPercent}%' }\n},`; console.log("Скопируйте этот код и вставьте в объект 'phones' в файле app.js:\n",codeToCopy); alert(`Точка для "${selectedModel}" установлена!\nКод для вставки в консоли (F12).`); }

    init();
});
