import EventCenter from './EventCenter'
import '../css/fm.css'
import boomText from './BoomText'
$.fn.boomText=boomText

export default {
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