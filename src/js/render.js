import $ from 'zepto-webpack'
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