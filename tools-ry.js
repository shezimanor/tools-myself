/**
 *  tools.js
 *
 *  Author   : Ryan Chen
 *  Reference: Hank Hsiao
 *  Version  : 1.1.0
 *  Create   : 2018.07.31
 *  Update   : 2019.09.20
 *  License  : MIT
 */

var Tools = (function(window) {

    var nativeCeil = Math.ceil,
        nativeFloor = Math.floor,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeNow = Date.now,
        nativeRandom = Math.random;

    /**
     * [隨機取得 min ~ max 間的數值(含小數點)]
     * @param  {Number} min 
     * @param  {Number} max 
     * @return {Number}    
     */
    var randomRange = function(min, max) {
        return min + nativeRandom() * (max - min); 
    };

    /**
     * [隨機取得 min ~ max 間的數值(整數)]
     * @param  {Number} min 
     * @param  {Number} max 
     * @return {Number}    
     */
    var randomInt = function(min, max) {
        return nativeFloor(min + nativeRandom() * (max - min + 1)); 
    };

    /**
     * [預載圖片、影片、音檔]
     * @param  {Object} option 請直接使用snippet preloader
     */
    var preloader = function(option) {
        var queue = {}; //儲存載完的檔案
        var settings = {
            manifest: [],
            onEachLoad: function(info) { console.log('[Preloader] ' + info.index + ' loaded');},
            onAllLoad: function(queue) { console.log('[Preloader] all completed:' + queue);}
        };

        // option extend settings (淺拷貝)
        var key;
        for (key in settings) {
            if (option[key]) { settings[key] = option[key]; }
        }

        var allQty = settings.manifest.length; // 資源數量(未載入)
        var loadedQty = 0; // 已經載入完成的資源數量

        function handleLoadEvent(data) {
            settings.onEachLoad(data);
            queue[data.id] = data;
            if (loadedQty === allQty) {
                settings.onAllLoad(queue);
            }
        }

        var handler = {
            image: function(id, e) {
                loadedQty++;
                var data = {
                    id: id,
                    index: loadedQty,
                    total: allQty,
                    img: this
                };
                handleLoadEvent(data)
            },
            audio: function(id, e) {
                if (e.target.status === 200) {
                    loadedQty++;
                    var data = {
                        id: id,
                        index: loadedQty,
                        total: allQty,
                        audio: this
                    };
                    this.src = URL.createObjectURL(e.target.response);
                    handleLoadEvent(data)
                } else {
                    onError(id);
                }
            },
            video: function(id, e) {
                if (e.target.status === 200) {
                    loadedQty++;
                    var data = {
                        id: id,
                        index: loadedQty,
                        total: allQty,
                        video: this
                    };
                    this.src = URL.createObjectURL(e.target.response);
                    handleLoadEvent(data)
                } else {
                    onError(id);
                }
            }
        };

        function onError(id) {
            console.error('[Preloader] not found : ' + id);
        }

        for (var i = 0; i < allQty; i += 1) {
            var preloadObj = settings.manifest[i];
            if (preloadObj.type === 'audio') {
                var audio = document.createElement('audio');
                var xhr = new XMLHttpRequest();
                xhr.open('GET', preloadObj.src, true);
                xhr.responseType = 'blob';
                xhr.addEventListener('load', handler.audio.bind(audio, preloadObj.id), false);
                xhr.addEventListener('error', onError.bind(audio, preloadObj.id), false);
                xhr.send();
            } else if (preloadObj.type === 'video') {
                var video = document.createElement('video');
                var xhr = new XMLHttpRequest();
                xhr.open('GET', preloadObj.src, true);
                xhr.responseType = 'blob';
                xhr.addEventListener('load', handler.video.bind(video, preloadObj.id), false);
                xhr.addEventListener('error', onError.bind(video, preloadObj.id), false);
                xhr.send();
            } else {
                var img = document.createElement('img');
                img.addEventListener('load', handler.image.bind(img, preloadObj.id), false);
                img.addEventListener('error', onError.bind(img, preloadObj.id), false);
                img.src = preloadObj.src;
            }
        }
    };

    /**
     * [取得 URL 所有參數]
     * @return {Object}      網址參數
     */
    var getUrlVars = function() {
        var vars = {}, hash;
        var hashes = window.location.search.slice(window.location.search.indexOf('?') + 1).split('&'); //改這寫法才不會取到#
        for (var i = 0, len = hashes.length; i < len; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    /**
     * [取得 URL 指定參數的值]
     * @param  {String} name 網址參數 name
     * @return {String}      網址參數 value
     */
    var getUrlVar = function(name) {
        return getUrlVars()[name];
    };

    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    /**
     * [判斷是否為行動裝置]
     */
    var isMobile = userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/Android/i) ? true : false;
    
    var isiOS = userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) ? true : false;

    /**
     * [判斷是否為line 或是 fb]
     * @type {Boolean}
     */
    var isInapp = userAgent.toLowerCase().match(/fb/i) || userAgent.toLowerCase().match(/line/i);

    /**
     * [行動裝置的 touch 事件字串，若不是行動裝置，取得 mouse 事件字串]
     */
    var Event = (function () {
        if (isMobile) {
            return {
                down : 'touchstart',
                move : 'touchmove',
                up : 'touchend'
            }
        } else {
            return {
                down: 'mousedown',
                move: 'mousemove',
                up: 'mouseup'
            };
        };
    })();

    /**
     * [打亂陣列順序]
     * @param  {Array}  array 指定的陣列
     * @param  {number} size  array 的長度 可傳可不傳
     * @return {Array}        原本的陣列(被打亂過後)
     */
    var shuffleSelf = function(array, size) {
        var index = -1,
            length = array.length,
            lastIndex = length - 1;

        size = size === undefined ? length : size;
        while (++index < size) {
            var rand = randomInt(index, lastIndex),
                value = array[rand];

            array[rand] = array[index];
            array[index] = value;
        }
        array.length = size;
        return array;
    };

    /**
     * [深拷貝]
     * @param  {Function} Parent 父物件
     * @param  {Function} Child  子物件
     */
    var deepCopy = function(p, c) {
        var c = c || {};

        for (var i in p) {
            if (typeof p[i] === 'object') {
                // 如果 property 是物件或陣列
                c[i] = (p[i].constructor === Array) ? [] : {};
                deepCopy(p[i], c[i]);
            } else {
                // 淺拷貝
                c[i] = p[i];
            }
        }

        c.uber = p;

        return c;
    };

    /**
     * [動畫結束確認]
     */
    var animationEnd = (function(el) {
        var animations = {
            animation: 'animationend',
            OAnimation: 'oAnimationEnd',
            MozAnimation: 'mozAnimationEnd',
            WebkitAnimation: 'webkitAnimationEnd'
        };

        for (var t in animations) {
            if (el.style[t] !== undefined) {
                return animations[t];
            };
        };
    })(document.createElement('div'));

    /**
     * [設定 Cookie]
     * @param  {String} cname Cookie 名稱
     * @param  {String} cvalue Cookie 值
     * @param  {Number} exdays 天數
     */
    var setCookie = function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        cvalue = encodeURIComponent(cvalue);
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };

    /**
     * [設定 Cookie (短時數: 基本單位1分鐘)]
     * @param  {String} cname Cookie 名稱
     * @param  {String} cvalue Cookie 值
     * @param  {Number} exmins 分鐘數
     */
    var setCookie2 = function(cname, cvalue, exmins) {
        var d = new Date();
        d.setTime(d.getTime() + (exmins * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        cvalue = encodeURIComponent(cvalue);
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };

    /**
     * [刪除 Cookie]
     * @param  {String} cname Cookie 名稱
     */
    var delCookie = function (cname) {
        document.cookie = cname + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    };

    /**
     * [取得Cookie]
     * @param  {String} cname Cookie 名稱
     * @return {String} Cookie 值
     */
    var getCookie = function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            };
            if(c.indexOf(name) == 0) {
                return decodeURIComponent(c.substring(name.length, c.length));
            };
        };
        return '';
    };

    /**
     * [auto-font-size]
     * @param  {String} selector el string
     * @param  {Number} baseWidth 最小寬度，通常為320
     * @param  {Number} maxWidth 最大寬度
     */
    var afs = function(selector, baseWidth, maxWidth) {
        var element = document.querySelector(selector);
        if (element === null) {
            return;
        }
        var html = document.getElementsByTagName('html')[0];
        var oWidth;
        
        function resize() {
            oWidth = element.offsetWidth;
            if (typeof maxWidth === 'number' && oWidth > maxWidth) {
                oWidth = maxWidth;
            }
            element.style.fontSize = oWidth / baseWidth  * 100 + '%';
        }

        window.addEventListener('resize', resize);

        resize();
    };

    /**
     * [取得滑鼠座標]
     */
    var coordinate = function(e) {
        var rect = e.target.getBoundingClientRect();

        var clientX = e.clientX;
        var clientY = e.clientY;

        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        };

        var xCoor = clientX - rect.left;
        var yCoor = clientY - rect.top;

        return {
            x: xCoor,
            y: yCoor
        };
    };

    /**
     * [視窗捲動]
     * @param  {String} el #id
     * @param  {Number} duration 毫秒
     * @param  {String} easeName 預設'linear'
     */
    var winScrollTo = function(el,duration,easeName,buffer) {
        var curPostion = window.scrollY;
        var n = (buffer) ? buffer : 0;
        var targetElOffsetTop = (el === 'body') ? 0 : (window.scrollY + document.getElementById(el).getBoundingClientRect().top + n);
        var easeFn = easeName ? easeName : 'linear';
        var easingObj = {
            linear: function (t) { return t },
            easeInQuad: function (t) { return t*t },
            easeOutQuad: function (t) { return t*(2-t) },
            easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
            easeInCubic: function (t) { return t*t*t },
            easeOutCubic: function (t) { return (--t)*t*t+1 },
            easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
            easeInQuart: function (t) { return t*t*t*t },
            easeOutQuart: function (t) { return 1-(--t)*t*t*t },
            easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
            easeInQuint: function (t) { return t*t*t*t*t },
            easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
            easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
            bounce: function(t) {
                for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
                    if (t >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * t) / 4, 2) + Math.pow(b, 2);
                    };
                };
            },
            elastic: function(t,x) { // 要多帶一個值
                x = x || 1.5;
                return Math.pow(2, 10 * (t - 1)) * Math.cos(20 * Math.PI * x / 3 * t);
            },
            back: function(t,x) { // 要多帶一個值
                x = x || 1.5;
                return Math.pow(t, 2) * ((x + 1) * t - x);
            }
            
        };

        function scrollDraw(progress) {
            var realProgress = progress * (curPostion-targetElOffsetTop);
            window.scrollTo(0, curPostion - realProgress);
        };

        function animate(timing, draw, duration) {
            var start = performance.now();
            function update(time) {
                // timeFraction goes from 0 to 1
                var timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;

                // calculate the current animation state
                var progress = timing(timeFraction);

                draw(progress); // draw it

                if (timeFraction < 1) {
                    requestAnimationFrame(update);
                };
            };
            requestAnimationFrame(update);
        };

        if(curPostion !== targetElOffsetTop) animate(easingObj[easeFn], scrollDraw, duration);

    };

    /**
     * menu 工廠
     * @param  {Object} btn1 按鈕(開)
     * @param  {Object} btn2 按鈕(關)
     * @param  {Object} container 對象容器
     * @param  {String} toggleClassName 用來切換的 class 名稱， 通常是'hide'
     * @return {Object} MenuFactory 物件
     */
    var menuFactory = function (btn1, btn2, container, toggleClassName) {
        
        // FSM
        var Menu = function () {
            this.currState = FSM.off;
            this.btn1 = btn1;
            this.btn2 = btn2;
            this.container = container;
        };

        Menu.prototype.init = function () {
            var self = this;
            this.btn1.addEventListener('click', function(e) {
                self.currState.btnBePress.call(self); // 把請求委託給FSM狀態機
            });
            this.btn2.addEventListener('click', function(e) {
                self.currState.btnBePress.call(self); // 把請求委託給FSM狀態機
            });
        };

        var FSM = {
            on: {
                btnBePress: function () {
                    this.container.classList.add(toggleClassName);
                    this.currState = FSM.off;
                    this.btn1.classList.remove(toggleClassName);
                    this.btn2.classList.add(toggleClassName);
                }
            },
            off: {
                btnBePress: function () {
                    this.container.classList.remove(toggleClassName);
                    this.currState = FSM.on;
                    this.btn1.classList.add(toggleClassName);
                    this.btn2.classList.remove(toggleClassName);
                }
            }
        };

        // before init setting
        btn2.classList.add(toggleClassName);
        container.classList.add(toggleClassName);

        // init Menu
        var MenuFactory = new Menu();
        MenuFactory.init();

        return MenuFactory;
    };

    return {
        preloader: preloader,
        randomRange: randomRange,
        randomInt: randomInt,
        getUrlVars: getUrlVars,
        getUrlVar: getUrlVar,
        isMobile: isMobile,
        isiOS: isiOS,
        isInapp: isInapp,
        Event: Event,
        shuffleSelf: shuffleSelf,
        deepCopy: deepCopy,
        animationEnd: animationEnd,
        setCookie: setCookie,
        setCookie2: setCookie2,
        delCookie: delCookie,
        getCookie: getCookie,
        afs: afs,
        coordinate: coordinate,
        winScrollTo: winScrollTo,
        menuFactory: menuFactory
    };

})(window);
