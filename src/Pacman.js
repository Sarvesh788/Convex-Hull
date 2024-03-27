class Pacman {
    constructor(img_open, img_close, size) {

      this.speed = 0.4;
      this.distanceTravelled = 0;
      this.direction = this.getRandomDirection();      
      // if (this.direction === 'right' || this.direction === 'left') {
      //   if(this.direction === 'right')
      //   this.curr_x = 0;
      //   else
      //   this.curr_x = window.innerWidth - size;
      //   this.curr_y = Math.random() * (window.innerHeight - size);
      // } else {
      //   if(this.direction === 'up')
      //   this.curr_y = window.innerHeight - size;
      //   else
      //   this.curr_y = 0;
      //   this.curr_x = Math.random() * (window.innerWidth - size);
      //   this.curr_y = 0;
      // }
      this.curr_x = Math.random() * (window.innerWidth - size);
      this.curr_y = Math.random() * (window.innerHeight - size);
      this.next_x = this.curr_x;
      this.next_y = this.curr_y;
      this.size = size;
      this.image_open = img_open;
      this.image_close = img_close;
      this.open = false;
    }
  
    updateImages(img_open, img_close) {
      this.image_open = img_open;
      this.image_close = img_close;
    }
  
    draw(ctx) {
      const img = this.open ? this.image_open : this.image_close;
      ctx.save();
      ctx.translate(this.curr_x + this.size / 2, this.curr_y + this.size / 2);
      ctx.rotate(this.getAngle());
      ctx.drawImage(img, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
      this.open = !this.open;
    }
  
    update(canvasWidth, canvasHeight) {

      this.speed = 0.2;
      const prev_x = this.next_x;
      const prev_y = this.next_y;

      switch (this.direction) {
        case 'right':
          this.next_x += this.speed;
          break;
        case 'left':
          this.next_x -= this.speed;
          break;
        case 'up':
          this.next_y += this.speed;
          break;
        case 'down':
          this.next_y -= this.speed;
          break;
        default:
          break;
      }

      const dx = this.next_x - prev_x;
      const dy = this.next_y - prev_y;
      this.distanceTravelled += Math.sqrt(dx * dx + dy * dy);
  
      // Check if Pacman has reached the edge of the screen
      if (this.next_x < 0 || this.next_x + this.size > window.innerWidth) {
        this.direction = this.getRandomDirection();
      }
      if (this.next_y < 0 || this.next_y + this.size > window.innerHeight) {
        this.direction = this.getRandomDirection();
      }
      
      if(this.distanceTravelled >= 20) {
        this.open = !this.open;
        this.distanceTravelled = 0;
      }

      this.curr_x = this.next_x;
      this.curr_y = this.next_y;

      if(this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
        return false;
      }
      return true;
    }
  
    getAngle() {
      switch (this.direction) {
        case 'right':
          return 0;
        case 'left':
          return Math.PI;
        case 'up':
          return Math.PI / 2;
        case 'down':
          return Math.PI * 1.5;
        default:
          return 0;
      }
    }
  
    getRandomDirection() {
      const directions = ['up', 'down', 'left', 'right'];
      return directions[Math.floor(Math.random() * directions.length)];
    }
  }
  
  export default Pacman;