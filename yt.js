/**
 *  yt.js
 *
 *  Author   : Ryan Chen
 *  Reference: Yuotube Iframe API
 *  Version  : 1.0.0
 *  Create   : 2019.09.24
 *  License  : MIT
 */

/**
 * [Youtube iframe_api]
 * @param  {String}   selector        div的id(此div會變成iframe)
 * @param  {Function} readyCallback   ready callback
 * @param  {Function} playingCallback playing callback
 * @param  {Function} pausedCallback  pause callback
 * @param  {Function} endedCallback   end callback
 * @return {Object}                   Player Object (.playVideo()/.pauseVideo()/.stopVideo())
 */

var youTubeIframePlayer = function(selector, readyCallback, playingCallback, pausedCallback, endedCallback) {
    // *** must be executed after iframe_api sdk loaded!!!
    // html
    // use "ythtml1" snippet
    // 1. <script src="https://www.youtube.com/iframe_api"></script>
    // use "ythtml2" snippet
    // 2. <div class="yt-box"><div id="ytIframe" data-playerid="XXXXXXXXXX"></div></div>

    // css
    // use "ytcss" snippet

    // js
    // use "ytjs" snippet
    var YTPlayer = new YT.Player(selector, {
        videoId: document.getElementById(selector).getAttribute('data-playerid'),
        width: '',
        height: '',
        playerVars: {
            controls: 0,
            rel: 0,
            showinfo: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    function onPlayerReady(event) {
        // event.target.playVideo();
        readyCallback && readyCallback();
    };

    function onPlayerStateChange(event) {
        switch (event.data) {
            case YT.PlayerState.UNSTARTED:
                // console.log('UNSTARTED');
                break;
            case YT.PlayerState.PLAYING:
                // console.log('PLAYING');
                playingCallback && playingCallback();
                break;
            case YT.PlayerState.PAUSED:
                // console.log('PAUSED');
                pausedCallback && pausedCallback();
                break;
            case YT.PlayerState.ENDED:
                // console.log('ENDED');
                endedCallback && endedCallback();
                break;
            case YT.PlayerState.BUFFERING:
                // console.log('BUFFERING');
                break;
            case YT.PlayerState.CUED:
                // console.log('CUED');
                break;
        };
    };

    return YTPlayer;
};

// InitYoutube();