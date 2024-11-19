class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.currentMode = 'particles';
        this.sensitivity = 50;
        this.speed = 50;
        this.size = 50;
        this.colorScheme = 'rainbow';
        this.matrixSymbols = '0123456789ABCDEF'.split('');
        this.drops = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initializeMatrixRain();
        this.colorMode = 'single';
        this.colors = {
            single: { h: 0, s: 100, l: 50 },
            gradient: {
                start: { h: 0, s: 100, l: 50 },
                end: { h: 180, s: 100, l: 50 }
            },
            palette: [
                { h: 0, s: 100, l: 50 },    // 紅
                { h: 120, s: 100, l: 50 },  // 綠
                { h: 240, s: 100, l: 50 },  // 藍
                { h: 60, s: 100, l: 50 }    // 黃
            ],
            currentPaletteIndex: 0
        };
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setSensitivity(value) {
        this.sensitivity = value;
    }

    setMode(mode) {
        this.currentMode = mode;
    }

    setSpeed(value) {
        this.speed = value;
    }

    setSize(value) {
        this.size = value;
    }

    setColorScheme(scheme) {
        this.colorScheme = scheme;
    }

    setColor(r, g, b) {
        this.color = { r, g, b };
    }

    getColor(opacity = 1) {
        return `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity})`;
    }

    draw(audioData, volume) {
        this.ctx.fillStyle = 'rgba(18, 18, 18, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.currentMode) {
            case 'particles':
                this.drawParticles(audioData, volume);
                break;
            case 'waves':
                this.drawWaves(audioData);
                break;
            case 'geometric':
                this.drawGeometric(audioData, volume);
                break;
            case 'spectrum':
                this.drawSpectrum(audioData);
                break;
            case 'matrix':
                this.drawMatrix(audioData);
                break;
            case 'kaleidoscope':
                this.drawKaleidoscope(audioData, volume);
                break;
        }
    }

    drawParticles(audioData, volume) {
        const sensitivity = this.sensitivity / 50;
        const particleCount = Math.floor(volume * sensitivity);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                size: Math.random() * 5 + 2,
                speedX: (Math.random() - 0.5) * 10,
                speedY: (Math.random() - 0.5) * 10,
                life: 1
            });
        }

        this.particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= 0.01;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getColor(particle.life);
            this.ctx.fill();

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    drawWaves(audioData) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `hsl(${Date.now() % 360}, 50%, 50%)`;
        this.ctx.lineWidth = 2;

        const sliceWidth = this.canvas.width / audioData.length;
        let x = 0;

        for (let i = 0; i < audioData.length; i++) {
            const v = audioData[i] / 128.0;
            const y = (v * this.canvas.height) / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    drawGeometric(audioData, volume) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxSize = Math.min(this.canvas.width, this.canvas.height) / 3;
        const size = maxSize * (volume / 255);

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(Date.now() * 0.001);

        for (let i = 0; i < 8; i++) {
            this.ctx.rotate(Math.PI / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(size, 0);
            this.ctx.strokeStyle = `hsl(${(i * 45 + Date.now() * 0.1) % 360}, 50%, 50%)`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawSpectrum(audioData) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        this.ctx.beginPath();
        for (let i = 0; i < audioData.length; i++) {
            const angle = (i * 2 * Math.PI) / audioData.length;
            const value = audioData[i] * (this.size / 50);
            const x = centerX + Math.cos(angle) * (radius + value);
            const y = centerY + Math.sin(angle) * (radius + value);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = this.getColor();
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    initializeMatrixRain() {
        const columns = Math.floor(this.canvas.width / 20);
        for (let i = 0; i < columns; i++) {
            this.drops[i] = 1;
        }
    }

    drawMatrix(audioData) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.getColor();
        this.ctx.font = '15px monospace';
        
        const volume = audioData.reduce((a, b) => a + b) / audioData.length;
        const speed = this.speed / 50 * (1 + volume / 255);
        
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.matrixSymbols[Math.floor(Math.random() * this.matrixSymbols.length)];
            this.ctx.fillText(text, i * 20, this.drops[i] * 20);
            
            if (this.drops[i] * 20 > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i] += speed;
        }
    }

    drawKaleidoscope(audioData, volume) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const segments = 8;
        const angleStep = (Math.PI * 2) / segments;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        for (let i = 0; i < segments; i++) {
            this.ctx.rotate(angleStep);
            this.ctx.beginPath();
            
            for (let j = 0; j < audioData.length; j += 10) {
                const value = audioData[j] * (this.size / 50);
                const x = (j / audioData.length) * 200;
                const y = value;
                
                if (j === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.strokeStyle = this.getColor(i);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    setColorMode(mode) {
        this.colorMode = mode;
    }

    setSingleColor(hue) {
        this.colors.single.h = hue;
    }

    setGradientColors(startHue, endHue) {
        this.colors.gradient.start.h = startHue;
        this.colors.gradient.end.h = endHue;
    }

    setPaletteColor(index, hue) {
        if (index >= 0 && index < this.colors.palette.length) {
            this.colors.palette[index].h = hue;
        }
    }

    getColor(progress = 0) {
        switch (this.colorMode) {
            case 'single':
                return `hsl(${this.colors.single.h}, ${this.colors.single.s}%, ${this.colors.single.l}%)`;
            
            case 'gradient':
                const h = this.colors.gradient.start.h + 
                    (this.colors.gradient.end.h - this.colors.gradient.start.h) * progress;
                return `hsl(${h}, 100%, 50%)`;
            
            case 'palette':
                const index = Math.floor(progress * this.colors.palette.length);
                const color = this.colors.palette[index];
                return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
            
            default:
                return `hsl(0, 100%, 50%)`;
        }
    }
} 