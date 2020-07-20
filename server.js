const express = require('express');
const path = require('path');

require('events').EventEmitter.defaultMaxListeners = 0;

var port = process.env.PORT || 3000;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const DataStore = require('nedb');
const Database = new DataStore('activestars.db');
Database.loadDatabase();

var arractivestars;
var totalStars;

Database.find({}, (err, data) => {
    if (err) {
        response.end();
        return;
    }
    
    if (data.length <= 0) {
        Database.insert({activestars: []})
    } else {
        arractivestars = data[0].activestars
        console.log(arractivestars)
    }
});

app.use(express.static(path.join(__dirname, 'templates')));
app.set('views', path.join(__dirname , 'templates'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});

io.on('connection', socket => {
    console.log(`Socket: ${socket.id}`);
    totalStars = arractivestars.length;
    socket.emit('starsActivated', totalStars);
    
    var spawn = require('child_process').spawn,
    ls    = spawn('python',['index.py']);

    ls.stdout.on('data', function (data) {
        socket.emit('numberStars', String(data));
    });

    socket.on('id', data => {
        Database.update({_id: "J5wGSxZi0ndwChSE"}, {$push: {activestars: data}})
        arractivestars.push(data);
        socket.broadcast.emit('recived message', data);
    })

    socket.on('confirmation', () => {
        socket.emit('estrelas encorporadas', arractivestars);
    });

    socket.on('player pos', data => {
        socket.broadcast.emit('player x', data);

        socket.on('disconnect', function(){
            socket.broadcast.emit('disconected id', data)
        });
    });
});

server.listen(port, () => {
    console.log(`listening at port ${port}`);
});
