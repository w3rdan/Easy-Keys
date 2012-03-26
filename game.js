(function(){
    var width, height,
    _c, _ctx,
    cannonImg,
    shipImg,
    debug,
    level,
    startTime,
    timer,
    soundz,
    isEnd = false,
    _diffWater = 0,
    isPressed = false,
    isLaser = false,
    keysArr = [],
    keyCharArr = [],
    FPS = 20,
    key_width = 70,
    delay = 0,
    waterHeight = 50,
    _rotation = 90,
    statsDIV;


    var _stats = {
        time:0, 
        score:0, 
        hits:0,
        wrong:0
    }

    var _levels = {
        n: [5, 1],
        m: [10, 2],
        h: [15, 4],
        x: [25, 6]
    }
    // sound
    soundManager.url = 'assets/';

    soundz = {
        _click:null,
        _hit:null,
        _laser:null,
        _start:null,
        _music:null
    };

    soundManager.onready(function(){
        soundz._click = soundManager.createSound({
            id:'sound01',
            url:'assets/click.mp3'
        });
        soundz._hit = soundManager.createSound({
            id:'sound02',
            url:'assets/hit.mp3',
            volume: 40
        });
        soundz._laser = soundManager.createSound({
            id:'sound03',
            url:'assets/laser.mp3'
        });
    
        soundz._start = soundManager.createSound({
            id:'sound04',
            url:'assets/enter.mp3',
            volume: 20
        });
    
        soundz._music = soundManager.createSound({
            id:'sound05',
            url:'assets/music.mp3?n=9992',
            stream: false,
            volume: 20,
            autoLoad: true
        });
    });

    var charArray = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];

    var Keys = function(_x, _y, _v, _c){
        this.x = _x; 
        this.y = _y; 
        this.v = _v; 
        this.c = _c; 
        this.t = new Date().getTime(); 
        this.move = function(_lvl){
            this.y = this.y + (this.v * _lvl);
        }
    }
    
    $(document).ready(function () {
        width = $(window).width();
        height = $(window).height();
        statsDIV = $('#stats');
        FPS = 1000/FPS;
        _c = $('#cLaser')[0];
        _ctx = _c.getContext('2d');
        _c.width = width;
        _c.height = height;
    
        cannonImg = new Image();
        cannonImg.src = "assets/laser-gun.png";

        shipImg = new Image();
        shipImg.src = "assets/navyship.png";
    
        drawBg();
        modalWindow(".. EASY KEYS ..");
        $('#debug-btn').click(function(){
            $('#debug-window').toggle();
        });
    
    })

    Math.decimal = function(n, k) {
        if (k === undefined) {
            k = 1;
        }
        var factor = Math.pow(10, k+1);
        n = Math.round(Math.round(n*factor)/10);
        return n/(factor/10);
    }
    
    
    var _debug = function(_t){
        $("#debug-window").append(_t + "<br/>");
    }    

    var isInteger = function(x){
        if (x == Math.round(x))
            return true;
        return false;
    }


    var drawStats = function(){
        var _txt = "points: " + Math.decimal(_stats.score) + " | time: " + Math.decimal(_stats.time);
        if (isInteger(Math.decimal(_stats.time))) {
            _txt += '.0';
        }
        _txt += " | hits: " + Math.decimal(_stats.hits) + " | w: " + _stats.wrong;
        statsDIV.html(_txt);
    }    
    
    
    var drawBg = function(){
        var canvas = $('#canvas')[0];
        var ctx = canvas.getContext("2d");
        canvas.width = 200;
        canvas.width = width;
        canvas.height = height;
        var radgrad = ctx.createRadialGradient(width/2, 0, 0, width/2, 0, width/2);
        radgrad.addColorStop(0, '#3B67DD');  
        radgrad.addColorStop(1, '#0840AF');  
        ctx.fillStyle = radgrad;  
        ctx.fillRect(0, 0, width, height); 
    }
    
    var drawKeys = function(){
        soundz._music.play({
            loops: 9999
        });
        startTime = new Date().getTime();
        for (var i = 0; i < 10; i++) {
            createKey(i);
        }
        $(document).bind("keydown", onKeyDown);
        $(document).bind("keyup", onKeyUp);
        drawCannon();
        statsDIV.animate({
            "right": "0px"
        }, "slow");
        animLoop();
    }    

    var createKey = function(_i){
        var x = Math.random() * (width - key_width);
        var y = -(Math.random() * 150) - key_width;
        var v = (Math.random()*1)+ 0.5; 
        var c = charArray[Math.floor ( Math.random() * charArray.length )]; 
        keyCharArr[_i] = c;
        var _key = new Keys(x, y, v, c);
        keysArr[_i] = _key;
        $('#container').append('<div id="k' + _i + '" class="keys" style="top:' + _key.y + 'px;left:' + _key.x + 'px;">'+ _key.c +'</div>');
    }

    var animLoop = function(){
        if (isEnd === false) {
            _stats.time = (new Date().getTime() - startTime)/1000;
            drawStats();
            if (delay > 0) {
                delay--;
            }
            var l = keysArr.length;
            for (var  i = 0;  i < l;  i++) {
                keysArr[i].move(level[1]);
                $('#k'+i).css("top", keysArr[i].y);
                if (keysArr[i].y > height - waterHeight) {
                    dieKey(i, 0);
                }
            }
            if (isLaser == false) {
                if (Math.abs(_rotation < 90)) {
                    _rotation += 0.5;
                    drawCannon();
                } else if (Math.abs(_rotation > 90)) {
                    _rotation -= 0.5;
                    drawCannon();
                }
                if (_rotation != 90) {
                    if (_rotation > 89.7 && _rotation < 90.3) {
                        _rotation = 90;
                        drawCannon();
                
                    }
                } 
            }
            timer = setTimeout(animLoop, FPS);
        }
    }
    
    var dieKey = function(_i, _t){
        if (_t !== 0) {
            soundz._hit.play();
        }
        var _this = $('#k'+_i);
        _this.remove();
        if (_t === 0) {
            //_debug("under water!");
            waterHeight += _diffWater;
            if (height - waterHeight < 100) {
                endGame();
            }
            drawCannon();
        } else {
           // _debug("Hit! " + (new Date().getTime() - keysArr[_i].t) + "::" + (100000/(new Date().getTime() - keysArr[_i].t)));
            _stats.hits++;
            _stats.score += (100000/(new Date().getTime() - keysArr[_i].t));
            drawStats();
        }
        createKey(_i);
    }    
    
    var onKeyDown = function(evt){
        if (isPressed === false) {
            isPressed = true;
            if (delay == 0) {
                var _char= String.fromCharCode(evt.which);	
                var _tmp = {
                    y:-200,
                    o:null
                }
                _isExist = -1;
                var l = keyCharArr.length;
                for (var i = 0; i < l; i++) {
                    if (keysArr[i].c === _char) {
                        if (keysArr[i].y > _tmp.y) {
                            _tmp.y = keysArr[i].y;
                            _tmp.o = i;
                        }
                    }
                }
                if (_tmp.o !== null) {
                    _isExist = _tmp.o;
                }
                if (_isExist > -1) {
                    isLaser = true;
                    soundz._laser.play();
                    drawLine(keysArr[_isExist].x, keysArr[_isExist].y);
                
                    dieKey(_isExist);
                    delay = 2;
                } else {
                    waterHeight += _diffWater;
                    _stats.wrong++;
                   // _debug("wrong key");
                    if (height - waterHeight < 100) {
                        endGame();
                        return;
                    }
                }
            }
        } 
    }  

    var onKeyUp = function(){
        _c.width = width;
        drawCannon();
        isPressed = false;
        isLaser = false;
    }
    
    var modalWindow = function(_text){
        var windowBody = "<div id='modal'><h2>" + _text + "</h2><div class='btn' lvl='n' style='top:40px'>novice</div><div class='btn' lvl='m' style='top:90px'>medium</div><div class='btn' lvl='h' style='top:140px'>hard</div><div class='btn' lvl='x' style='top:190px'>expert</div></div>";
        $('body').append(windowBody);
        var _this = $('#modal');
        $('.btn').mouseenter(function(){
            soundz._click.play();
        })
        $('.btn').click(function(evt){
            level = _levels[$(this).attr('lvl')];
            _diffWater = level[0];
            _this.animate({
                opacity: 0
            }, 300, function() {
                _this.remove();
                drawKeys();
            });
        
        })
    }    


    var finishWindow = function(){
        clearTimeout(timer);
        $(document).unbind();
        $('#container').empty();
        _c.width = 200;
        _c.width = width;
        var windowBody = "<div id='modal'><h2>GAME OVER</h2><div style='top:40px'>Score: " + Math.decimal(_stats.score) + "</div><div style='top:80px'>Time: " + Math.decimal(_stats.time) + "</div><div style='top:120px'>Hits: " + Math.decimal(_stats.hits) + "</div><div style='top:160px'>Wrong: " + Math.decimal(_stats.wrong) + "</div><div class='btn' style='top:190px'>AGAIN ?</div></div>";
        $('body').append(windowBody);
        var _this = $('#modal');
        $('.btn').click(function(evt){
            window.location.reload();
            return false;
        })
    }    

    var degToRad = function(degree) {
        return degree*(Math.PI/180);
    }

    var getAngle = function(x1, y1, x2, y2){
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

    var drawLine = function(_x, _y){
        _x = _x + (key_width/2);
        _y = _y + (key_width/2);
    
        drawCannon(_x, _y);
		_ctx.beginPath();
        _ctx.moveTo(width/2, height - waterHeight);
        _ctx.lineTo(_x, _y);
		
        _ctx.lineWidth = 1;
        _ctx.strokeStyle = "#FFFFFF"; 
    
        _ctx.shadowOffsetX = 5;
        _ctx.shadowOffsetY = 5;
        _ctx.shadowBlur = 15;
		_ctx.closePath();
        _ctx.stroke();
        _ctx.shadowOffsetX = 0;
        _ctx.shadowOffsetY = 0;
        _ctx.shadowBlur = 0;
		
    }

    var drawWater = function(){
	_ctx.beginPath();
        _ctx.fillStyle = "rgba(0, 0, 200, 0.5)";  
        _ctx.fillRect (0, height - waterHeight, width, waterHeight);  
		_ctx.closePath();
        _ctx.drawImage(shipImg, (width - shipImg.width)/2, height - waterHeight - 60);
    }

    var drawCannon = function(_x, _y){
        _c.width = width;
		_ctx.clearRect(0,0,width,height);
        drawWater();
        drawLimit();
        var x = width/2;
        var y = height - waterHeight;
    
        if (_x) {
            var rotate = getAngle(_x, _y, x, y);
            _rotation = rotate;
        }
        _rotation = Math.abs(_rotation);

        _ctx.save();
		_ctx.beginPath();
        _ctx.translate(x, y);
        _ctx.rotate(degToRad(_rotation+90));
        _ctx.drawImage(cannonImg, -cannonImg.width/2, cannonImg.height-150); 
		_ctx.closePath();
        _ctx.restore();
    }


    var drawLimit = function(){
        if (waterHeight > (height*0.25)) {
            _ctx.strokeStyle = "rgba(255, 0 , 0, "+ (1 - (100/(waterHeight - height*0.25))) +")"; 
            _ctx.lineWidth = 1;
			_ctx.beginPath();
            _ctx.moveTo(0, 100);
            _ctx.lineTo(width, 100);
			_ctx.closePath();
            _ctx.stroke();
			
        }
    }

    var endGame = function(){
        if (isEnd === false) {
           // _debug("Koniec gry");
            isEnd = true;
            clearTimeout(timer);
            $(document).unbind();
            $('#container').empty();
            _c.width = 200;
            _c.width = width;
            finishWindow();
        }

    }
}(jQuery))