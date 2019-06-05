import './css/index.less'
import api from './js/request'
import {render, renderSongList} from './js/render'
import control from './js/control'
import Audio from './js/audioControl'
import {start, stop, update} from './js/process'
import guss from './js/gaussBlur'
import $ from "zepto-webpack";

let audio = new Audio.AudioControl();
let cache = [], index = 0, reqCount = 1, total, count = 1, duration = 0, perc = 0, curTime = 0, flag = false;

async function renderPlay(index) {
    if (cache[index]) {
        render(cache[index])
    } else {
        let data = await api.getJson('json', index);
        cache.push(data);
        total = data.total;
        render(data);
        duration = data.duration;
        loadGussImage(cache[index]);
    }

}

function bindEvent() {
    function changeState() {
        audio.status = 'pause';
        $('.play-btn').trigger('click')
    }

    $('.pre-btn').on('click', async function () {
        perc = 0;
        let ControlManager = new control.ControlManager(total, index);
        index = ControlManager.prev();
        count = 1;
        await renderPlay(index);
        changeState();
        start(duration, 0, true);
        $('.play-song').removeClass('pause').eq(index).addClass('pause')
    });
    $('.next-btn').on('click', async function () {
        perc = 0;
        let ControlManager = new control.ControlManager(total, index);
        index = ControlManager.next();
        count = 1;
        await renderPlay(index);//等待，让缓存有数据
        changeState();
        start(duration, 0, true);
        $('.play-song').removeClass('pause').eq(index).addClass('pause')
    });
    $('.play-btn').on('click', function () {
        if (count === 1) { //控制点击
            if (!audio.src) {
                audio.getAudio(cache[index].audio);
            }
            count++;
        }
        if (audio.status === 'pause') { //正在播放
            curTime = Math.round(perc * duration);
            audio.playTo(curTime);
            start(duration, perc, false);
            $($('.play-song')[index]).addClass('pause');
            $(this).addClass('pause')
            // $($('.play-song')[index]).removeClass('playing')
        } else {//按了暂停
            $($('.play-song')[index]).removeClass('pause');
            $(this).removeClass('pause');
            audio.pause();
            let x = $('.process-top').position().left + $('.process-top').width();
            perc = x / $('.process-top').width();
            // $($('.play-song')[index]).removeClass('playing');
            stop();
        }

    });
    $('.list-btn').on('click', async function () {
        flag = true;
        $('.song-list').css('transform', 'translate3d(0,0,0)');
        $('.layer').css('display', 'block');
    });
    $('.layer').on('click', function (e) {
        e.stopPropagation();
        flag = false;
        $('.song-list').css('transform', 'translate3d(0,100%,0)');
        $(this).css('display', 'none')
    });
    $('.wrapper').on('click', '.song-list-info', async function () {
        let page = this.dataset.page;
        index = page;
        await renderPlay(page);
        loadGussImage(cache[page]);
    });
    $('.wrapper').on('click', '.play-song', async function () {
        audio.getAudio(cache[this.dataset.index].audio);
        //没有暂停过直接切歌，从0开始
        if ($('.play-song.pause')[0] && this.dataset.index !== $('.play-song.pause')[0].dataset.index) {//切换
            perc = 0;
            audio.playTo(0);
            $('.play-song').removeClass('pause');
            $(this).addClass('pause');
            $('.play-btn').addClass('pause');
            start(duration, 0, true)
        } else if (audio.status === "pause") {//播放
            if (this.classList.contains('stopped')) {//暂停之后继续播放，如果由暂停标志，就继续播放
                $('.play-btn').trigger('click');
                $(this).removeClass('stopped');
            } else {//暂停之后，切歌，去掉暂停标志
                perc = 0;
                audio.playTo(0);
                $('.play-song').removeClass('pause');//去掉所有歌曲的pause
                $('.play-song.stopped').removeClass('stopped');
                $(this).addClass('pause');
                $('.play-btn').addClass('pause');
                start(duration, 0, true)
            }
        } else if (audio.status === "play") {//暂停，加上暂停标志
            $(this).addClass('stopped');
            $('.play-btn').trigger('click');
        }
    })
}


function loadGussImage(cache) {
    let img = new Image();
    img.src = require('./assets/' + cache.image);
    img.onload = function () {
        guss.blurImg(img, $('.song-list'));
    };
}

function bindTouch() {
    let pointer = $('.slider-pointer');
    let offset = $('.process-wrapper').offset();
    let left = offset.left, width = offset.width;
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
            audio.getAudio(cache[index].audio);
        }
        let x = e.changedTouches[0].clientX;
        let percent = (x - left) / width;
        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }
        perc = percent;
        curTime = Math.round(percent * duration);
        audio.playTo(curTime);
        start(duration, percent, false);
        $('.play-btn').addClass('pause');
    })
}

async function renderList() {
    if (reqCount) {
        cache = await api.getJson('json');
        renderSongList(cache);
        reqCount--;
    }
}

renderPlay(index);
bindEvent();
bindTouch();
renderList();