import './css/index.less'
import api from './js/request'
import {render, renderSongList} from './js/render'
import control from './js/control'
import Audio from './js/audioControl'
import {start, stop, update} from './js/process'
import guss from './js/gaussBlur'
import $ from "zepto-webpack";
import './mock/data.json'

const main = {
    audio: new Audio.AudioControl(),
    params: {
        cache: [],
        index: 0,
        reqCount: 1,
        total: 0,
        count: 1,
        duration: 0,
        perc: 0,
        curTime: 0,
        flag: false,
    },
    init: async function () {
        await this.initCache();
        await this.initPage(0);
        await this.initEvent();
    },
    initEvent: function () {
        this.initCommon('.pre-btn', this.changeSong.bind(this), 'prev');
        this.initCommon('.next-btn', this.changeSong.bind(this), 'next');
        this.initCommon('.play-btn', this.changePlayState.bind(this));
        this.initTouchChange('.slider-pointer');
        this.initSongList('.wrapper', '.song-list-info', this.changePlaySong.bind(this));
        this.initSongList('.wrapper', '.play-song', this.playSong.bind(this));
        this.initCommon('.list-btn', this.showListLayer.bind(this));
        this.initCommon('.layer', this.hideListLayer.bind(this))
    },
    playSong: function (that, e) {
        if (e) {
            e.stopPropagation();
        }
        let audio = this.audio;
        audio.getAudio(this.params.cache[that.dataset.index].audio);
        //没有暂停过直接切歌
        if ($('.play-song.pause')[0] && that.dataset.index !== $('.play-song.pause')[0].dataset.index) {//切换
            this.params.perc = 0;
            audio.playTo(0);
            $('.play-song').removeClass('pause');
            $(that).addClass('pause');
            $('.play-btn').addClass('pause');
            start(this.params.duration, 0, true)
        } else if (audio.status === "pause") {//暂停状态，播放
            if (that.classList.contains('stopped')) {//暂停之后继续播放
                $('.play-btn').trigger('click');
                $(that).removeClass('stopped');
                $('.play-song').removeClass('pause');
                $(that).addClass('pause');
            } else {//暂停之后，切歌
                this.params.perc = 0;
                audio.playTo(0);
                $('.play-song').removeClass('pause');//去掉所有歌曲的pause
                $('.play-song.stopped').removeClass('stopped');
                $(that).addClass('pause');
                $('.play-btn').addClass('pause');
                start(this.params.duration, 0, true)
            }
        } else if (audio.status === "play") {//播放状态，暂停
            $(that).addClass('stopped').removeClass('pause');
            $('.play-btn').trigger('click');
        }
    },
    changePlaySong: function (that, e) {
        e.stopPropagation();
        let page = that.dataset.page;
        this.params.index = page;
        this.initPage(page);
        this.loadGussImage(this.params.cache[page].image);
        if (e.target !== $(that).find('.play-song')[0]) {//点击的不是自己的播放暂停
            this.playSong($(that).find('.play-song')[0])
        }
    },
    initSongList: function (supEl, subEl, cb) {
        $(supEl).on('click', subEl, function (e) {
            cb(this, e)
        });
    },
    initTouchChange: function (el) {
        let pointer = $(el),
            self = this,
            audio = this.audio,
            offset = $('.process-wrapper').offset(),
            left = offset.left,
            duration = this.params.duration,
            width = offset.width;
        pointer.on('touchstart', function () {
            audio.pause();
        }).on('touchmove', function (e) {
            let x = e.changedTouches[0].clientX;
            let percent = (x - left) / width;
            if (percent < 0) {
                percent = 0;
            } else if (percent > 1) {
                percent = 1;
            }
            update(percent)
        }).on('touchend', function (e) {
            if (!audio.src) {
                audio.getAudio(self.params.cache[self.params.index].audio);
            }
            let x = e.changedTouches[0].clientX;
            let percent = (x - left) / width;
            if (percent < 0) {
                percent = 0;
            } else if (percent > 1) {
                percent = 1;
            }
            self.params.perc = percent;
            self.params.curTime = Math.round(percent * duration);
            audio.playTo(self.params.curTime);
            start(duration, percent, false);
            $('.play-btn').addClass('pause');
        })
    },
    hideListLayer: function () {
        this.params.flag = false;
        $('.song-list').css('transform', 'translate3d(0,100%,0)');
        $('.layer').css('display', 'none')
    },
    showListLayer: function (index, prev, e) {
        e.stopPropagation();
        this.params.flag = true;
        $('.song-list').css('transform', 'translate3d(0,0,0)');
        $('.layer').css('display', 'block');
    },
    changePlayState: function () {
        let cache = this.params.cache,
            audio = this.audio,
            perc = this.params.perc,
            duration = this.params.duration,
            index = this.params.index;
        if (this.params.count === 1) { //控制点击
            if (!audio.src) {
                audio.getAudio(cache[index].audio);
            }
            this.params.count = 2;
        }
        if (this.audio.status === 'pause') { //播放
            this.params.curTime = Math.round(perc * duration);
            audio.playTo(this.params.curTime);
            start(this.params.duration, this.params.perc, false);
            this.syncClass('add', index);
        } else {//按了暂停
            this.syncClass('remove', index);
            audio.pause();
            this.changePercent();
            stop();
        }
    },
    changePercent: function () {
        let x = $('.process-top').position().left + $('.process-top').width();
        this.params.perc = x / $('.process-top').width();
    },
    syncClass: function (add, index) {
        let playSong = $($('.play-song')[index]), playBtn = $('.play-btn');
        if (add === 'add') {
            playSong.addClass('pause');
            playBtn.addClass('pause');
            if (playSong[0].classList.contains('stopped')){
                playSong.removeClass('stopped');
            }
        } else if (add === 'remove') {
            playSong.removeClass('pause');
            playBtn.removeClass('pause');
            playSong.addClass('stopped');
        }
    },
    changeSong: async function (index, next) {
        this.params.perc = 0;
        let ControlManager = new control.ControlManager(this.params.total, index);
        if (next === 'prev') {
            index = ControlManager.prev();
        } else if (next === 'next') {
            index = ControlManager.next();
        }
        this.params.index = index;//因为是基本类型值，重新赋值
        this.params.count = 1;//重新计算获取src的次数
        this.initPage(this.params.index); //缓冲一下
        this.changeState();
        start(this.params.duration, this.params.perc, true);
        $('.play-song').removeClass('pause').eq(index).addClass('pause');
    },
    changeState: function () {
        this.audio.status = 'pause';//切换音乐，首先让音乐播放
        $('.play-btn').trigger('click')
    },
    initCommon: function (el, cb, next) {
        let self = this;
        $(el).on('click', function (e) {
            cb(self.params.index, next, e)
        });
    },
    initCache: async function () {
        let data = await api.getJson('json');
        this.params.cache = data;
        this.params.total = data[0].total;
        renderSongList(data)
    },
    initPage: function (page) {
        let cache = this.params.cache;
        render(cache[page]);
        this.params.duration = cache[page].duration;
        this.params.index = cache[page].id - 1;
        render(cache[page]);
        this.loadGussImage(cache[page].image);
    },
    loadGussImage: function (src) {
        let img = new Image();
        img.src = require('./assets/' + src);
        img.onload = function () {
            guss.blurImg(img, $('.song-list'));
        };
    }
};

main.init();