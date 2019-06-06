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
        this.bind()
        this.render()
    },
    bind: function() {
        var _this = this
        this.$rightBtn.on('click', function() {

        })
















    },
    render: function() {
        var _this = this
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
            .done(function(ret) {
                _this.renderFooter(ret.channels)
                console.dir(ret)
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

Footer.init()