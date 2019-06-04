import $ from "zepto-webpack";

export {
    renderEndTime
}

function renderEndTime(duration, el) {
    let minutes = ('0' + (Math.floor(duration / 60))).slice(-2);//分钟
    let seconds = ('0' + Math.round((duration - minutes * 60))).slice(-2);
    let durationStr = minutes + ':' + seconds;
    $(el).html(durationStr);
}