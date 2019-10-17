var sw = 20, //方块宽度
    sh = 20, //方块高度
    tr = 30, //行数
    td = 30; //列数 
var snake = null, 
    food = null,
    game = null;

// 方块构造函数
function Squart(x,y,classname){
    //0,0 -- 0,0    20,0 -- 1,0   40,0 -- 2,0
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement('div'); // 创建方块DOM
    this.viewContent.className = this.class; //方块类型（蛇头，蛇身，苹果）
    this.parent = document.getElementById('snakeWrap');//方块的父级
}
Squart.prototype.create = function(){ //创建方块
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent);
}
Squart.prototype.remove = function(){ //移出（食物）
    this.parent.removeChild(this.viewContent);
}

function Snake(){
    this.head = null; // 蛇头信息
    this.tail = null; // 蛇尾信息
    this.pos = []; //蛇的每个节点的位置信息
    this.directionNum = { //蛇走的方向
        left : {
            x: -1,
            y: 0,
            rotate: 180
        },
        right : {
            x: 1,
            y: 0,
            rotate: 0
        },
        up : {
            x: 0,
            y: -1,
            rotate: -90
        },
        down : {
            x: 0,
            y: 1,
            rotate: 90
        }

    };
}
// 蛇的初始化，一个头，两个身
Snake.prototype.init = function(){
    //蛇头
    var snakehead = new Squart(2,0,'snakeHead');
    this.head = snakehead;
    this.pos.push([2,0]);
    snakehead.create();

    // 蛇身
    var body1 = new Squart(1,0,'snakeBody');
    this.pos.push([1,0]);
    body1.create();


    var body2 = new Squart(0,0,'snakeBody');
    this.tail = body2;
    this.pos.push([0,0]);
    body2.create();

    // 链表关系
    snakehead.last = null;
    snakehead.next = body1;
    body1.last = snakehead;
    body1.next = body2;
    body2.last = body1;
    body2.next = null;

    // 蛇下一步方向
    this.direction = this.directionNum.right; //默认方向

}
// 获取蛇头下一步位置，并做出反应
Snake.prototype.getNextPos = function(){
    var nextPos = [
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ];
    // 撞到自己，游戏结束
    var selfKill = false;
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            selfKill = true;
        }
    });
    if(selfKill){
        this.actions.over.call(this);
        return; // 使用return，避免结果臃肿
    }

    // 撞到墙壁，游戏结束
    if(nextPos[0] < 0 || nextPos[0] > tr-1 || nextPos[1] < 0 || nextPos[1] > td-1){
        this.actions.over.call(this);
        return;
    }
   
    // 撞到食物，吃，分数加1
    if(food && nextPos[0] == food.pos[0] && nextPos[1] == food.pos[1]){
        this.actions.eat.call(this);
        return;
    }
   
    // 无，前进
    else{
        this.actions.move.call(this);
       
    }

}
Snake.prototype.actions={
    move: function(format){ //format参数用于判断是否吃到食物，以决定是否删除原蛇尾
        this.head.remove();
        var newBody = new Squart(this.head.x/sw,this.head.y/sh,'snakeBody');
        newBody.create();
        var newHead = new Squart(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
        newHead.create();

        //更新pos
        this.pos.unshift([this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y]);           
        // 更新链表
        newBody.next = this.head.next;
        this.head.next.last = newBody;
        
        this.head = newHead;
        newBody.last = this.head;
        this.head.next = newBody;  
        this.head.last = null;       
                      
        if(!format){
            this.tail.remove();
            this.pos.pop();
            this.tail.last.next = null;
            this.tail = this.tail.last;        
        }
   
    },
    eat: function(){
        this.actions.move.call(this,true);
        game.score++;
        food.remove();
        createFood();
        scoreCon.innerHTML = game.score;

    },
    over: function(){
        game.over();

    }
}


snake = new Snake();


// 食物
function createFood(){
    var x = Math.round(Math.random()*(td-1));
    var y = Math.round(Math.random()*(tr-1));
    var include = true;
    while(include){ // 如果食物坐标跟蛇冲突，重新生成
        snake.pos.forEach(function(value){
            if(x != value[0] || y != value[1]){
                include = false;
            }
        })
    }
    food = new Squart(x,y,'food');
    food.pos = [x,y];
    food.create();  
}


function Game(){
    this.timer = null;
    this.score = 0;  
}
Game.prototype.init = function(){

    snake.init();
   // snake.getNextPos();
    createFood();
    

    document.onkeydown = function(e){
        if(e.which == 37 && snake.direction != snake.directionNum.right){
            snake.direction = snake.directionNum.left;
        }else if(e.which == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if(e.which == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(e.which == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
        
        
    }
    this.start();

   
}
//游戏开始
Game.prototype.start = function(){
    this.timer = setInterval(() => {
        snake.getNextPos();
    }, 200);
}
//游戏结束
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert(this.score);
   
    //回到初始状态
    snakeWrap.innerHTML = '';
    startBtn.parentNode.style.display = 'block';
    snake = new Snake();
    game = new Game();
    scoreCon.innerHTML = 0;
    
}
//暂停游戏
Game.prototype.pause = function(){
    clearInterval(this.timer);
    pauseBtn.parentNode.style.display = 'block';
}

game = new Game();
var startBtn = document.querySelector('.startBtn button');
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
var scoreCon = document.querySelector('.score span');

//开始游戏
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game.init();

};

//暂停游戏
snakeWrap.onclick = function(){
    game.pause();
}

//继续游戏
pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}