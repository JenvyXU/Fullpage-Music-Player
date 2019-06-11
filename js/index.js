var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}
// EventCenter.fire('xxx', '666')
// EventCenter.on('xxx', function(e, data) { console.log(data) })

var Footer = {
    init: function () {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToStart = true
        this.isToEnd = false
        this.isAnimate //连续快速点击出bug

        this.render()
        this.bind()
    },
    bind: function () {
        var _this = this
        var itemWidth = _this.$box.find('li').outerWidth(true)
        var rowCount = Math.floor(_this.$box.width() / itemWidth)
        this.$rightBtn.on('click', function () {
            if (_this.isAnimate) return
            if (!_this.isToEnd) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + rowCount * itemWidth
                }, 400, function () {
                    _this.isToStart = false
                    _this.isAnimate = false
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
                        _this.isToEnd = true
                    }
                })
            }
        })

        this.$leftBtn.on('click', function () {
            if (_this.isAnimate) return
            if (!_this.isToStart) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '+=' + rowCount * itemWidth
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToEnd = false
                    if (parseFloat(_this.$ul.css('left')) >= 0) {
                        _this.isToStart = true
                    }
                })
            }
        })

        this.$footer.on('click', 'li', function () {
            $(this).addClass('active').siblings().removeClass('active')
            EventCenter.fire('select-albumn', {
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            })
        })

    },
    render: function () {
        var _this = this
        $.getJSON('https://jirenguapi.applinzi.com/fm/getChannels.php')
            .done(function (ret) {
                _this.renderFooter(ret.channels)
            }).fail(function () {
                console.log('error')
            })
    },
    setStyle: function () {
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true)
        this.$footer.find('ul').css({
            width: count * width
        })
    },
    renderFooter: function (channels) {
        var html = ''
        channels.forEach(function (channel) {
            html += `
            <li data-channel-id=${channel.channel_id} data-channel-name="${channel.name}">
                <div class="cover" style="background-image:url(${channel.cover_middle})"></div>
                <h3>${channel.name}</h3>
            </li>`
        })
        this.$footer.find('ul').append(html)
        this.setStyle()
    }

}

