export default function (type) {
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



