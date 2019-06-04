export default {
    AudioControl: function () {
        this.audio = new Audio();
        this.status = 'pause';
        this.play = function () {
            this.audio.play();
            this.status = 'play';
        };
        this.pause = function () {
            this.audio.pause();
            this.status = 'pause';
        };
        this.getAudio = function (src) {
            this.audio.src = require('../assets/' + src);
            this.audio.load();
        };
        this.playTo = function(time){
            this.audio.currentTime = time;
            this.play();
        }
    },
}