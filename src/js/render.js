import guss from './gaussBlur'
import {renderEndTime} from './formatTime'

function renderSongInfo(song, singer, album) {
    let template = `<div class="song-name">${song}</div><div class="singer-name">${singer}</div><div class="album-name">${album}</div>`;
    $('.song-info').html('').append($(template));
}

function renderImage(image) {
    let img = new Image();
    img.src = require('../assets/' + image);
    img.onload = function () {
        guss.blurImg(img, $('body'));
        $('.img-wrapper').html('').append(img);
    }
}

function renderFavorite(isLike) {
    if (isLike) {
        $('.favorite-btn').addClass('like')
    } else {
        $('.favorite-btn').removeClass('like')
    }
}



export function render(data) {
    let {image, song, album, singer, duration, isLike} = data;
    renderSongInfo(song, singer, album);
    renderImage(image);
    renderFavorite(isLike);
    renderEndTime(duration , '.total-time');
}

export function renderSongList(data) {
    {/*<div className="song-list-info">*/}
    {/*</div>*/}

    let len = data.length;
    for (let i = 0; i < len; i++){
        let {song,album,singer} = data[i];
        let songListInfo = $(`<div class="song-list-info"  data-page=${i}></div>`);
        let str = `<div class="song-list-about"><p class="song--list-name">${song}</p><div class="song-list-other"><div class="singer-album">${singer} * ${album}</div></div><div class="play-song" data-index=${i}></div></div>`;
        songListInfo.append($(str));
        $('.song-list').append(songListInfo)
    }
}
