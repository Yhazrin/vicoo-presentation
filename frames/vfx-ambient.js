/**
 * VICOO Ambient VFX — lightweight particle & glow effects
 * Inspired by html-video's frame-particle-narrative and frame-parallax-depth
 *
 * Usage: <script src="scripts/vfx-ambient.js"></script>
 * Then call: VICOO_VFX.particles(container, opts)
 *            VICOO_VFX.glowPulse(element, opts)
 *            VICOO_VFX.wordReveal(element, opts)
 *            VICOO_VFX.parallaxLayers(container, layers)
 */
(function () {
  'use strict';

  const VICOO_VFX = {
    /**
     * Particle field — canvas-based, auto-sized to container
     * Runs for maxFrames then stops (so headless renderers can detect stability)
     * @param {HTMLElement} container
     * @param {Object} opts - { count, color, maxSize, speed, connectDistance, opacity, maxFrames }
     */
    particles(container, opts = {}) {
      const o = {
        count: opts.count || 60,
        color: opts.color || '#E60012',
        maxSize: opts.maxSize || 3,
        speed: opts.speed || 0.3,
        connectDistance: opts.connectDistance || 120,
        opacity: opts.opacity || 0.4,
        glow: opts.glow !== false,
        maxFrames: opts.maxFrames || 360, // 6 seconds at 60fps, then stops
      };

      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
      container.style.position = container.style.position || 'relative';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let w, h;
      const particles = [];
      let frameCount = 0;

      function resize() {
        w = canvas.width = container.offsetWidth || 1920;
        h = canvas.height = container.offsetHeight || 1080;
      }
      resize();

      for (let i = 0; i < o.count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * o.speed,
          vy: (Math.random() - 0.5) * o.speed,
          r: Math.random() * o.maxSize + 0.5,
          alpha: Math.random() * o.opacity + 0.1,
        });
      }

      function draw() {
        frameCount++;
        ctx.clearRect(0, 0, w, h);

        // Draw connections
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < o.connectDistance) {
              ctx.globalAlpha = (1 - dist / o.connectDistance) * 0.15;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw particles
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = o.color;
          if (o.glow) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = o.color;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Stop after maxFrames so renderer can detect page stability
        if (frameCount < o.maxFrames) {
          requestAnimationFrame(draw);
        }
      }
      draw();

      return { canvas, destroy() { canvas.remove(); } };
    },

    /**
     * Glow pulse — CSS animated glow ring around an element
     * @param {HTMLElement} el
     * @param {Object} opts - { color, size, duration }
     */
    glowPulse(el, opts = {}) {
      const o = {
        color: opts.color || 'rgba(230,0,18,0.3)',
        size: opts.size || 20,
        duration: opts.duration || 3,
      };
      const ring = document.createElement('div');
      ring.style.cssText = `
        position:absolute;inset:-${o.size}px;border-radius:50%;
        border:1px solid ${o.color};pointer-events:none;
        animation:vicoo-glow-pulse ${o.duration}s ease-in-out 3;
      `;
      el.style.position = el.style.position || 'relative';
      el.appendChild(ring);

      // Inject keyframes if not already present
      if (!document.getElementById('vicoo-glow-keyframes')) {
        const style = document.createElement('style');
        style.id = 'vicoo-glow-keyframes';
        style.textContent = `
          @keyframes vicoo-glow-pulse {
            0%,100% { transform:scale(1); opacity:0.5; }
            50% { transform:scale(1.08); opacity:1; }
          }
        `;
        document.head.appendChild(style);
      }
      return ring;
    },

    /**
     * Word-by-word text reveal — splits text into animated spans
     * @param {HTMLElement} el - container with text
     * @param {Object} opts - { delay, stagger, duration, ease, blur }
     */
    wordReveal(el, opts = {}) {
      const o = {
        delay: opts.delay || 0,
        stagger: opts.stagger || 0.1,
        duration: opts.duration || 0.6,
        blur: opts.blur !== false,
      };

      // Split into words, preserve existing HTML
      const html = el.innerHTML;
      const parts = html.split(/(\s+|<br\s*\/?>|<[^>]+>)/g);
      let wordIdx = 0;
      let newHTML = '';

      parts.forEach(part => {
        if (part.match(/<br\s*\/?>/) || part.match(/^<[^>]+>$/)) {
          newHTML += part;
        } else if (part.match(/^\s+$/)) {
          newHTML += part;
        } else if (part.length > 0) {
          wordIdx++;
          newHTML += `<span class="vicoo-word" style="display:inline-block;opacity:0;transform:translateY(20px);filter:${o.blur ? 'blur(4px)' : 'none'}">${part}</span>`;
        }
      });

      el.innerHTML = newHTML;
      const words = el.querySelectorAll('.vicoo-word');

      // Animate with GSAP if available, else CSS
      if (window.gsap) {
        gsap.to(words, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: o.duration,
          stagger: o.stagger,
          delay: o.delay,
          ease: 'power3.out',
        });
      } else {
        // CSS fallback
        words.forEach((w, i) => {
          w.style.transition = `opacity ${o.duration}s ease-out ${o.delay + i * o.stagger}s, transform ${o.duration}s ease-out ${o.delay + i * o.stagger}s, filter ${o.duration}s ease-out ${o.delay + i * o.stagger}s`;
          requestAnimationFrame(() => {
            w.style.opacity = '1';
            w.style.transform = 'translateY(0)';
            w.style.filter = 'blur(0px)';
          });
        });
      }
      return words;
    },

    /**
     * Parallax depth layers — moves layers at different speeds on mouse
     * @param {HTMLElement} container
     * @param {Array} layers - [{ el, depth }] where depth 0 = static, 1 = max movement
     */
    parallaxLayers(container, layers) {
      const maxMove = 30; // px
      container.addEventListener('mousemove', e => {
        const rect = container.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;

        layers.forEach(({ el, depth }) => {
          const moveX = cx * depth * maxMove;
          const moveY = cy * depth * maxMove;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
      });
    },

    /**
     * Magnetic hover — element follows cursor slightly on hover
     * @param {HTMLElement} el
     * @param {Object} opts - { strength, ease }
     */
    magneticHover(el, opts = {}) {
      const strength = opts.strength || 0.3;
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        if (window.gsap) {
          gsap.to(el, { x: cx * strength, y: cy * strength, duration: 0.3, ease: 'power2.out' });
        } else {
          el.style.transform = `translate(${cx * strength}px, ${cy * strength}px)`;
        }
      });
      el.addEventListener('mouseleave', () => {
        if (window.gsap) {
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        } else {
          el.style.transform = 'translate(0,0)';
        }
      });
    },

    /**
     * Text scramble — characters cycle through random chars before settling
     * @param {HTMLElement} el
     * @param {Object} opts - { duration, chars, delay }
     */
    textScramble(el, opts = {}) {
      const o = {
        duration: opts.duration || 1.5,
        chars: opts.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        delay: opts.delay || 0,
      };
      const original = el.textContent;
      const chars = original.split('');
      let frame = 0;
      const totalFrames = Math.floor(o.duration * 60);

      setTimeout(() => {
        function tick() {
          frame++;
          const progress = frame / totalFrames;
          el.textContent = chars.map((c, i) => {
            if (i / chars.length < progress) return c;
            return o.chars[Math.floor(Math.random() * o.chars.length)];
          }).join('');

          if (frame < totalFrames) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = original;
          }
        }
        tick();
      }, o.delay * 1000);
    },
  };

  window.VICOO_VFX = VICOO_VFX;
})();
