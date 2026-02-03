module.exports = function generateSlidesHTML(title, slides) {
    const slidesContent = slides.map(s => `
        <section class="slide">
            <div class="content reveal">
                <h2>${s.source || s.title || 'Información'}</h2>
                <div class="snippet">${s.snippet.replace(/\n/g, '<br>')}</div>
            </div>
        </section>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@400,700&f[]=satoshi@400,700&display=swap">
    <style>
        :root {
            --bg-primary: #0a0a0c;
            --bg-secondary: #141417;
            --accent: #b71c1c;
            --text-primary: #ffffff;
            --text-secondary: #a1a1aa;
            --font-display: 'Clash Display', sans-serif;
            --font-body: 'Satoshi', sans-serif;
            --slide-padding: clamp(2rem, 8vw, 6rem);
            --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-snap-type: y mandatory; background: var(--bg-primary); }
        body { font-family: var(--font-body); color: var(--text-primary); overflow-x: hidden; }

        .slide {
            min-height: 100vh;
            padding: var(--slide-padding);
            scroll-snap-align: start;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: var(--bg-primary);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            position: relative;
        }

        .slide::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at 20% 30%, rgba(183, 28, 28, 0.05) 0%, transparent 70%);
            pointer-events: none;
        }

        .content { max-width: 1000px; z-index: 10; }

        h1, h2 { font-family: var(--font-display); font-weight: 700; line-height: 1.1; margin-bottom: 1.5rem; }
        h1 { font-size: clamp(3rem, 10vw, 6rem); color: var(--accent); }
        h2 { font-size: clamp(2rem, 6vw, 4rem); color: var(--text-primary); }

        .snippet { font-size: clamp(1.1rem, 2vw, 1.5rem); color: var(--text-secondary); line-height: 1.6; }

        .reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.8s var(--ease-out-expo);
        }

        .slide.active .reveal {
            opacity: 1;
            transform: translateY(0);
        }

        .progress-bar {
            position: fixed; top: 0; left: 0; height: 4px; background: var(--accent);
            width: 0%; z-index: 100; transition: width 0.3s ease;
        }

        .controls {
            position: fixed; bottom: 2rem; right: 2rem; display: flex; gap: 1rem; z-index: 100;
        }

        .btn {
            background: rgba(255,255,255,0.1); border: none; color: white; padding: 1rem;
            border-radius: 50%; cursor: pointer; backdrop-filter: blur(10px);
            transition: background 0.3s;
        }

        .btn:hover { background: var(--accent); }
    </style>
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>

    <section class="slide">
        <div class="content reveal">
            <p style="text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1rem; color: var(--text-secondary);">Despacho de Inteligencia</p>
            <h1>${title}</h1>
            <p style="font-size: 1.5rem; opacity: 0.7;">Investigación por Gladys Marín</p>
        </div>
    </section>

    ${slidesContent}

    <div class="controls">
        <button class="btn" onclick="window.scrollBy(0, -window.innerHeight)">↑</button>
        <button class="btn" onclick="window.scrollBy(0, window.innerHeight)">↓</button>
    </div>

    <script>
        const slides = document.querySelectorAll('.slide');
        const progressBar = document.getElementById('progressBar');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    const index = Array.from(slides).indexOf(entry.target);
                    const progress = ((index + 1) / slides.length) * 100;
                    progressBar.style.width = \`\${progress}%\`;
                }
            });
        }, { threshold: 0.5 });

        slides.forEach(slide => observer.observe(slide));

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ') window.scrollBy(0, window.innerHeight);
            if (e.key === 'ArrowUp') window.scrollBy(0, -window.innerHeight);
        });
    </script>
</body>
</html>
    `;
}
