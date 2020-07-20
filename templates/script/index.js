// html consts
const sky1 = document.querySelector('#sky1');
const sky2 = document.querySelector('#sky2');
const canvas = document.querySelector('#canvas');
const canvas2 = document.querySelector('#canvas2');
const starInfo = document.querySelector('#starInfo');
const starID = document.querySelector('#starID');
const textInfo = document.querySelector('#infoText');
const screenInfo = document.querySelector('#infoScreen');
const loading = document.querySelector('#loading');
const numeroStars = document.querySelector('#numeroStars');
const audio = document.querySelector('#audio');
const music = document.querySelector('#music');
const upKey = document.querySelector('#up');
const spaceKey = document.querySelector('#spacebar');
const leftKey = document.querySelector('#left');
const rightKey = document.querySelector('#right');
const bottomkeys = document.querySelector('#bottomKeys');
const keysContainer = document.querySelector('#controllers');

// configs
const c = canvas.getContext('2d');
const c2 = canvas2.getContext('2d');
canvas.width = window.innerWidth;
canvas2.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas2.height = window.innerHeight;
sky1.style.width = `${canvas.width}px`;
sky1.style.height = `${canvas.height}px`;
sky2.style.width = `${canvas.width}px`;
sky2.style.height = `${canvas.height}px`;

// Default values
const floor_size = 100;
const player_sizew = 84;
const player_sizeh = 125;
var floor_width;
var piso1_x = 0;
var piso2_x = canvas.width;
var piso_y = canvas.height - floor_size;
var player_y = canvas.height - (floor_size + player_sizeh);
var player_x = canvas.width/2 - player_sizew/2;
var player_yvel = 5;
var player_xvel = 5;
var vy = 0.1;
var dy = 0.0001;
var g;
var count_stars = 0;
var estrelas_ativas = [];
var pontoInicialX = canvas.width/2;
var atualizador = 0;
var location_place = 0;
var deaths;
var confirmed;
var recovered;
var starsActivated;
var infosIndex = 0;
var lamp_x = 0;

// socket
var socket = io.connect('https://wash-your-hand.herokuapp.com/');

// user
const sprite = new Image();
sprite.src = 'images/sprite3.png';

// images
var piso1 = new Image();
piso1.src = 'images/predas.jpg';
var piso2 = new Image();
piso2.src = 'images/predas.jpg';
var star = new Image();
star.src = 'images/star.png'
var placeholder = new Image();
placeholder.src = 'images/placeholder.png';
var placeholder_active_global = new Image();
placeholder_active_global.src = 'images/star_active.png';
var ghost = new Image();
ghost.src = 'images/ghost.png';
var lamp = new Image();
lamp.src = 'images/street lamp.png';

// Key default values
var direita = false, esquerda = false, cima = false, space = false;
const move_left = 37;
const move_up = 38;
const move_right = 39;
const move_down = 40;
const space_bar = 32; 

