
class ImageSlider {
  constructor(selector, options = {}) {
    this.root = document.querySelector(selector);
    if (!this.root) return;

    this.track = this.root.querySelector('.slider-track');
    this.dotsBox = this.root.querySelector('.slider-dots');
    this.prevBtn = this.root.querySelector('.slider-btn.prev');
    this.nextBtn = this.root.querySelector('.slider-btn.next');

    this.slides = Array.from(this.track.children); // real slides only
    this.total = this.slides.length;
    this.delay = options.delay ?? 5000;            // autoplay interval (ms)

    this.index = 1;            // position in the track (1 = first real slide)
    this.isAnimating = false;  // blocks clicks while a slide is moving
    this.timerId = null;       // autoplay timer
    this.dots = [];

    this.init();
  }


  get realIndex() {
    return (((this.index - 1) % this.total) + this.total) % this.total;
  }

  init() {
    this.cloneEdges();
    this.buildDots();
    this.bindEvents();
    this.jump();            // place first slide without animation
    this.updateDots();
    this.startAutoPlay();
  }


  cloneEdges() {
    const firstClone = this.slides[0].cloneNode(true);
    const lastClone = this.slides[this.total - 1].cloneNode(true);
    [firstClone, lastClone].forEach((c) => c.setAttribute('aria-hidden', 'true'));
    this.track.appendChild(firstClone);
    this.track.insertBefore(lastClone, this.slides[0]);
  }

  buildDots() {
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsBox.appendChild(dot);
      this.dots.push(dot);
    });
  }

  bindEvents() {
    this.nextBtn.addEventListener('click', () => this.next());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.track.addEventListener('transitionend', (e) => this.handleTransitionEnd(e));
    // any mouse click inside the slider stops the auto-slide
    this.root.addEventListener('click', () => this.stopAutoPlay());
  }


  setPosition() {
    this.track.style.transform = `translateX(${-this.index * 100}%)`;
  }


  jump() {
    this.track.classList.add('no-transition');
    this.setPosition();
    void this.track.offsetWidth;            // force reflow
    this.track.classList.remove('no-transition');
  }

  goTo(target) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.index = target;
    this.setPosition();                     // CSS transition animates this
    this.updateDots();
  }

  next() { this.goTo(this.index + 1); }
  prev() { this.goTo(this.index - 1); }

  goToSlide(realIndex) {
    if (realIndex === this.realIndex) return;
    this.goTo(realIndex + 1);
  }

  updateDots() {
    this.dots.forEach((dot, i) => {
      const active = i === this.realIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  handleTransitionEnd(e) {
    if (e.target !== this.track || e.propertyName !== 'transform') return;
    if (this.index === this.total + 1) {
      this.index = 1;
      this.jump();
    } else if (this.index === 0) {
      this.index = this.total;
      this.jump();
    }
    this.isAnimating = false;
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.timerId = setInterval(() => this.next(), this.delay);
  }

  stopAutoPlay() {
    clearInterval(this.timerId);
    this.timerId = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ImageSlider('#project-slider', { delay: 5000 });
});
