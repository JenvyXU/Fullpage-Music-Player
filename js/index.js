var EventCenter = {
        on: function(type, handler) {
            $(document).on(type, handler)
        },
        fire: function(type, data) {
            $(document).trigger(type, data)
        }
    }
    // EventCenter.fire('xxx', '666')
    // EventCenter.on('xxx', function(e, data) { console.log(data) })
    // console.log(1)

var Footer = {
    init: function() {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToStart = true
        this.isToEnd = false
        this.isAnimate //连续快速点击出bug

        this.bind()
        this.render()
    },
    bind: function() {
        var _this = this
        var itemWidth = _this.$box.find('li').outerWidth(true)
        var rowCount = Math.floor(_this.$box.width() / itemWidth)
        this.$rightBtn.on('click', function() {
            if (_this.isAnimate) return
            if (!_this.isToEnd) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + rowCount * itemWidth
                }, 400, function() {
                    _this.isToStart = false
                    _this.isAnimate = false
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
                        _this.isToEnd = true
                    }
                })
            }
        })

        this.$leftBtn.on('click', function() {
            if (_this.isAnimate) return
            if (!_this.isToStart) {
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '+=' + rowCount * itemWidth
                }, 400, function() {
                    _this.isAnimate = false
                    _this.isToEnd = false
                    if (parseFloat(_this.$ul.css('left')) >= 0) {
                        _this.isToStart = true
                    }
                })
            }
        })

        this.$ul.on('click', 'li', function() {
            $(this).addClass('active').siblings().removeClass('active')
            EventCenter.fire('select-albumn', $(this).attr('data-channel-id'))
        })
















    },
    render: function() {
        var _this = this
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
            .done(function(ret) {
                _this.renderFooter(ret.channels)
            }).fail(function() {
                console.log('error')
            })
    },
    setStyle: function() {
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true)
        this.$footer.find('ul').css({
            width: count * width
        })
    },
    renderFooter: function(channels) {
        var html = ''
        channels.forEach(function(channel) {
            html += `
            <li data-channel-id=${channel.channel_id}>
                <div class="cover" style="background-image:url(${channel.cover_middle})"></div>
                <h3>${channel.name}</h3>
            </li>`
        })
        this.$footer.find('ul').html(html)
        this.setStyle()
    }

}

var App = {
    init: function() {
        this.bind()
    },
    bind: function() {
        EventCenter.on('select-albumn', function(e, data) {
            console.log(data)
        })
    }
}

Footer.init()
App.init()