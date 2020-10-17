
var widgetUrl = 'https://soundcloud.com/tuvaliofficial/feels-so-good&show_teaser=false&color=#1a1614';

var SOCKET = io.connect()
var iframe = document.getElementById('player');
iframe.src = 'https://w.soundcloud.com/player/?url=' + widgetUrl;
var widget = SC.Widget(iframe);
var joined = false;

setCounterListView()

widget.bind(SC.Widget.Events.FINISH, function (e) {
    if (joined) {
        SOCKET.emit('finish', 'change')
    }
});

SOCKET.on('add', function (data) {
    if (joined) {
        setCounterListView()
        $.getJSON('./playlist', function (data) {
            if (data.playlist.length == 1) {
                $('#player-div').show();
                widget.load(data.playlist[0], { auto_play: true, show_teaser: false });
                widget.bind(SC.Widget.Events.READY, function (eventData) {
                    widget.play();
                });
            }
        })
    }
});

SOCKET.on('play', function (data) {
    if (joined) {
        widget.seekTo(data + 100)
        widget.play()
    }
});

SOCKET.on('pause', function (data) {
    if (joined) {
        widget.pause()
        widget.seekTo(data)
    }
});

SOCKET.on('volume', function (data) {
    if (joined) {
        widget.setVolume(data)
        $('#volume').val(data)
    }
});

SOCKET.on('finish', function (data) {
    if (joined) {
        setCounterListView()
        $.getJSON('./playlist', function (data) {
            if (data.playlist.length == 0) {
                setNotificationError('There are no songs in the list. Add the songs you want by entering the link.')
            } else {
                setNotificationSuccess('Next song! There are ' + data.playlist.length + ' songs in the list.')
                widget.load(data.playlist[0], { auto_play: true, show_teaser: false });
                widget.bind(SC.Widget.Events.READY, function (eventData) {
                    widget.play();
                });
            }
        })
    }
});

$('#add').click(function (e) {
    e.preventDefault();
    addTrack($('#url').val())
});

$('#btn-play').click(function (e) {
    e.preventDefault();
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
        SOCKET.emit('play', e.currentPosition)
        widget.unbind(SC.Widget.Events.PLAY_PROGRESS)
    });
});

$('#btn-pause').click(function (e) {
    e.preventDefault();
    widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
        SOCKET.emit('pause', e.currentPosition)
    });
});

$('#btn-skip').click(function (e) {
    e.preventDefault();
    SOCKET.emit('finish', 'change')
});

$('#volume').change(function (e) {
    e.preventDefault();
    setVol($('#volume').val())
});

$('#join').click(function (e) {
    e.preventDefault();
    joined = true
    $.getJSON('./playlist', function (data) {
        widget.load(data.playlist[0], { auto_play: true, show_teaser: false });
    })
    $('#player-div').show();
    $(this).hide();
    widget.bind(SC.Widget.Events.READY, function (eventData) {
        widget.play();
    });
});

function addTrack(val) {
    if (val.startsWith('https://soundcloud.com/') || val.startsWith('https://m.soundcloud.com/') || val.startsWith('https://www.soundcloud.com/')) {
        (val.startsWith('https://soundcloud.com/')) ? SOCKET.emit('add', val.replace('https://soundcloud.com/', '')) : '';
        (val.startsWith('https://m.soundcloud.com/')) ? SOCKET.emit('add', val.replace('https://m.soundcloud.com/', '')) : '';
        (val.startsWith('https://www.soundcloud.com/')) ? SOCKET.emit('add', val.replace('https://www.soundcloud.com/', '')) : '';
        setNotificationSuccess('Song added!')
    } else {
        setNotificationError('Incorrect link.')
    }
    $('#url').val('')
    setCounterListView()
}

function setVol(val) {
    SOCKET.emit('volume', val)
}

function setNotificationSuccess(str) {
    toastr.options.closeButton = true;
    toastr.options.positionClass = 'toast-bottom-right'
    toastr.success(str, '<i>Success</i>')
}

function setNotificationError(str) {
    toastr.options.closeButton = true;
    toastr.options.positionClass = 'toast-bottom-right'
    toastr.error(str, '<i>Error</i>')
}

function setCounterListView() {
    $.getJSON('./playlist', function (data) {
        $('#counter-list').text(data.playlist.length);
    })
}