document.addEventListener('DOMContentLoaded', () => {    
    // define user
    const usuario = new Sprite(sprite);

    // achar obj em array
    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].id === obj.id) {
                return true;
            }
        }
    
        return false;
    }

    // id unico
    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const id = makeid(5);

    // receber o número de estrelas ativas
    socket.on('starsActivated', data => {
        starsActivated = data;
    })

    // Key release
    function keyup(e) {
        if (e.keyCode == move_left && e.keyCode !== move_right) {
            esquerda = false;
        }
        
        if (e.keyCode == move_up && e.keyCode !== move_down) {
            cima = false;
            vy = 0.1;
            dy = 0.0001;
        }
        
        if (e.keyCode == move_right && e.keyCode !== move_left) {
            direita = false;
        }

        if (e.keyCode == space_bar) {
            space = false;
        }
    }

    // key press
    function keydown(e) {
        if (cima && e.keyCode == move_down) {
            cima = false;
        }

        if (e.keyCode == move_left) {
            esquerda = true;
        }

        if (e.keyCode == move_up) {
            cima = true;
            vy = 0.1;
            dy = 0.0001;
        }

        if (e.keyCode == move_right) {
            direita = true;
        }

        if (e.keyCode == space_bar) {
            space = true;
        }
    }

    upKey.ontouchstart = () => {
        cima = true;
        vy = 0.1;
        dy = 0.0001;
    }

    leftKey.ontouchstart = () => {
        esquerda = true
    }

    spaceKey.ontouchstart = () => {
        space = true;
    }

    rightKey.ontouchstart = () => {
        direita = true
    }

    upKey.ontouchend = () => {
        cima = false;
        vy = 0.1;
        dy = 0.0001;
    }

    leftKey.ontouchend = () => {
        esquerda = false;
    }

    spaceKey.ontouchend = () => {
        space = false;
    }

    rightKey.ontouchend = () => {
        direita = false;
    }

    // Movement configs
    function move() {
        if (direita && usuario.posx + player_sizew/2 >= pontoInicialX) {
            piso1_x -= player_xvel;
            piso2_x -= player_xvel;
            lamp_x -= player_xvel;
            pontoInicialX -= player_xvel;
        }

        if (esquerda && usuario.posx + player_sizew/2 > pontoInicialX) {
            piso1_x += player_xvel;
            piso2_x += player_xvel;
            lamp_x += player_xvel;
            pontoInicialX += player_xvel;
        }

        if (cima && usuario.posy >= canvas.height/2 - player_sizeh/2) {
            usuario.posy -= player_yvel;
        } else if (cima && piso_y <= 2 * canvas.height ) {
            piso_y += player_yvel;
            placeholders.forEach(place => {
                place.y += player_yvel
            })
            location_place += player_yvel;
        } else if (cima && usuario.posy >= 0) {
            usuario.posy -= player_yvel;
        } else if (cima == false) {
            if (usuario.posy <= canvas.height - (floor_size + player_sizeh)) {
                usuario.posy += vy;
            }
        }
    }

    // Draw function
    function render() {
        for (let i = 0; i < placeholders.length; i++) {
            if (placeholders[i].x <= 2 * canvas.width && placeholders[i].x >= 0) {
                atualizador += 1;
            }
        }
        players_secundarios.forEach((p) => {
            p.update();
        })
        c2.drawImage(piso1, 0, 0, canvas.width, canvas.height, piso1_x, piso_y, canvas.width + 4, canvas.height);
        c2.drawImage(piso2, 0, 0, canvas.width, canvas.height, piso2_x, piso_y, canvas.width + 4, canvas.height);
        c2.drawImage(lamp, player_x + lamp_x, piso_y - 512, lamp.naturalWidth, lamp.naturalHeight);
        usuario.supdate();
        stars.forEach((estrela) => {
            estrela.supdate();
        })
        placeholders.forEach((place) => {
            place.draw();
        })
        if (atualizador < 25 && infosIndex >= 3) {
            places(canvas.width);
        }
        atualizador = 0;
    }

    // Floor function
    function infinite() {
        if (piso1_x > 0 && piso2_x >= canvas.width) {
            piso2_x = -canvas.width;
        }

        if (piso2_x > 0 && piso1_x >= canvas.width) {
            piso1_x = -canvas.width;
        }

        if (piso1_x < 0 && piso2_x <= -canvas.width) {
            piso2_x = canvas.width;
        }

        if (piso2_x < 0 && piso1_x <= -canvas.width) {
            piso1_x = canvas.width;
        }
        
        if (cima == false && piso_y > canvas.height - floor_size) {
            piso_y -= vy;
            placeholders.forEach(place => {
                place.y -= vy;
            })
            location_place -= vy;
        }

        if (piso_y >= (3 * canvas.height)/2) {
            sky1.style.opacity = '0';
            g = 0.0005;
            dy += g;
            vy += dy;
        } else {
            sky1.style.opacity = '1';
            g = 0.002;
            dy += g;
            vy += dy;
        }
    }

    // criador de estrelas
    var stars = [];
    function Stars(img, x, y, h, w) {
        this.y_inicial = y;
        this.img = img;
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.vy = player_yvel;
        this.vx = getRndInteger(-1, 1) * player_xvel;
        this.dy = 1;
        this.friction = 0.5;
        this.i = -1;
        this.m = 0;
        this.effect = 5;
        this.o = 0.1;
        this.sentinel = 0;

        this.draw = function() {
            c.save()
            c.shadowColor = "#E3EAEF";
            c.shadowBlur = 20;
            c2.drawImage(this.img, this.x, this.y);
            c.restore()
        }

        this.supdate = function() {
            if (direita && usuario.posx + player_sizew/2 >= pontoInicialX) {
                this.x -= player_xvel;
            }
            if (esquerda && usuario.posx + player_sizew/2> pontoInicialX) {
                this.x += player_xvel;
            }
            if (this.y + this.vy > piso_y - this.h - this.h/2 && this.i <= 1) { 
                this.vy = -this.vy * this.friction;
                this.vx = this.vx * this.friction;
                this.i += 1;
            } else if (this.i > 1) {
                this.y = piso_y - this.h - this.h/2 + this.m;
                if (this.m < this.effect/2 && this.effect > 0) {
                    this.m += this.o;
                    this.o += 0.001;
                    this.sentinel = 1;  
                } else if (this.m > this.effect/2 && this.effect < 0) {
                    this.m += this.o;
                    this.o -= 0.001;
                    this.sentinel = -1;
                } else {
                    this.effect = -this.effect;
                    this.o = 0.1 * this.sentinel;
                }
            } else if (this.i <= 1) {
                this.vy += this.dy;
                this.x += this.vx;
                this.y += this.vy;
            }
            if ((this.x + this.w/2 >= usuario.posx && this.x + this.w/2 <= usuario.posx + player_sizew) && (this.y + this.h/2 >= usuario.posy && this.y + this.h/2 <= usuario.posy + player_sizeh) && count_stars < 1) {
                stars.splice(stars.indexOf(this), 1);
                count_stars += 1;
                numeroStars.innerHTML = `${count_stars} / 1`
            }
            this.draw();
        }
    }

    // criar n estrelas
    var stard = 40;
    setInterval(() => {
        if (stars.length < 5) {
            stars.push(new Stars(star, Math.random() * canvas.width, -Math.random() * canvas.height - stard, stard, stard));
        }
    }, 3000);

    // Formula pitagórica distancia de dois pontos
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    // Animation recursive function
    function update() {
        c.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2); 
        c2.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2); 
        render();
        infinite();
        move();
        requestAnimationFrame(update);
    }

    // Numero aleatório entre min e max (inclusos)
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    // Criar sprite
    function Sprite(img) {
        this.width = player_sizew;
        this.height = player_sizeh;
        this.srcx = 0;
        this.srcy = 0;
        this.posx = player_x;
        this.posy = player_y;
        this.countanim = 0;
        this.parado = 0;
        this.img = img
        this.sentido;

        this.draw = function() {
            c.drawImage(this.img, this.srcx, this.srcy, this.width, this.height, this.posx, this.posy, this.width, this.height);
        }

        this.supdate = function() {
            if (direita && esquerda == false && cima == false && this.posy >= piso_y - this.height) {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                this.srcy = 0;
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 5) - 4;
                this.countanim++;
            } else if (esquerda && direita == false && cima == false && this.posy >= piso_y - this.height) {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                this.srcy = this.height;
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 5) - 4;
                this.countanim++;
            } else if (cima && direita) {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                this.srcy = 0;
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 8) - 4;
                this.countanim++;
            } else if (cima && esquerda) {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                this.srcy = this.height;
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 8) - 4;
                this.countanim++;
            } else if (cima || this.posy <= piso_y - this.height) {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                if (direita) {
                    this.srcy = 0;
                } 
                if (esquerda) {
                    this.srcy = this.height;
                }
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 8) - 4;
                this.countanim++;
            } else{
                if (this.parado >= 100) {
                    this.parado = 0;
                }
                this.srcx = Math.floor(this.parado / 20) * this.width;
                this.parado++;
                this.countanim = 0;
            }
            if (direita && this.posx + player_sizew/2 > pontoInicialX) {
                this.sentido = 'direita';
            } else if (direita) {
                this.posx += player_xvel/2;
                this.sentido = 'direita';
            } else if (esquerda && this.posx + player_sizew/2 > pontoInicialX) {
                this.sentido = 'esquerda';
            } else if (esquerda && this.posx > pontoInicialX - canvas.width/2) {
                this.posx -= player_xvel/2;
                this.sentido = 'esquerda';
            } else {
                this.sentido = 'parado';
            }
            socket.emit('player pos', {x: pontoInicialX, y: -Math.round(distance(0, this.posy, 0, piso_y)), id: id, sentido: this.sentido})
            this.draw(); 
        }
    }

    // outros players 
    players_secundarios = [];
    function Playerx(img, x, y, id, sentido) {
        this.width = player_sizew;
        this.height = player_sizeh;
        this.srcx = 0;
        this.srcy = 0;
        this.posx = x;
        this.posy = y;
        this.countanim = 0;
        this.parado = 0;
        this.img = img;
        this.id = id;
        this.sentido = sentido;

        this.draw = function() {
            c2.save();
            c2.globalAlpha = 0.75;
            c2.drawImage(this.img, this.srcx, this.srcy, this.width, this.height, this.posx, this.posy, this.width, this.height);
            c2.restore();
        }

        this.update = function() {
            if (this.sentido == 'direita') {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                this.srcy = 0;
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 5) - 4;
                this.countanim++;
            } else if (this.sentido == 'esquerda') {
                if (this.countanim >= 60) {
                    this.countanim = 0;
                }
                this.srcy = this.height;
                this.srcx = Math.floor(this.countanim / 20) * this.width + (this.width * 5) - 4;
                this.countanim++;
            } else {
                if (this.parado >= 100) {
                    this.parado = 0;
                }
                this.srcx = Math.floor(this.parado / 20) * this.width;
                this.parado++;
                this.countanim = 0;
            }

            this.draw();
        }
    }

    // load players
    socket.on('player x', player => {
        if (players_secundarios.length > 0) {
            if (containsObject(player, players_secundarios)) {
                for (let i = 0; i < players_secundarios.length; i++) {
                    if (players_secundarios[i].id == player.id) {
                        players_secundarios[i].posx = -player.x + pontoInicialX + player_x;
                        players_secundarios[i].posy = player.y + piso_y;
                        players_secundarios[i].sentido = player.sentido;
                    }
                }
            } else {
                players_secundarios.push(new Playerx(ghost, player.x, player.y, player.id));
            }
        } else {
            players_secundarios.push(new Playerx(ghost, player.x, player.y, player.id));
        }
    })

    socket.on('disconected id', data_id => {
        if (containsObject(data_id, players_secundarios)) {
            for (let i = 0; i < players_secundarios.length; i++) {
                if (players_secundarios[i].id == data_id.id) {
                    players_secundarios.splice(i, 1);
                }
            }
        }
    })

    // Criar placeholders
    var placeholders = [];
    function Placeholder(img, x, y, i) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.placeholder_active = new Image();
        this.placeholder_active.src = 'images/star_active.png';
        this.w = this.img.naturalWidth;
        this.h = this.img.naturalHeight;
        this.active = 0;
        this.id = i;

        this.draw = function() {
            c.save();
            c.globalCompositeOperation='destination-over';
            c2.drawImage(this.img, this.x, this.y);
            c.restore();
            this.pupdate();
        }

        this.pupdate = function() {
            if (direita && usuario.posx + player_sizew/2 >= pontoInicialX) {
                this.x -= player_xvel;
            }
            if (esquerda && usuario.posx + player_sizew/2 > pontoInicialX) {
                this.x += player_xvel;
            }

            if ((this.x + this.w/2 >= usuario.posx && this.x + this.w/2 <= usuario.posx + player_sizew) && (this.y + this.h/2 >= usuario.posy && this.y + this.h/2 <= usuario.posy + player_sizeh) && count_stars >= 1 && this.active < 1 && space) {
                this.img = this.placeholder_active;
                count_stars -= 1;
                numeroStars.innerHTML = `${count_stars} / 1`
                this.active += 1;
                estrelas_ativas.push(this);
                const id = this.id;
                socket.emit('id', id);
            }

            if ((this.x + this.w/2 >= usuario.posx && this.x + this.w/2 <= usuario.posx + player_sizew) && (this.y + this.h/2 >= usuario.posy && this.y + this.h/2 <= usuario.posy + player_sizeh)) {
                starID.innerHTML = `#${this.id}`;
                starInfo.style.opacity = '0.8';
                timer = setTimeout(() => {
                    starInfo.style.opacity = '0';
                }, 5000)
            } 
        }
    }

    // criar n placeholders
    function places(z) {    
        const raiox = placeholder.naturalWidth/2;
        const raioy = placeholder.naturalHeight/2;
        for (let i = 0; i < 25; i++) {
            let x = (Math.random() * canvas.width + (Math.floor(i / 25) * canvas.width)) + z;
            let y = (Math.random() * -canvas.height) - 2 * placeholder.naturalHeight + location_place;
            if (i >= 1) {
                for (let j = 0; j < placeholders.length; j++) {
                    if ((distance(x + raiox, y + raioy, placeholders[j].x + raiox, placeholders[j].y + raioy) < raiox * 2)) {
                        x = (Math.random() * canvas.width + (Math.floor(i / 25) * canvas.width)) + z;
                        y = (Math.random() * -canvas.height) - 2 * placeholder.naturalHeight + location_place;
                        j = -1;
                    }
                }
            }
            placeholders.push(new Placeholder(placeholder, x, y, deaths - placeholders.length || deaths))

            if (infosIndex >= 3) {
                for (let k = 0; k < placeholder_active_index.length; k++) {
                    if (placeholders[placeholders.length - 1].id == placeholder_active_index[k]) {
                        placeholders[placeholders.length - 1].img = placeholder_active_global;
                        placeholders[placeholders.length - 1].active += 1;
                        estrelas_ativas.push(placeholders[placeholders.length - 1]);
                    }
                }
            }
        }

        // socket broadcast estrelas  
        socket.on('estrelas encorporadas', function(arrestrelas) {
            placeholder_active_index = arrestrelas;
            for (let i = 0; i < placeholders.length; i++) {
                for (let j = 0; j < placeholder_active_index.length; j++) {
                    if (placeholders[i].id == placeholder_active_index[j]) {
                        placeholders[i].img = placeholder_active_global;
                        placeholders[i].active += 1;
                        estrelas_ativas.push(placeholders[i]);
                    }
                }
            }
        }) 
    }

    // data event
    socket.on('numberStars', data => {
        socket.emit('confirmation'); 

        loading.className += 'Hidden';

        deaths = JSON.parse(data).TotalDeaths;
        confirmed = JSON.parse(data).TotalConfirmed;
        recovered = JSON.parse(data).TotalRecovered;
        const infos = [`Since the winter of 2019 <strong>${confirmed.toLocaleString()}</strong> confirmed cases of Covid-19 have been registrated.`, `<strong>${deaths.toLocaleString()}</strong> people have died in the pandemic.`, `On the other hand, <strong>${recovered.toLocaleString()}</strong> people have been recovered and <strong>${starsActivated.toLocaleString()}</strong> new stars were born in the sky.`, '"It\'s is not about beeing sad, but to remember."'];
        places(0);

        textInfo.innerHTML = infos[infosIndex];

        textInfo.style.opacity = '1';
        infosIndex += 1;
        setTimeout(() => {
            textInfo.style.opacity = '0';
        }, 7000);

        function intervalFunc() {
            textInfo.style.opacity = '1';
            textInfo.innerHTML = infos[infosIndex];
            if (infosIndex == infos.length - 1) {
                clearInterval(Interval)
                setTimeout(() => {
                    screenInfo.style.opacity = '0';
                    setTimeout(() => {
                        screenInfo.style.display = 'none';
                    }, 1000);
                }, 7000);
            } else {
                infosIndex += 1;
            }
            setTimeout(() => {
                textInfo.style.opacity = '0';
            }, 7000)
        }

        const Interval = setInterval(intervalFunc, 8000);
    })

    // Key functions
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    // Load image 
    placeholder_active_global.onload = function() {
        socket.emit('ready', 1)
    }

    // Socket Estrelas
    socket.on('recived message', function(message) {
        placeholder_active_index.push(message);
        for (let i = 0; i < placeholders.length; i++) {
            if (placeholders[i].id == message)
                placeholders[i].img = placeholder_active_global;
                placeholders[i].active += 1;
                estrelas_ativas.push(placeholders[i]);
        }
    });

    //audio click
    const audioStates = ['images/audio.png', 'images/muted.png'];
    let audioSelector = 0;
    music.volume = 0.2;
    audio.onclick = function() {
        this.src = `${audioStates[audioSelector]}`;
        if (audioSelector == 0) {
            music.play();
        } else {
            music.pause();
        }
        audioSelector = Math.abs(audioSelector - 1);
    }

    // touch controllers
    function is_touch_device() {  
        try {  
          document.createEvent("TouchEvent");  
          return true;  
        } catch (e) {  
          return false;  
        }  
    }
    if (is_touch_device()) {
        bottomkeys.style.display = 'flex';
        keysContainer.style.display = 'flex';
        spaceKey.style.display = 'inline';
    } 

    update();
});