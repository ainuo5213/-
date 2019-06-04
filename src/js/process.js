import {renderEndTime} from './formatTime'

let timer = null, curDuration = 0, lastPercent = 0, startTime = 0;

function start(duration, per, cut) {
    lastPercent = cut === true ? 0 : per === 0 ? lastPercent : per;
    cancelAnimationFrame(timer);
    startTime = new Date().getTime();
    curDuration = duration;

    function frame() {
        let curTime = new Date().getTime();
        let percent = lastPercent + (curTime - startTime) / (duration * 1000);
        timer = requestAnimationFrame(frame);
        update(percent);
    }

    frame();
}


function update(percent) {
    let curTime = percent * curDuration;
    renderEndTime(curTime, '.start-time');
    changePro(percent);
}

function changePro(percent) {
    let percentage = (percent - 1) * 100 + '%';
    $('.process-top').css({
        'transform': 'translateX(' + percentage + ')'
    })
}

function stop() {
    let stopTime = new Date().getTime();
    lastPercent = lastPercent + (stopTime - startTime) / (curDuration * 1000); //每一次的暂停都将上一次的叠加起来
    cancelAnimationFrame(timer);
}

export {
    start, stop, update
}