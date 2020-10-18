var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

var users = []
var userConnections = []
var playlist = []

app.use(express.static(__dirname + '/../public'))
app.get('/', function (req, res) { res.sendFile(__dirname + '/../public/index.html') })
app.get('/users', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	res.json({ users: userConnections.length })
})
app.get('/playlist', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	res.json({ playlist: playlist })
})

io.sockets.on('connection', function (socket) {
	userConnections.push(socket)

	socket.on('disconnect', function (data) {
		users.splice(users.indexOf(socket.username), 1)
		userConnections.splice(userConnections.indexOf(socket), 1)
	})

	socket.on('add', function (data) {
		playlist.push('https://soundcloud.com/' + data)
		io.sockets.emit('add', playlist)
	})

	socket.on('finish', function (data) {
		playlist.shift()
		io.sockets.emit('finish', playlist)
	})

	socket.on('seek', function (data) {
		io.sockets.emit('seek', data)
	})

	socket.on('play', function (data) {
		io.sockets.emit('play', data)
	})

	socket.on('pause', function (data) {
		io.sockets.emit('pause', data)
	})

	socket.on('volume', function (data) {
		io.sockets.emit('volume', data)
	})

})

server.listen(process.env.PORT || 2019)
console.log('Server is running...')
