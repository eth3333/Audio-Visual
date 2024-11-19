class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isInitialized = false;
        this.dataArray = null;
        this.bufferLength = null;
    }

    async initialize() {
        try {
            // 創建音訊上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 獲取麥克風權限
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 創建麥克風音訊源
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            // 創建分析器
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            // 連接麥克風到分析器
            this.microphone.connect(this.analyser);
            
            // 初始化數據數組
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('無法初始化音訊分析器:', error);
            return false;
        }
    }

    getAudioData() {
        if (!this.isInitialized) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    getAverageVolume() {
        const data = this.getAudioData();
        if (!data) return 0;
        
        const sum = data.reduce((acc, val) => acc + val, 0);
        return sum / data.length;
    }
} 