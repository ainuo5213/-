import './css/index.less'
import api from './js/request'
import {render} from './js/render'
import control from './js/control'
import Audio from './js/audioControl'
import {start, stop, update} from './js/process'

let audio = new Audio.AudioControl();
let cache = [], index = 0, total, count = 1, duration = 0, perc = 0;

async function getData(index) {
    if (cache[index]) {
        render(cache[index])
    } else {
        let data = await api.getJson('json', index);
        cache.push(data);
        total = data.total;
        render(data);
        duration = data.duration
    }

}

function bindEvent() {
    function changeState() {
        audio.status = 'pause';
        $('.play-btn').trigger('click')
    }

    $('.pre-btn').on('click', async function () {
        let ControlManager = new control.ControlManager(total, index);
        index = ControlManager.prev();
        count = 1;
        await getData(index);
        changeState();
        start(duration,0,true);
    });
    $('.next-btn').on('click', async function () {
        let ControlManager = new control.ControlManager(total, index);
        index = ControlManager.next();
        count = 1;
        await getData(index);//等待，让缓存有数据
        changeState();
        start(duration,0,true);
    });
    $('.play-btn').on('click', function () {
        if (count === 1) { //控制点击
            audio.getAudio(cache[index].audio);
            count++;
        }
        if (audio.status === 'play') { //正在播放，按了暂停
            audio.pause();
            $(this).removeClass('pause');
            stop();
        } else {//没播放，按了开始
            audio.play();
            start(cache[index].duration,0,false);
            $(this).addClass('pause');
        }
    })
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
        let x = e.changedTouches[0].clientX;
        let percent = (x - left) / width;
        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }
        let curTime = Math.round(percent * duration);
        audio.playTo(curTime);
        start(duration, percent,false);
        $('.play-btn').addClass('pause');
    })
}

getData(index);
bindEvent();
bindTouch();