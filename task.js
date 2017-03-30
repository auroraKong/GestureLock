const N = 3;
const WIDTH = window.innerWidth;
var $hint = $('#hint');
var $reset = $('#reset');
var canvas = $('#canvas');
canvas.width = WIDTH;
canvas.height = WIDTH;
var context = canvas.getContext('2d');

var pointPos = [];

var radius = 24,
	cirDis = 56, // 圆心之间的距离
	offset = (WIDTH - radius * 6 - cirDis*2)/2,
	n = 3;

var hint = {
	init: '请设置手势密码',
	again: '再次绘制解锁图案',
}

var ifset = false;

function calPointPos(){
	for(var row = 0; row < n; row++){
		for(var col = 0; col < n; col++){
			pointPos.push({
				x: offset + col * cirDis + (2 * col + 1) * radius,
				y: offset + row * cirDis + (2 * row + 1) * radius,
			})
		}
	}
}

function drawCircle() {
	context.save();
	context.lineWidth = 2;
	context.strokeStyle = '#fff';
	pointPos.forEach((item) => {
		context.beginPath();
		context.arc(item.x, item.y, radius, 0, Math.PI * 2);
		context.stroke();
		context.closePath();
	})
	context.restore();
}
// 获取touch点相对于canvas的坐标
function getPos(e){
	var rect = canvas.getBoundingClientRect();
	return {
		x: e.touches[0].clientX - rect.left,
		y: e.touches[0].clientY - rect.top
	}
}
// 判断触摸点是否在圆圈内
function withIn(pos){
	for(var i = 0; i < pointPos.length; i++){
		var item = pointPos[i];
		var dis = Math.sqrt(Math.pow(pos.x - item.x, 2) + Math.pow(pos.y - item.y, 2));
		if(dis <= radius) return i;
	}
	return -1;
}

function drawPoint(point){
	context.save();
	context.fillStyle = '#fff';
	context.beginPath();
	context.arc(point.x, point.y, radius/2, 0, Math.PI*2);
	context.closePath();
	context.fill();
	context.restore();
}

function drawLine(prePos, curPos){
	context.save();
	context.lineWidth = 2;
	context.strokeStyle = '#fff';
	context.beginPath();
	context.moveTo(prePos.x, prePos.y);
	context.lineTo(curPos.x, curPos.y);
	context.stroke();
	context.closePath();
	context.restore();
}

function drawPath(curPos){
	context.clearRect(0, 0, WIDTH, WIDTH);
	drawCircle();
	var pre = -1;
	path.forEach((item, index) => {
		drawPoint(pointPos[item]);
		if(index) drawLine(pointPos[pre], pointPos[item]);
		pre = item;
	})
	if(curPos) drawLine(pointPos[pre], curPos);
}

var path = [];
EventUtil.addEvent(canvas, 'touchstart', function(e){
	EventUtil.preventDefault(e);
	var pos = getPos(e);
	var idx = withIn(pos);
	if(idx != -1){
		path.push(idx);
		drawPoint(pointPos[idx]);
	}
})
EventUtil.addEvent(canvas, 'touchmove', function(e){
	EventUtil.preventDefault(e);
	var pos = getPos(e);
	var idx = withIn(pos);
	if(idx != -1 && path.indexOf(idx) == -1){
		path.push(idx);
		drawPath();
	}else{
		drawPath(pos);
	}
})
EventUtil.addEvent(canvas, 'touchend', function(e){
	EventUtil.preventDefault(e);
	drawPath();
	ifset = true;
	if(ifset) $reset.classList.remove('hide'); 
	$hint.innerHTML = hint.again;
})

calPointPos();
drawCircle();
$hint.innerHTML = hint.init;