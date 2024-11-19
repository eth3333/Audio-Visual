document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('visualizer');
    const startButton = document.getElementById('startButton');
    const effectMode = document.getElementById('effectMode');
    const sensitivity = document.getElementById('sensitivity');
    const speed = document.getElementById('speed');
    const size = document.getElementById('size');
    const colorScheme = document.getElementById('colorScheme');
    const colorMode = document.getElementById('colorMode');
    const singleColorControl = document.getElementById('singleColorControl');
    const gradientControl = document.getElementById('gradientControl');
    const paletteControl = document.getElementById('paletteControl');
    const colorSlider = document.getElementById('colorSlider');
    const startColorSlider = document.getElementById('startColorSlider');
    const endColorSlider = document.getElementById('endColorSlider');
    const colorPreview = document.getElementById('colorPreview');
    const paletteColors = document.querySelectorAll('.palette-color');

    const audioAnalyzer = new AudioAnalyzer();
    const visualizer = new Visualizer(canvas);

    let isRunning = false;
    let animationFrame;

    startButton.addEventListener('click', async () => {
        if (!isRunning) {
            const success = await audioAnalyzer.initialize();
            if (success) {
                isRunning = true;
                startButton.textContent = '停止';
                animate();
            } else {
                alert('無法訪問麥克風，請確保已授予權限。');
            }
        } else {
            isRunning = false;
            startButton.textContent = '啟動麥克風';
            cancelAnimationFrame(animationFrame);
        }
    });

    effectMode.addEventListener('change', (e) => {
        visualizer.setMode(e.target.value);
    });

    sensitivity.addEventListener('input', (e) => {
        visualizer.setSensitivity(e.target.value);
    });

    speed.addEventListener('input', (e) => {
        visualizer.setSpeed(e.target.value);
    });

    size.addEventListener('input', (e) => {
        visualizer.setSize(e.target.value);
    });

    colorScheme.addEventListener('change', (e) => {
        visualizer.setColorScheme(e.target.value);
    });

    function animate() {
        if (!isRunning) return;

        const audioData = audioAnalyzer.getAudioData();
        const volume = audioAnalyzer.getAverageVolume();

        visualizer.draw(audioData, volume);
        animationFrame = requestAnimationFrame(animate);
    }

    function updateColorControls() {
        singleColorControl.style.display = colorMode.value === 'single' ? 'block' : 'none';
        gradientControl.style.display = colorMode.value === 'gradient' ? 'block' : 'none';
        paletteControl.style.display = colorMode.value === 'palette' ? 'block' : 'none';
        
        visualizer.setColorMode(colorMode.value);
        updateColorPreview();
    }

    function updateColorPreview() {
        switch (colorMode.value) {
            case 'single':
                const hue = colorSlider.value;
                colorPreview.style.background = `hsl(${hue}, 100%, 50%)`;
                break;
            case 'gradient':
                const startHue = startColorSlider.value;
                const endHue = endColorSlider.value;
                colorPreview.style.background = 
                    `linear-gradient(to right, hsl(${startHue}, 100%, 50%), hsl(${endHue}, 100%, 50%))`;
                break;
            case 'palette':
                colorPreview.style.background = 
                    `linear-gradient(to right, ${Array.from(paletteColors).map(el => el.style.background).join(', ')})`;
                break;
        }
    }

    colorMode.addEventListener('change', updateColorControls);
    colorSlider.addEventListener('input', () => {
        visualizer.setSingleColor(colorSlider.value);
        updateColorPreview();
    });

    startColorSlider.addEventListener('input', () => {
        visualizer.setGradientColors(startColorSlider.value, endColorSlider.value);
        updateColorPreview();
    });

    endColorSlider.addEventListener('input', () => {
        visualizer.setGradientColors(startColorSlider.value, endColorSlider.value);
        updateColorPreview();
    });

    paletteColors.forEach((el, index) => {
        el.addEventListener('click', () => {
            paletteColors.forEach(el => el.classList.remove('active'));
            el.classList.add('active');
            visualizer.colors.currentPaletteIndex = index;
        });
    });

    // 初始化顏色控制
    updateColorControls();
}); 