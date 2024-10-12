function topo(cnv){
    const sketch = (cnv) => (function(p) {
      let width = cnv.offsetWidth;
      let height = cnv.offsetHeight;
      let offset = 100;

      let flow_cell_size = 10;

      let noise_size = 0.003;
      let noise_radius = 0.1;

      let flow_width = (width + offset * 2) / flow_cell_size;
      let flow_height = (height + offset * 2) / flow_cell_size;

      let noise_grid = [];
      let flow_grid = [];

      let number_of_particles = 4500;
      let particles = [];

      let tick = 0;
      p.setup = function() {
        p.createCanvas(width, height, cnv);
        p.background('#000');
        p.smooth();
        p.noStroke();
        //p.blendMode(p.OVERLAY);

        init_particles();
        init_flow();
      };
      p.draw = function() {
        p.translate(-offset, -offset);
        update_particles();
        display_particles();
        tick += 0.002;
      };

      function init_particles() {
        for (var i = 0; i < number_of_particles; i++) {
          let r = p.random(p.width + 2 * offset);
          let q = p.random(p.height + 2 * offset);
          particles.push({
            prev: p.createVector(r, q),
            pos: p.createVector(r, q),
            vel: p.createVector(0, 0),
            acc: p.createVector(0, 0),
            seed: i
          });
        }
      }

      function update_particles() {
        for (var i = 0; i < number_of_particles; i++) {
          let prt = particles[i];
          let flow = get_flow(prt.pos.x, prt.pos.y);

          prt.prev.x = prt.pos.x;
          prt.prev.y = prt.pos.y;

          prt.pos.x = mod(prt.pos.x + prt.vel.x, p.width + 2 * offset);
          prt.pos.y = mod(prt.pos.y + prt.vel.y, p.height + 2 * offset);

          prt.vel
            .add(prt.acc)
            .normalize()
            .mult(2.2);

          //prt.acc = p5.Vector.fromAngle(p.noise(prt.seed * 10, tick) * p.TAU).mult(0.01);
          prt.acc = p.createVector(0, 0);
          prt.acc.add(flow).mult(3);
        }
      }

      function init_flow() {
        for (let i = 0; i < flow_height; i++) {
          let row = [];
          for (let j = 0; j < flow_width; j++) {
            row.push(calculate_flow(j * noise_size, i * noise_size, noise_radius));
          }
          flow_grid.push(row);
        }
      }

      function calculate_flow(x, y, r) {
        //console.log(x,y);
        let high_val = 0;
        let low_val = 1;
        let high_pos = p.createVector(0, 0);
        let low_pos = p.createVector(0, 0);

        for (var i = 0; i < 100; i++) {
          let angle = i / 100 * p.TAU;
          let pos = p.createVector(x + p.cos(angle) * r, y + p.sin(angle) * r);
          let val = p.noise(pos.x, pos.y);

          if (val > high_val) {
            high_val = val;
            high_pos.x = pos.x;
            high_pos.y = pos.y;
          }
          if (val < low_val) {
            low_val = val;
            low_pos.x = pos.x;
            low_pos.y = pos.y;
          }
        }

        let flow_angle = p.createVector(low_pos.x - high_pos.x, low_pos.y - high_pos.y);
        flow_angle.normalize().mult(high_val - low_val);

        return flow_angle;
      }

      function get_flow(xpos, ypos) {
        xpos = p.constrain(xpos, 0, p.width + offset * 2);
        ypos = p.constrain(ypos, 0, p.height + offset * 2);
        return flow_grid[p.floor(ypos / flow_cell_size)][p.floor(xpos / flow_cell_size)];
      }

      function display_particles() {
        p.strokeWeight(1);
        p.stroke(255, 255, 255, 5);
        for (let i = 0; i < particles.length; i++) {
          if (p5.Vector.dist(particles[i].prev, particles[i].pos) < 10)
            p.line(particles[i].prev.x, particles[i].prev.y, particles[i].pos.x, particles[i].pos.y);
        }
      }

      function mod(x, n) {
        return (x % n + n) % n;
      }
    });
    new p5(sketch(cnv));
}

/* Dynamic background */

window.addEventListener("load", () => {
    /* Partical Cloud */
    const canvasEl = document.getElementById('particleCanvas');
    const canvas =
      'OffscreenCanvas' in window
        ? canvasEl.transferControlToOffscreen()
        : canvasEl;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const worker_js = `
    onmessage = (e)=> {
        const canvas = e.data.canvas;
        const ctx = canvas.getContext('2d');
        

        let particles = [];
        let particleCount = calculateParticleCount();

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
                this.fadeDelay = Math.random() * 600 + 100;
                this.fadeStart = Date.now() + this.fadeDelay;
                this.fadingOut = false;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.speed = Math.random() / 5 + 0.1;
                this.opacity = 1;
                this.fadeDelay = Math.random() * 600 + 100;
                this.fadeStart = Date.now() + this.fadeDelay;
                this.fadingOut = false;
            }

            update() {
                this.y -= this.speed;
                if (this.y < 0) {
                    this.reset();
                }

                if (!this.fadingOut && Date.now() > this.fadeStart) {
                    this.fadingOut = true;
                }
                
                if (this.fadingOut) {
                    this.opacity -= 0.008;
                    if (this.opacity <= 0) {
                        this.reset();
                    }
                }
            }

            draw() {
                ctx.fillStyle = 'rgba(' + (255 - (Math.random() * 255 / 2)) + ', 255, 255, ' + this.opacity + ')';
                ctx.fillRect(this.x, this.y, 0.6, Math.random() * 2 + 1);
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        function calculateParticleCount() {
            return Math.floor((canvas.width * canvas.height) / 6000);
        }   

        initParticles();
        animate();
    }`;

    const blob = new Blob([worker_js], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker.postMessage({ canvas: canvas }, [canvas]);
    URL.revokeObjectURL(url);

    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particleCount = calculateParticleCount();
        initParticles();
    }

    //window.addEventListener('resize', onResize);

    
    /* Dot Lottie */
    jQuery.getScript("assets/dotlottie-web.js", ()=>{
        new DotLottie({
            autoplay: true,
            loop: true,
            canvas: document.getElementById("cloud-cli1"),
            src: "assets/cloud-cli1.lottie",
        });
    });

    /* Vanta backgrounds */
    jQuery.getScript("assets/three.min.js", ()=>{
        jQuery.getScript("assets/vanta.topology.min.js", ()=>{
            const cv = document.getElementById("topologyCanvas");
            topo(cv);            
        });
        jQuery.getScript("assets/vanta.net.min.js", ()=>{
            VANTA.NET({
                el: ".cloud",
                color: 0x888888,
                backgroundColor: 0x0,
                points: 16.00,
                maxDistance: 25.00,
                spacing: 20.00
            })
        });
        jQuery.getScript("assets/vanta.globe.min.js", ()=>{
            VANTA.GLOBE({
                el: ".globe-3d .wrapper",
                size: 0.80,
                backgroundColor: 0x0,
                color: 0xafafaf,
                color2: 0xafafaf,
            })      
        });

    });
});