import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';

export default {
    name: 'Clock',
    data() {
        return {
            currentTime: null,
            startRealTime: null,
            baseTime: null,
            speedRatio: 1,  // 1秒相当于多少分钟
            isPaused: false,
            showPanel: false,
            timer: null
        };
    },
    computed: {
        formattedTime() {
            if (!this.currentTime) return '--:--';
            const hours = this.currentTime.getHours().toString().padStart(2, '0');
            const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        },
        fullFormattedTime() {
            if (!this.currentTime) return '--:--:--';
            const year = this.currentTime.getFullYear();
            const month = (this.currentTime.getMonth() + 1).toString().padStart(2, '0');
            const day = this.currentTime.getDate().toString().padStart(2, '0');
            const hours = this.currentTime.getHours().toString().padStart(2, '0');
            const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
            const seconds = this.currentTime.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
    },
    created() {
        this.initializeTime();
        this.startTimer();
    },
    beforeDestroy() {
        this.stopTimer();
    },
    methods: {
        initializeTime() {
            // 设置起始时间为2019年6月13日17:00:00
            this.baseTime = new Date(2019, 5, 13, 17, 0, 0);
            this.currentTime = new Date(this.baseTime);
            this.startRealTime = Date.now();
        },

        startTimer() {
            this.stopTimer();
            this.timer = setInterval(() => {
                if (!this.isPaused) {
                    this.updateTime();
                }
            }, 1000);
        },

        stopTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        updateTime() {
            const elapsedRealSeconds = Math.floor((Date.now() - this.startRealTime) / 1000);
            const simulatedMinutes = elapsedRealSeconds * this.speedRatio;

            // 计算新的模拟时间
            this.currentTime = new Date(this.baseTime.getTime() + simulatedMinutes * 60 * 1000);

            // 触发时间更新事件，供其他组件使用
            this.$root.$emit('clock-time-updated', this.currentTime);
        },

        updateSpeedRatio(newRatio) {
            // 改变速率时，需要重新计算起始时间点，以保持连续性
            const currentRealTime = Date.now();
            const elapsedRealSeconds = Math.floor((currentRealTime - this.startRealTime) / 1000);
            const elapsedSimulatedMinutes = elapsedRealSeconds * this.speedRatio;

            // 更新基准时间点和起始真实时间
            this.baseTime = new Date(this.currentTime.getTime());
            this.startRealTime = currentRealTime;
            this.speedRatio = newRatio;
        },

        pauseTime() {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) {
                // 继续时，更新起始时间点
                this.startRealTime = Date.now();
                this.baseTime = new Date(this.currentTime.getTime());
            }
        },

        resetTime() {
            this.initializeTime();
        },

        toggleClock(event) {
            event.stopPropagation();
            this.showPanel = !this.showPanel;
        },

        hidePanel() {
            this.showPanel = false;
        }
    },
    directives: {
        'click-outside': {
            bind(el, binding) {
                el.clickOutsideEvent = function(event) {
                    if (!(el === event.target || el.contains(event.target))) {
                        binding.value(event);
                    }
                };
                document.addEventListener('click', el.clickOutsideEvent);
            },
            unbind(el) {
                document.removeEventListener('click', el.clickOutsideEvent);
            }
        }
    }
}