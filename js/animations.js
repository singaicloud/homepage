/* Dynamic background from Vanta */
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
            VANTA.TOPOLOGY({
                el: ".workflow",
                scale: 5.00,
                backgroundColor: 0x0
            });
            VANTA.TOPOLOGY({
                el: ".research",
                scale: 5.00,
                color: 0x9dc3f7,
                backgroundColor: 0x0
            });
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
    });
});