var Fm = {
    init: function () {
        this.$container = $('.page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.currentSong = null
        this.collections = this.loadFromLocal()
        this.scrollTitle()
        this.bind()
        this.playCollections()
    },
    bind: function () {
        var _this = this
        EventCenter.on('select-albumn', function (e, channelObj) {
            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            clearInterval(_this.statusClock)
            _this.loadMusic()

        })

        this.$container.find('.btn-play').on('click', function () {
            var $btn = $(this)
            if ($btn.hasClass('icon-play')) {
                $btn.removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            } else {
                $btn.removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
        })
        this.$container.find('.btn-next').on('click', function () {
            clearInterval(_this.statusClock)
            _this.loadMusic()
        })
        this.audio.addEventListener('play', function () {
            _this.statusClock = setInterval(function () {
                _this.updateStatus()
            }, 1000)
        })
        this.audio.addEventListener('pause', function () {
            clearInterval(_this.statusClock)
        })
        this.audio.addEventListener('ended', function () {
            clearInterval(_this.statusClock)
            _this.loadMusic()
        })
        this.$container.find('.bar').on('click', function (e) {
            var currentTime = parseFloat(e.offsetX) / parseFloat($(this).width()) * _this.audio.duration
            _this.audio.currentTime = currentTime
        })
        this.$container.find('.btn-collect').on('click', function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active')
                delete _this.collections[_this.currentSong.sid]
            } else {
                $(this).addClass('active')
                _this.collections[_this.currentSong.sid] = _this.currentSong
            }
            _this.saveToLocal()
        })
    },

    playCollections() {
        if (Object.keys(this.collections).length !== 0) {
            EventCenter.fire('select-albumn', {
                channelId: 'collections',
                channelName: '我的收藏'
            })
        } else {
            EventCenter.fire('select-albumn', {
                channelId: 'public_shiguang_90hou',
                channelName: '90后'
            })
        }
    },
    loadMusic() {
        var _this = this
        if (_this.channelId === 'collections' && Object.keys(_this.collections).length !== 0) {
            _this.song = _this.loadCollections()
            _this.setMusic()
            _this.loadLyric()

        } else {
            $.getJSON('https://jirenguapi.applinzi.com/fm/getSong.php', { channel: this.channelId })
                .done(function (ret) {
                    _this.song = ret['song'][0]
                    _this.setMusic()
                    _this.loadLyric()
                })
        }

        this.$container.find('.song-name h1').stop(true, true)
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
    },
    setMusic() {
        this.audio.src = this.song.url
        this.currentSong = this.song
        $('.bg').css('background-image', 'url(' + this.song.picture + ')')
        this.$container.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')')
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.detail .author').text(this.song.artist)
        this.$container.find('.tag').text(this.channelName)
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
        if (this.collections[this.song.sid]) {
            this.$container.find('.btn-collect').addClass('active')
        } else {
            this.$container.find('.btn-collect').removeClass('active')
        }
    },
    updateStatus() {
        var min = Math.floor(this.audio.currentTime / 60)
        var sec = Math.floor(this.audio.currentTime % 60) + ''
        sec = sec.length === 2 ? sec : '0' + sec
        this.$container.find('.current-time').text(min + ':' + sec)
        this.$container.find('.bar-progress').css('width', 100 * this.audio.currentTime / this.audio.duration + '%')
        var line = this.lyricObj['0' + min + ':' + sec]
        if (line) {
            this.$container.find('.lyric p').text(line).boomText()
        }
    },
    loadLyric() {
        var _this = this
        $.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php', { sid: this.song.sid })
            .done(function (ret) {
                var lyric = ret.lyric
                var lyricObj = {}
                lyric.split('\n').forEach(function (line) {
                    //[01:10.25] [01:20.25] It's a good time
                    var times = line.match(/\d{2}:\d{2}/g)
                    //times===['01:10', '01:20']
                    var str = line.replace(/\[.+?\]/g, '')
                    if (Array.isArray(times)) {
                        //把时间和歌词做成一个对象
                        times.forEach(function (time) {
                            lyricObj[time] = str
                        })
                    }
                })
                _this.lyricObj = lyricObj

            })
    },
    scrollTitle() {
        var _this = this
        function swipe() {
            var outterWidth = parseFloat(_this.$container.find('.song-name').css('width'))
            var innerWidth = parseFloat(_this.$container.find('.song-name h1').css('width'))
            if (outterWidth < innerWidth) {
                _this.$container.find('.song-name h1').animate({ left: outterWidth - innerWidth }, 4000, 'linear', function () {
                    _this.$container.find('.song-name h1').css({ left: 0 })
                }).animate({ left: 0 }, function () {
                    swipe()
                })
            }
        }
        swipe()
    },
    loadFromLocal() {
        return JSON.parse(localStorage['collections'] || '{}')
    },
    saveToLocal() {
        localStorage['collections'] = JSON.stringify(this.collections)
    },
    loadCollections() {
        var keyArr = Object.keys(this.collections)
        if (keyArr.length === 0) return
        var randomIndex = Math.floor(Math.random() * keyArr.length)
        var randomSid = keyArr[randomIndex]
        return this.loadFromLocal()[randomSid]
    }
}

$.fn.boomText = function (type) {
    type = type || 'rollIn'
    this.html(function () {
        var arr = $(this).text().split('').map(function (word) {
            return '<span class="boomText">' + word + '</span>'
        })
        return arr.join('')
    })
    var index = 0
    var $boomTexts = $(this).find('span')
    var clock = setInterval(function () {
        $boomTexts.eq(index).addClass('animated ' + type)
        index++
        if (index >= $boomTexts.length) {
            clearInterval(clock)
        }
    }, 200)
}


Footer.init()
Fm.init()