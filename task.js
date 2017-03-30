(function(){
	const N = 3;
	const WIDTH = window.innerWidth;
	const RADIUS = 24;
	const CIRDIS = 56; // 圆心之间的距离

	window.Lock = function(){
		this.canvas = $('#canvas');
		this.context = this.canvas.getContext('2d');
		this.$hint = $('#hint');
		this.$reset = $('#reset');
		this.pointPos = []; // 圆圈坐标
		this.mark = 0; // 0:未设置，1:设置确认，2:解锁
		this.path = []; // 绘制路径

		this.init();
	}
	Lock.prototype.init = function(){
		this.canvas.width = WIDTH;
		this.canvas.height = WIDTH;	
		var offset = (WIDTH - RADIUS * 6 - CIRDIS*2)/2;
		// 计算圆圈坐标
		for(var row = 0; row < N; row++){
			for(var col = 0; col < N; col++){
				this.pointPos.push({
					x: offset + col * CIRDIS + (2 * col + 1) * RADIUS,
					y: offset + row * CIRDIS + (2 * row + 1) * RADIUS,
				})
			}
		}
		this.drawCircle();

		var hint = {
			init: '请设置手势密码',
			again: '再次绘制解锁图案',
			reagain: '密码不一致，请重新绘制',
			limit: '最少连接4个点，请重新输入',
			setok: '设置成功',
			unlock: '请解锁',
			error: '密码不正确',
			ok: '密码正确',
		};
		this.$hint.innerHTML = hint.init;
		EventUtil.addEvent(this.canvas, 'touchstart', e => {
			EventUtil.preventDefault(e);
			this.path = [];
			var pos = this.getPos(e);
			var idx = this.withIn(pos);
			if(idx != -1){
				this.path.push(idx);
				this.drawPoint(this.pointPos[idx]);
			}
		})
		EventUtil.addEvent(this.canvas, 'touchmove', e => {
			EventUtil.preventDefault(e);
			var pos = this.getPos(e);
			var idx = this.withIn(pos);
			if(idx != -1 && this.path.indexOf(idx) == -1){
				this.path.push(idx);
				this.drawPath();
			}else{
				this.drawPath(pos);
			}
		})
		EventUtil.addEvent(this.canvas, 'touchend', e => {
			EventUtil.preventDefault(e);
			this.drawPath();
			switch(this.mark){
				case 0:
					if(this.path.length < 4) {
						this.$hint.innerHTML = hint.limit;
						this.shake();
					}
					else{
						Store.set(this.path);
						this.mark = 1;
						this.$reset.classList.remove('hide'); 
						this.$hint.innerHTML = hint.again;
					}
					break;
				case 1:
					if(this.path.toString() === Store.get().toString()){
						this.$hint.innerHTML = hint.setok;
						this.mark = 2;
						setTimeout(() => {
							this.$hint.innerHTML = hint.unlock;
						}, 200);
					}else{
						this.$hint.innerHTML = hint.reagain;
						this.shake();
					}
					break;
				case 2:
					if(this.path.toString() === Store.get().toString()){
						this.$hint.innerHTML = hint.ok;
						setTimeout(() => {
							this.$hint.innerHTML = hint.unlock;
						}, 1000);
					}else{
						this.$hint.innerHTML = hint.error;
						this.shake();
					}
					break;
			}
			setTimeout(() => {
				this.reset();
			}, 200);
		})
		EventUtil.addEvent(this.$reset, 'click', e => {
			this.mark = 0;
			Store.del();
			this.reset();
			this.$hint.innerHTML = hint.init;
		})
	}
	/**
	* 绘制圆圈
	*/
	Lock.prototype.drawCircle = function() {
		this.context.save();
		this.context.lineWidth = 2;
		this.context.strokeStyle = '#fff';
		this.pointPos.forEach((item) => {
			this.context.beginPath();
			this.context.arc(item.x, item.y, RADIUS, 0, Math.PI * 2);
			this.context.stroke();
			this.context.closePath();
		})
		this.context.restore();
	}
	/**
	* 获取touch点相对于canvas的坐标
	*/
	Lock.prototype.getPos = function(e){
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.touches[0].clientX - rect.left,
			y: e.touches[0].clientY - rect.top
		}
	}
	/**
	* 判断触摸点是否在圆圈内
	*/
	Lock.prototype.withIn = function(pos){
		for(var i = 0; i < this.pointPos.length; i++){
			var item = this.pointPos[i];
			var dis = Math.sqrt(Math.pow(pos.x - item.x, 2) + Math.pow(pos.y - item.y, 2));
			if(dis <= RADIUS) return i;
		}
		return -1;
	}
	/**
	* 绘制点
	*/
	Lock.prototype.drawPoint = function(point){
		this.context.save();
		this.context.fillStyle = '#fff';
		this.context.beginPath();
		this.context.arc(point.x, point.y, RADIUS/2, 0, Math.PI*2);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}
	/**
	* 绘制线
	*/
	Lock.prototype.drawLine = function(prePos, curPos){
		this.context.save();
		this.context.lineWidth = 2;
		this.context.strokeStyle = '#fff';
		this.context.beginPath();
		this.context.moveTo(prePos.x, prePos.y);
		this.context.lineTo(curPos.x, curPos.y);
		this.context.stroke();
		this.context.closePath();
		this.context.restore();
	}
	/**
	* 绘制路径
	*/
	Lock.prototype.drawPath = function(curPos){
		this.context.clearRect(0, 0, WIDTH, WIDTH);
		this.drawCircle();
		var pre = -1;
		this.path.forEach((item, index) => {
			this.drawPoint(this.pointPos[item]);
			if(index) this.drawLine(this.pointPos[pre], this.pointPos[item]);
			pre = item;
		})
		if(curPos) this.drawLine(this.pointPos[pre], curPos);
	}
	/**
	* 重置密码
	*/
	Lock.prototype.reset = function(){
		this.context.clearRect(0, 0, WIDTH, WIDTH);
		this.drawCircle();
	}
	/**
	* 绘制错误提示
	*/
	Lock.prototype.shake = function(){
		this.$hint.classList.add('shake');
		setTimeout(() => {
			this.$hint.classList.remove('shake');
		}, 1000);
	}
})();